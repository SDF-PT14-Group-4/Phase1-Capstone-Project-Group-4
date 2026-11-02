"""User-written meals: private by default, optionally shared with everyone.

Every /me/custom-meals query filters by the user in the JWT, never by an id
sent from the client, so one user can never read or change another's meals.
"""

import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import select

from . import db
from .models import BasketItem, CustomMeal, FavoriteMeal, PlannedMeal, User

custom_meals = Blueprint("custom_meals", __name__)

MAX_CUSTOM_MEALS_PER_USER = 100
MAX_INGREDIENTS = 20  # matches the strIngredient1..20 shape the meal page already reads
CUSTOM_ID_PATTERN = re.compile(r"^custom-(\d{1,9})$")
IMAGE_PATTERN = re.compile(r"^https?://[^\s<>\"']+$", re.IGNORECASE)


def error(message, code, status):
    return jsonify({"error": {"code": code, "message": message}}), status


def json_object():
    body = request.get_json(silent=True)
    return body if isinstance(body, dict) else None


def current_user_id():
    return int(get_jwt_identity())


def _short_text(value, limit, required=False):
    """Return the stripped string, or None when it is invalid."""
    if value is None:
        value = ""
    if not isinstance(value, str):
        return None
    value = value.strip()
    if required and not value:
        return None
    if len(value) > limit:
        return None
    return value


def parse_custom_meal(body):
    """Validate a create/update body. Returns (fields, message)."""
    if body is None:
        return None, "A JSON request body is required."

    name = _short_text(body.get("name"), 255, required=True)
    if name is None:
        return None, "Meal name is required and must be 255 characters or fewer."
    category = _short_text(body.get("category"), 120)
    cuisine = _short_text(body.get("cuisine"), 120)
    if category is None or cuisine is None:
        return None, "Category and cuisine must be 120 characters or fewer."

    image = _short_text(body.get("image"), 500)
    if image is None or (image and not IMAGE_PATTERN.fullmatch(image)):
        return None, "Image must be a web address starting with http:// or https://."

    instructions = _short_text(body.get("instructions"), 5000)
    if instructions is None:
        return None, "Instructions must be 5000 characters or fewer."

    raw_ingredients = body.get("ingredients", [])
    if not isinstance(raw_ingredients, list) or len(raw_ingredients) > MAX_INGREDIENTS:
        return None, f"Ingredients must be a list of at most {MAX_INGREDIENTS} items."
    ingredients = []
    for item in raw_ingredients:
        if isinstance(item, str):
            item = {"ingredient": item}
        if not isinstance(item, dict):
            return None, "Each ingredient needs a name."
        ingredient = _short_text(item.get("ingredient"), 100, required=True)
        measure = _short_text(item.get("measure"), 100)
        if ingredient is None or measure is None:
            return None, "Each ingredient needs a name (100 characters or fewer) and an optional measure."
        ingredients.append({"ingredient": ingredient, "measure": measure})

    is_public = body.get("isPublic", False)
    if not isinstance(is_public, bool):
        return None, "isPublic must be true or false."

    return {
        "name": name,
        "category": category,
        "cuisine": cuisine,
        "image": image,
        "instructions": instructions,
        "ingredients": ingredients,
        "is_public": is_public,
    }, None


def meal_key(meal):
    return f"custom-{meal.id}"


def mealdb_shape(meal):
    """The TheMealDB-style object the meal page, planner and favorites already understand."""
    shaped = {
        "idMeal": meal_key(meal),
        "strMeal": meal.name,
        "strMealThumb": meal.image,
        "strCategory": meal.category or "Custom",
        "strArea": meal.cuisine,
        "strInstructions": meal.instructions,
        "isCustom": True,
    }
    for index, item in enumerate(meal.ingredients or [], start=1):
        shaped[f"strIngredient{index}"] = item.get("ingredient", "")
        shaped[f"strMeasure{index}"] = item.get("measure", "")
    return shaped


def serialize_custom_meal(meal, include_owner=False):
    data = {
        "id": meal.id,
        "mealId": meal_key(meal),
        "name": meal.name,
        "category": meal.category,
        "cuisine": meal.cuisine,
        "image": meal.image,
        "ingredients": meal.ingredients or [],
        "instructions": meal.instructions,
        "isPublic": meal.is_public,
        "createdAt": meal.created_at.isoformat(),
        "updatedAt": meal.updated_at.isoformat(),
        "mealData": mealdb_shape(meal),
    }
    if include_owner:
        owner = meal.user
        data["ownerName"] = (owner.display_name if owner and owner.display_name else "A GlobalTaste cook")
    return data


def find_visible_meal(meal_id, user_id=None):
    """A meal the caller may see: their own, or anyone's public one."""
    meal = db.session.get(CustomMeal, meal_id)
    if meal is None or not (meal.is_public or (user_id is not None and meal.user_id == user_id)):
        return None
    return meal


