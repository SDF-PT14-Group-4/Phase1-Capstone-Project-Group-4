from decimal import Decimal, InvalidOperation
import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from sqlalchemy import select

from . import db
from .mealdb import MealServiceError, get_mealdb
from .models import BasketItem, FavoriteMeal, PlannedMeal, User

api = Blueprint("api", __name__)
WEEKDAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def error(message, code, status):
    return jsonify({"error": {"code": code, "message": message}}), status


def json_object():
    body = request.get_json(silent=True)
    return body if isinstance(body, dict) else None


def current_user():
    return db.session.get(User, int(get_jwt_identity()))


def serialize_meal(record):
    return {
        "mealId": record.meal_id,
        "name": record.name,
        "image": record.image,
        "category": record.category,
        "cuisine": record.cuisine,
        "mealData": record.meal_data,
    }


def meal_fields(body):
    meal = body.get("meal", body)
    if not isinstance(meal, dict):
        return None
    meal_id = meal.get("mealId", meal.get("idMeal", meal.get("id")))
    name = meal.get("name", meal.get("strMeal"))
    if not isinstance(meal_id, (str, int)) or not str(meal_id).strip() or len(str(meal_id)) > 64:
        return None
    if not isinstance(name, str) or not name.strip() or len(name.strip()) > 255:
        return None
    image = meal.get("image", meal.get("strMealThumb", meal.get("thumbnail", "")))
    category = meal.get("category", meal.get("strCategory", ""))
    cuisine = meal.get("cuisine", meal.get("strArea", ""))
    if not all(isinstance(value, str) for value in (image, category, cuisine)):
        return None
    return {
        "meal_id": str(meal_id).strip(),
        "name": name.strip(),
        "image": image,
        "category": category[:120],
        "cuisine": cuisine[:120],
        "meal_data": meal,
    }


def mealdb_response(path, params=None):
    try:
        return jsonify(get_mealdb(path, params))
    except MealServiceError:
        return error("The meal service is temporarily unavailable.", "UPSTREAM_UNAVAILABLE", 502)


