from unittest.mock import patch

from app.mealdb import MealServiceError


def test_health(client):
    assert client.get("/api/health").json == {"status": "ok"}


def test_register_login_and_profile(client):
    registered = client.post(
        "/api/auth/register",
        json={"email": "  PERSON@example.com ", "password": "correct horse battery"},
    )
    assert registered.status_code == 201
    assert registered.json["user"]["email"] == "person@example.com"
    assert "password" not in registered.json["user"]

    duplicate = client.post(
        "/api/auth/register",
        json={"email": "person@example.com", "password": "correct horse battery"},
    )
    assert duplicate.status_code == 409

    login = client.post(
        "/api/auth/login",
        json={"email": "PERSON@example.com", "password": "correct horse battery"},
    )
    profile = client.get(
        "/api/me", headers={"Authorization": f"Bearer {login.json['accessToken']}"}
    )
    assert profile.status_code == 200
    assert profile.json["email"] == "person@example.com"


def test_auth_rejects_invalid_credentials_and_protects_private_data(client):
    invalid = client.post(
        "/api/auth/register", json={"email": "bad", "password": "short"}
    )
    assert invalid.status_code == 400
    assert client.get("/api/me/favorites").status_code == 401

    response = client.post(
        "/api/auth/register",
        json={"email": "private@example.com", "password": "correct horse battery"},
    )
    headers = {"Authorization": f"Bearer {response.json['accessToken']}"}
    assert client.post(
        "/api/auth/login",
        json={"email": "private@example.com", "password": "wrong password"},
    ).status_code == 401
    assert client.get("/api/me/favorites", headers=headers).json == {"favorites": []}


def test_favorites_are_idempotent_and_user_scoped(client, auth_headers):
    meal = {"mealId": "52772", "name": "Teriyaki Chicken", "image": "https://example.test/meal.jpg"}
    assert client.post("/api/me/favorites", json=meal, headers=auth_headers).status_code == 201
    client.post("/api/me/favorites", json=meal, headers=auth_headers)
    assert len(client.get("/api/me/favorites", headers=auth_headers).json["favorites"]) == 1

    second = client.post(
        "/api/auth/register",
        json={"email": "second@example.com", "password": "correct horse battery"},
    )
    second_headers = {"Authorization": f"Bearer {second.json['accessToken']}"}
    assert client.get("/api/me/favorites", headers=second_headers).json == {"favorites": []}
    assert client.delete("/api/me/favorites/52772", headers=second_headers).status_code == 404
    assert client.delete("/api/me/favorites/52772", headers=auth_headers).status_code == 204


def test_planner_validates_days_deduplicates_and_removes(client, auth_headers):
    meal = {"mealId": "52772", "name": "Teriyaki Chicken"}
    invalid = client.post(
        "/api/me/planner", json={"day": "funday", "meal": meal}, headers=auth_headers
    )
    assert invalid.status_code == 400

    entry = {"day": "monday", "meal": meal}
    assert client.post("/api/me/planner", json=entry, headers=auth_headers).status_code == 201
    client.post("/api/me/planner", json=entry, headers=auth_headers)
    planner = client.get("/api/me/planner", headers=auth_headers).json["planner"]
    assert len(planner["monday"]) == 1
    assert planner["tuesday"] == []
    assert client.delete("/api/me/planner/monday/52772", headers=auth_headers).status_code == 204


def test_basket_quantities_totals_and_validation(client, auth_headers):
    meal = {"mealId": "52772", "name": "Teriyaki Chicken", "price": "10.50"}
    assert client.post("/api/me/basket", json=meal, headers=auth_headers).status_code == 201
    client.post("/api/me/basket", json=meal, headers=auth_headers)
    basket = client.get("/api/me/basket", headers=auth_headers).json
    assert basket["items"][0]["quantity"] == 2
    assert basket["items"][0]["subtotal"] == 21
    assert basket["total"] == 21

    assert client.patch(
        "/api/me/basket/52772", json={"quantity": 3}, headers=auth_headers
    ).json["subtotal"] == 31.5
    assert client.patch(
        "/api/me/basket/52772", json={"quantity": 0}, headers=auth_headers
    ).status_code == 400
    assert client.delete("/api/me/basket", headers=auth_headers).status_code == 204
    assert client.get("/api/me/basket", headers=auth_headers).json["total"] == 0


def test_planner_and_basket_are_isolated_between_accounts(client, auth_headers):
    meal = {"mealId": "52772", "name": "Teriyaki Chicken", "price": "10.50"}
    assert client.post(
        "/api/me/planner",
        json={"day": "monday", "meal": meal},
        headers=auth_headers,
    ).status_code == 201
    assert client.post("/api/me/basket", json=meal, headers=auth_headers).status_code == 201

    second = client.post(
        "/api/auth/register",
        json={"email": "second@example.com", "password": "correct horse battery"},
    )
    assert second.status_code == 201
    second_headers = {"Authorization": f"Bearer {second.json['accessToken']}"}

    assert client.get("/api/me/planner", headers=second_headers).json["planner"]["monday"] == []
    assert client.get("/api/me/basket", headers=second_headers).json["items"] == []
    assert client.delete(
        "/api/me/planner/monday/52772", headers=second_headers
    ).status_code == 404
    assert client.patch(
        "/api/me/basket/52772",
        json={"quantity": 3},
        headers=second_headers,
    ).status_code == 404
    assert client.delete(
        "/api/me/basket/52772", headers=second_headers
    ).status_code == 404
    assert client.delete("/api/me/basket", headers=second_headers).status_code == 204

    assert len(client.get("/api/me/planner", headers=auth_headers).json["planner"]["monday"]) == 1
    basket = client.get("/api/me/basket", headers=auth_headers).json
    assert basket["items"][0]["mealId"] == "52772"
    assert basket["items"][0]["quantity"] == 1


