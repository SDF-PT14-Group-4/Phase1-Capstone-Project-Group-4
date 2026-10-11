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