@api.post("/auth/register")
def register():
    body = json_object()
    if body is None:
        return error("A JSON request body is required.", "INVALID_REQUEST", 400)
    email = body.get("email")
    password = body.get("password")
    if not isinstance(email, str) or len(email) > 254 or not EMAIL_PATTERN.fullmatch(email.strip()):
        return error("A valid email address is required.", "INVALID_EMAIL", 400)
    if not isinstance(password, str) or len(password) < 8 or len(password) > 128:
        return error("Password must be between 8 and 128 characters.", "INVALID_PASSWORD", 400)

    normalized_email = email.strip().lower()
    if db.session.scalar(select(User).where(User.email == normalized_email)):
        return error("An account with this email already exists.", "EMAIL_IN_USE", 409)

    user = User(email=normalized_email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({
        "accessToken": create_access_token(identity=str(user.id)),
        "user": {"id": user.id, "email": user.email},
    }), 201


@api.post("/auth/login")
def login():
    body = json_object()
    if body is None:
        return error("A JSON request body is required.", "INVALID_REQUEST", 400)
    email = body.get("email")
    password = body.get("password")
    if not isinstance(email, str) or not isinstance(password, str):
        return error("Email and password are required.", "INVALID_CREDENTIALS", 400)
    user = db.session.scalar(select(User).where(User.email == email.strip().lower()))
    if user is None or not user.check_password(password):
        return error("Email or password is incorrect.", "INVALID_CREDENTIALS", 401)
    return jsonify({
        "accessToken": create_access_token(identity=str(user.id)),
        "user": {"id": user.id, "email": user.email},
    })


@api.get("/me")
@jwt_required()
def profile():
    user = current_user()
    return jsonify({"id": user.id, "email": user.email, "createdAt": user.created_at.isoformat()})


@api.get("/me/favorites")
@jwt_required()
def list_favorites():
    meals = db.session.scalars(
        select(FavoriteMeal).where(FavoriteMeal.user_id == current_user().id).order_by(FavoriteMeal.created_at)
    ).all()
    return jsonify({"favorites": [serialize_meal(meal) for meal in meals]})


@api.post("/me/favorites")
@jwt_required()
def add_favorite():
    body = json_object()
    fields = meal_fields(body) if body else None
    if fields is None:
        return error("A valid meal is required.", "INVALID_MEAL", 400)
    user_id = current_user().id
    record = db.session.scalar(
        select(FavoriteMeal).where(
            FavoriteMeal.user_id == user_id, FavoriteMeal.meal_id == fields["meal_id"]
        )
    )
    if record is None:
        record = FavoriteMeal(user_id=user_id, **fields)
        db.session.add(record)
        db.session.commit()
    return jsonify(serialize_meal(record)), 201


@api.delete("/me/favorites/<string:meal_id>")
@jwt_required()
def remove_favorite(meal_id):
    record = db.session.scalar(
        select(FavoriteMeal).where(
            FavoriteMeal.user_id == current_user().id, FavoriteMeal.meal_id == meal_id
        )
    )
    if record is None:
        return error("Favorite meal not found.", "NOT_FOUND", 404)
    db.session.delete(record)
    db.session.commit()
    return "", 204


@api.get("/me/planner")
@jwt_required()
def get_planner():
    records = db.session.scalars(
        select(PlannedMeal).where(PlannedMeal.user_id == current_user().id).order_by(PlannedMeal.id)
    ).all()
    return jsonify({
        "planner": {
            day: [serialize_meal(record) for record in records if record.day == day]
            for day in WEEKDAYS
        }
    })


@api.post("/me/planner")
@jwt_required()
def add_planned_meal():
    body = json_object()
    if body is None:
        return error("A JSON request body is required.", "INVALID_REQUEST", 400)
    day = body.get("day")
    fields = meal_fields(body)
    if not isinstance(day, str) or day.lower() not in WEEKDAYS or fields is None:
        return error("A valid weekday and meal are required.", "INVALID_PLANNER_ENTRY", 400)
    day = day.lower()
    user_id = current_user().id
    record = db.session.scalar(
        select(PlannedMeal).where(
            PlannedMeal.user_id == user_id,
            PlannedMeal.day == day,
            PlannedMeal.meal_id == fields["meal_id"],
        )
    )
    if record is None:
        record = PlannedMeal(user_id=user_id, day=day, **fields)
        db.session.add(record)
        db.session.commit()
    return jsonify({"day": record.day, **serialize_meal(record)}), 201


@api.delete("/me/planner/<string:day>/<string:meal_id>")
@jwt_required()
def remove_planned_meal(day, meal_id):
    if day not in WEEKDAYS:
        return error("A valid weekday is required.", "INVALID_DAY", 400)
    record = db.session.scalar(
        select(PlannedMeal).where(
            PlannedMeal.user_id == current_user().id,
            PlannedMeal.day == day,
            PlannedMeal.meal_id == meal_id,
        )
    )
    if record is None:
        return error("Planned meal not found.", "NOT_FOUND", 404)
    db.session.delete(record)
    db.session.commit()
    return "", 204


@api.get("/me/basket")
@jwt_required()
def get_basket():
    records = db.session.scalars(
        select(BasketItem).where(BasketItem.user_id == current_user().id).order_by(BasketItem.id)
    ).all()
    total = sum((record.price * record.quantity for record in records), Decimal("0.00"))
    return jsonify({
        "items": [{
            **serialize_meal(record),
            "quantity": record.quantity,
            "price": float(record.price),
            "subtotal": float(record.price * record.quantity),
        } for record in records],
        "total": float(total),
        "currency": "KES",
    })


@api.post("/me/basket")
@jwt_required()
def add_basket_item():
    body = json_object()
    fields = meal_fields(body) if body else None
    if fields is None:
        return error("A valid meal is required.", "INVALID_MEAL", 400)
    try:
        quantity = body.get("quantity", 1)
        price = Decimal(str(body.get("price", 0)))
        if isinstance(quantity, bool) or not isinstance(quantity, int) or not 1 <= quantity <= 1000:
            raise ValueError
        if not price.is_finite() or price < 0 or price > Decimal("99999999.99"):
            raise ValueError
    except (InvalidOperation, ValueError):
        return error("Quantity must be an integer from 1 to 1000 and price must be nonnegative.", "INVALID_BASKET_ITEM", 400)

    user_id = current_user().id
    record = db.session.scalar(
        select(BasketItem).where(
            BasketItem.user_id == user_id, BasketItem.meal_id == fields["meal_id"]
        )
    )
    if record is None:
        record = BasketItem(user_id=user_id, quantity=quantity, price=price, **fields)
        db.session.add(record)
    else:
        record.quantity += quantity
    db.session.commit()
    return jsonify(serialize_basket_item(record)), 201


def serialize_basket_item(record):
    return {
        **serialize_meal(record),
        "quantity": record.quantity,
        "price": float(record.price),
        "subtotal": float(record.price * record.quantity),
    }


@api.patch("/me/basket/<string:meal_id>")
@jwt_required()
def update_basket_item(meal_id):
    body = json_object()
    quantity = body.get("quantity") if body else None
    if isinstance(quantity, bool) or not isinstance(quantity, int) or not 1 <= quantity <= 1000:
        return error("Quantity must be an integer from 1 to 1000.", "INVALID_QUANTITY", 400)
    record = db.session.scalar(
        select(BasketItem).where(
            BasketItem.user_id == current_user().id, BasketItem.meal_id == meal_id
        )
    )
    if record is None:
        return error("Basket item not found.", "NOT_FOUND", 404)
    record.quantity = quantity
    db.session.commit()
    return jsonify(serialize_basket_item(record))


@api.delete("/me/basket/<string:meal_id>")
@jwt_required()
def remove_basket_item(meal_id):
    record = db.session.scalar(
        select(BasketItem).where(
            BasketItem.user_id == current_user().id, BasketItem.meal_id == meal_id
        )
    )
    if record is None:
        return error("Basket item not found.", "NOT_FOUND", 404)
    db.session.delete(record)
    db.session.commit()
    return "", 204


@api.delete("/me/basket")
@jwt_required()
def clear_basket():
    db.session.query(BasketItem).filter_by(user_id=current_user().id).delete()
    db.session.commit()
    return "", 204


@api.get("/meals/search")
def search_meals():
    query = request.args.get("q", "").strip()
    if not query or len(query) > 120:
        return error("Search query must be between 1 and 120 characters.", "INVALID_QUERY", 400)
    return mealdb_response("search.php", {"s": query})


@api.get("/meals/categories")
def meal_categories():
    return mealdb_response("categories.php")


@api.get("/meals/cuisines")
def meal_cuisines():
    return mealdb_response("list.php", {"a": "list"})


@api.get("/meals/random")
def random_meal():
    return mealdb_response("random.php")


@api.get("/meals/<string:meal_id>")
def meal_details(meal_id):
    if not meal_id.isdigit() or len(meal_id) > 20:
        return error("A valid meal ID is required.", "INVALID_MEAL_ID", 400)
    return mealdb_response("lookup.php", {"i": meal_id})


@api.get("/meals/category/<path:category>")
def meals_by_category(category):
    if not category.strip() or len(category) > 120:
        return error("A valid category is required.", "INVALID_CATEGORY", 400)
    return mealdb_response("filter.php", {"c": category.strip()})


@api.get("/meals/cuisine/<path:cuisine>")
def meals_by_cuisine(cuisine):
    if not cuisine.strip() or len(cuisine) > 120:
        return error("A valid cuisine is required.", "INVALID_CUISINE", 400)
    return mealdb_response("filter.php", {"a": cuisine.strip()})
