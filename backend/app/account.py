"""Logout, profile, password change and account deletion."""

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from sqlalchemy import func, select

from . import db
from .models import BasketItem, CustomMeal, FavoriteMeal, PlannedMeal, User
from .security import (
    REAUTH_FAILURE_LIMIT,
    LOGIN_WINDOW_SECONDS,
    clear_events,
    count_events,
    password_problem,
    record_event,
    revoke_token,
    session_response,
    too_many_requests,
)

account = Blueprint("account", __name__)

DIETARY_OPTIONS = (
    "vegetarian", "vegan", "pescatarian", "gluten-free", "dairy-free",
    "nut-free", "halal", "kosher", "low-carb",
)


def error(message, code, status):
    return jsonify({"error": {"code": code, "message": message}}), status


def json_object():
    body = request.get_json(silent=True)
    return body if isinstance(body, dict) else None


def current_user():
    return db.session.get(User, int(get_jwt_identity()))


def count_for(model, user_id):
    return db.session.scalar(select(func.count()).select_from(model).where(model.user_id == user_id)) or 0


def serialize_account(user):
    return {
        "id": user.id,
        "email": user.email,
        "createdAt": user.created_at.isoformat(),
        "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
        "displayName": user.display_name,
        "dietaryPreferences": user.dietary_preferences or [],
        "stats": {
            "favorites": count_for(FavoriteMeal, user.id),
            "plannedMeals": count_for(PlannedMeal, user.id),
            "basketItems": count_for(BasketItem, user.id),
            "customMeals": count_for(CustomMeal, user.id),
        },
    }


@account.post("/auth/logout")
@jwt_required()
def logout():
    """End this session on the server so the token cannot be reused."""
    revoke_token(get_jwt())
    return "", 204


@account.get("/me")
@jwt_required()
def profile():
    return jsonify(serialize_account(current_user()))


@account.patch("/me")
@jwt_required()
def update_profile():
    body = json_object()
    if body is None:
        return error("A JSON request body is required.", "INVALID_REQUEST", 400)
    user = current_user()

    if "displayName" in body:
        name = body["displayName"]
        if name is None:
            name = ""
        if not isinstance(name, str):
            return error("Display name must be text.", "INVALID_DISPLAY_NAME", 400)
        name = " ".join(name.split())
        if len(name) > 60 or any(ord(char) < 32 for char in name):
            return error("Display name must be 60 characters or fewer.", "INVALID_DISPLAY_NAME", 400)
        user.display_name = name or None

    if "dietaryPreferences" in body:
        preferences = body["dietaryPreferences"]
        if (
            not isinstance(preferences, list)
            or not all(isinstance(item, str) and item in DIETARY_OPTIONS for item in preferences)
        ):
            return error(
                "Dietary preferences must come from: " + ", ".join(DIETARY_OPTIONS) + ".",
                "INVALID_DIETARY_PREFERENCES",
                400,
            )
        user.dietary_preferences = [item for item in DIETARY_OPTIONS if item in preferences]

    db.session.commit()
    return jsonify(serialize_account(user))


def _check_current_password(user, password):
    """Re-authentication guard shared by password change and account deletion.

    Returns an error response, or None when the password is correct.
    """
    config = current_app.config
    bucket = f"reauth:user:{user.id}"
    window = config.get("LOGIN_WINDOW_SECONDS", LOGIN_WINDOW_SECONDS)
    if count_events(bucket, window) >= config.get("REAUTH_FAILURE_LIMIT", REAUTH_FAILURE_LIMIT):
        return too_many_requests(config, "LOGIN_WINDOW_SECONDS", LOGIN_WINDOW_SECONDS)
    if not isinstance(password, str) or not user.check_password(password):
        record_event(bucket)
        return error("Your current password is incorrect.", "INVALID_CURRENT_PASSWORD", 400)
    clear_events(bucket)
    return None


@account.post("/me/password")
@jwt_required()
def change_password():
    body = json_object()
    if body is None:
        return error("A JSON request body is required.", "INVALID_REQUEST", 400)
    user = current_user()

    failure = _check_current_password(user, body.get("currentPassword"))
    if failure is not None:
        return failure

    new_password = body.get("newPassword")
    problem = password_problem(new_password, user.email)
    if problem:
        return error(problem, "INVALID_PASSWORD", 400)
    if user.check_password(new_password):
        return error("Choose a password different from your current one.", "INVALID_PASSWORD", 400)

    user.set_password(new_password)
    # Every token issued so far (on any device) stops working; hand back a fresh one.
    user.token_version += 1
    db.session.commit()
    return jsonify(session_response(user))


@account.delete("/me")
@jwt_required()
def delete_account():
    body = json_object() or {}
    user = current_user()
    failure = _check_current_password(user, body.get("password"))
    if failure is not None:
        return failure
    # Favorites, planner, basket and custom meals are removed with the user
    # (ORM cascade plus ON DELETE CASCADE on the foreign keys).
    db.session.delete(user)
    db.session.commit()
    return "", 204