def resolve_meal_fields(fields, user_id):
    """For ids like "custom-12", replace client data with the stored meal.

    Returns None when the custom meal does not exist or is someone else's private meal.
    Non-custom meals pass through untouched.
    """
    match = CUSTOM_ID_PATTERN.fullmatch(fields["meal_id"])
    if match is None:
        return fields
    meal = find_visible_meal(int(match.group(1)), user_id)
    if meal is None:
        return None
    return {
        "meal_id": meal_key(meal),
        "name": meal.name,
        "image": meal.image,
        "category": meal.category or "Custom",
        "cuisine": meal.cuisine,
        "meal_data": mealdb_shape(meal),
    }


def _owned_meal(meal_id):
    meal = db.session.get(CustomMeal, meal_id)
    if meal is None or meal.user_id != current_user_id():
        return None  # same answer for "missing" and "not yours"
    return meal


@custom_meals.get("/me/custom-meals")
@jwt_required()
def list_my_custom_meals():
    meals = db.session.scalars(
        select(CustomMeal).where(CustomMeal.user_id == current_user_id()).order_by(CustomMeal.created_at.desc(), CustomMeal.id.desc())
    ).all()
    return jsonify({"meals": [serialize_custom_meal(meal) for meal in meals]})


@custom_meals.post("/me/custom-meals")
@jwt_required()
def create_custom_meal():
    fields, message = parse_custom_meal(json_object())
    if fields is None:
        return error(message, "INVALID_CUSTOM_MEAL", 400)
    user_id = current_user_id()
    existing = db.session.query(CustomMeal).filter_by(user_id=user_id).count()
    if existing >= MAX_CUSTOM_MEALS_PER_USER:
        return error(f"You can keep up to {MAX_CUSTOM_MEALS_PER_USER} custom meals.", "CUSTOM_MEAL_LIMIT", 400)
    meal = CustomMeal(user_id=user_id, **fields)
    db.session.add(meal)
    db.session.commit()
    return jsonify({"meal": serialize_custom_meal(meal)}), 201


@custom_meals.get("/me/custom-meals/<int:meal_id>")
@jwt_required()
def get_my_custom_meal(meal_id):
    meal = _owned_meal(meal_id)
    if meal is None:
        return error("Custom meal not found.", "NOT_FOUND", 404)
    return jsonify({"meal": serialize_custom_meal(meal)})


@custom_meals.put("/me/custom-meals/<int:meal_id>")
@jwt_required()
def update_custom_meal(meal_id):
    meal = _owned_meal(meal_id)
    if meal is None:
        return error("Custom meal not found.", "NOT_FOUND", 404)
    fields, message = parse_custom_meal(json_object())
    if fields is None:
        return error(message, "INVALID_CUSTOM_MEAL", 400)
    for key, value in fields.items():
        setattr(meal, key, value)
    db.session.commit()
    return jsonify({"meal": serialize_custom_meal(meal)})


@custom_meals.delete("/me/custom-meals/<int:meal_id>")
@jwt_required()
def delete_custom_meal(meal_id):
    meal = _owned_meal(meal_id)
    if meal is None:
        return error("Custom meal not found.", "NOT_FOUND", 404)
    key = meal_key(meal)
    # The meal stops existing, so planner/favorite/basket entries pointing at it go too.
    for model in (PlannedMeal, FavoriteMeal, BasketItem):
        db.session.query(model).filter_by(meal_id=key).delete()
    db.session.delete(meal)
    db.session.commit()
    return "", 204


@custom_meals.get("/custom-meals")
def list_public_custom_meals():
    """Meals other cooks chose to share. No login needed to browse."""
    query = select(CustomMeal).where(CustomMeal.is_public.is_(True))
    search = request.args.get("q", "").strip()
    if len(search) > 120:
        return error("Search query must be 120 characters or fewer.", "INVALID_QUERY", 400)
    if search:
        escaped = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        query = query.where(CustomMeal.name.ilike(f"%{escaped}%", escape="\\"))
    try:
        limit = min(max(int(request.args.get("limit", 30)), 1), 50)
    except ValueError:
        return error("limit must be a number.", "INVALID_QUERY", 400)
    meals = db.session.scalars(query.order_by(CustomMeal.created_at.desc(), CustomMeal.id.desc()).limit(limit)).all()
    return jsonify({"meals": [serialize_custom_meal(meal, include_owner=True) for meal in meals]})


@custom_meals.get("/custom-meals/<int:meal_id>")
@jwt_required(optional=True)
def get_custom_meal(meal_id):
    identity = get_jwt_identity()
    meal = find_visible_meal(meal_id, int(identity) if identity is not None else None)
    if meal is None:
        return error("Custom meal not found.", "NOT_FOUND", 404)
    return jsonify({"meal": serialize_custom_meal(meal, include_owner=True)})