def test_meal_discovery_forwards_requests_to_themealdb(client):
    payload = {"meals": [{"idMeal": "52772", "strMeal": "Teriyaki Chicken"}]}
    with patch("app.routes.get_mealdb", return_value=payload) as upstream:
        response = client.get("/api/meals/search?q=teriyaki")
    assert response.status_code == 200
    assert response.json == payload
    upstream.assert_called_once_with("search.php", {"s": "teriyaki"})


def test_meal_discovery_validates_search_and_handles_upstream_failure(client):
    assert client.get("/api/meals/search").status_code == 400
    with patch("app.routes.get_mealdb", side_effect=MealServiceError("unavailable")):
        response = client.get("/api/meals/random")
    assert response.status_code == 502
    assert response.json["error"]["code"] == "UPSTREAM_UNAVAILABLE"

def test_admin_meal_endpoints_require_admin_access(client, auth_headers):
    # No token: access must be rejected.
    assert client.get("/api/admin/meals").status_code == 401

    # A normal authenticated user must not access admin functionality.
    response = client.get("/api/admin/meals", headers=auth_headers)
    assert response.status_code == 403

    response = client.post(
        "/api/admin/meals",
        json={"name": "Test Meal"},
        headers=auth_headers,
    )
    assert response.status_code == 403


def test_admin_can_create_list_update_and_delete_meals(client, monkeypatch):
    monkeypatch.setenv("ADMIN_EMAILS", "admin@example.com")

    registered = client.post(
        "/api/auth/register",
        json={
            "email": "admin@example.com",
            "password": "correct horse battery",
        },
    )
    assert registered.status_code == 201

    headers = {
        "Authorization": f"Bearer {registered.json['accessToken']}"
    }

    # Initially, the admin meal list should be empty.
    response = client.get("/api/admin/meals", headers=headers)
    assert response.status_code == 200
    assert response.json == {"meals": []}

    # Create a meal.
    response = client.post(
        "/api/admin/meals",
        headers=headers,
        json={
            "name": "Kenyan Pilau",
            "image": "https://example.test/pilau.jpg",
            "category": "Dinner",
            "cuisine": "Kenyan",
            "mealData": {"ingredients": ["rice", "beef", "spices"]},
        },
    )
    assert response.status_code == 201

    meal = response.json["meal"]
    meal_id = meal["id"]

    assert meal["name"] == "Kenyan Pilau"
    assert meal["category"] == "Dinner"

    # Confirm the meal appears in the list.
    response = client.get("/api/admin/meals", headers=headers)
    assert response.status_code == 200
    assert len(response.json["meals"]) == 1

    # Update the meal.
    response = client.put(
        f"/api/admin/meals/{meal_id}",
        headers=headers,
        json={
            "name": "Updated Kenyan Pilau",
            "image": "https://example.test/updated-pilau.jpg",
            "category": "Lunch",
            "cuisine": "Kenyan",
            "mealData": {"ingredients": ["rice", "beef"]},
        },
    )
    assert response.status_code == 200
    assert response.json["meal"]["name"] == "Updated Kenyan Pilau"

    # Delete the meal.
    response = client.delete(
        f"/api/admin/meals/{meal_id}",
        headers=headers,
    )
    assert response.status_code == 204

    # Confirm it has been removed.
    response = client.get("/api/admin/meals", headers=headers)
    assert response.json == {"meals": []}

def test_admin_meal_endpoints_validate_input_and_missing_records(client, monkeypatch):
    monkeypatch.setenv("ADMIN_EMAILS", "admin@example.com")

    registered = client.post(
        "/api/auth/register",
        json={
            "email": "admin@example.com",
            "password": "correct horse battery",
        },
    )
    headers = {
        "Authorization": f"Bearer {registered.json['accessToken']}"
    }

    # A meal without a name is invalid.
    invalid = client.post(
        "/api/admin/meals",
        headers=headers,
        json={"category": "Dinner"},
    )
    assert invalid.status_code == 400

    # Non-dictionary mealData is invalid.
    invalid = client.post(
        "/api/admin/meals",
        headers=headers,
        json={"name": "Test Meal", "mealData": "not an object"},
    )
    assert invalid.status_code == 400

    # Updating or deleting a meal that does not exist returns 404.
    assert client.put(
        "/api/admin/meals/9999",
        headers=headers,
        json={"name": "Missing Meal"},
    ).status_code == 404

    assert client.delete(
        "/api/admin/meals/9999",
        headers=headers,
    ).status_code == 404
