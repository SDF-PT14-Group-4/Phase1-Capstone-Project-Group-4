
"""End-to-end API integration tests for core GlobalTaste user journeys."""

def register_and_login(client, email):
    """Register a user, log in, and return their bearer token."""
    password = "correct horse battery"

    registered = client.post(
        "/api/auth/register",
        json={"email": email, "password": password},
    )
    assert registered.status_code == 201

    login = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login.status_code == 200
    assert "accessToken" in login.json

    return {
        "Authorization": f"Bearer {login.json['accessToken']}"
    }


def test_complete_authenticated_user_journey(client):
    """Register, log in, save a favorite, plan a meal, and manage a basket."""
    headers = register_and_login(client, "journey@example.com")

    # 1. The authenticated user can access their profile.
    profile = client.get("/api/me", headers=headers)
    assert profile.status_code == 200
    assert profile.json["email"] == "journey@example.com"

    meal = {
        "mealId": "52772",
        "name": "Teriyaki Chicken",
        "price": 10.50,
    }

    # 2. Save and retrieve a favorite.
    saved = client.post(
        "/api/me/favorites", json=meal, headers=headers
    )
    assert saved.status_code == 201

    favorites = client.get("/api/me/favorites", headers=headers)
    assert favorites.status_code == 200
    assert len(favorites.json["favorites"]) == 1

    # 3. Add a meal to the weekly planner and retrieve it.
    planned = client.post(
        "/api/me/planner",
        json={"day": "monday", "meal": meal},
        headers=headers,
    )
    assert planned.status_code == 201

    planner = client.get("/api/me/planner", headers=headers)
    assert planner.status_code == 200
    assert len(planner.json["planner"]["monday"]) == 1

    # 4. Add a basket item and verify its total.
    added = client.post(
        "/api/me/basket", json=meal, headers=headers
    )
    assert added.status_code == 201

    basket = client.get("/api/me/basket", headers=headers)
    assert basket.status_code == 200
    assert basket.json["items"][0]["quantity"] == 1
    assert basket.json["total"] == 10.5

    # 5. Update the quantity and verify the recalculated total.
    updated = client.patch(
        "/api/me/basket/52772",
        json={"quantity": 2},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json["quantity"] == 2
    assert updated.json["subtotal"] == 21

    # 6. Remove the favorite, planned meal, and basket item.
    removed_favorite = client.delete(
        "/api/me/favorites/52772", headers=headers
    )
    assert removed_favorite.status_code == 204

    removed_plan = client.delete(
        "/api/me/planner/monday/52772", headers=headers
    )
    assert removed_plan.status_code == 204

    removed_basket_item = client.delete(
        "/api/me/basket/52772", headers=headers
    )
    assert removed_basket_item.status_code == 204

    # 7. Confirm the data was removed.
    assert client.get(
        "/api/me/favorites", headers=headers
    ).json["favorites"] == []

    assert client.get(
        "/api/me/planner", headers=headers
    ).json["planner"]["monday"] == []

    assert client.get(
        "/api/me/basket", headers=headers
    ).json["items"] == []


def test_planner_and_basket_are_isolated_between_users(client):
    """A second user must not see another user's private saved data."""
    first_user = register_and_login(client, "first@example.com")
    second_user = register_and_login(client, "second@example.com")

    meal = {
        "mealId": "52772",
        "name": "Teriyaki Chicken",
        "price": 15,
    }

    assert client.post(
        "/api/me/planner",
        json={"day": "monday", "meal": meal},
        headers=first_user,
    ).status_code == 201

    assert client.post(
        "/api/me/basket", json=meal, headers=first_user
    ).status_code == 201

    # The second user starts with an empty planner and basket.
    second_planner = client.get(
        "/api/me/planner", headers=second_user
    )
    assert second_planner.status_code == 200
    assert all(
        meals == []
        for meals in second_planner.json["planner"].values()
    )

    second_basket = client.get(
        "/api/me/basket", headers=second_user
    )
    assert second_basket.status_code == 200
    assert second_basket.json["items"] == []
    assert second_basket.json["total"] == 0

    # The first user's records remain intact.
    first_planner = client.get(
        "/api/me/planner", headers=first_user
    )
    assert len(first_planner.json["planner"]["monday"]) == 1

    first_basket = client.get(
        "/api/me/basket", headers=first_user
    )
    assert first_basket.json["total"] == 15


def test_private_endpoints_reject_missing_authentication(client):
    """Private user endpoints must reject requests without a JWT."""
    responses = [
        client.get("/api/me"),
        client.get("/api/me/favorites"),
        client.post(
            "/api/me/favorites",
            json={"mealId": "52772", "name": "Teriyaki Chicken"},
        ),
        client.get("/api/me/planner"),
        client.post(
            "/api/me/planner",
            json={
                "day": "monday",
                "meal": {
                    "mealId": "52772",
                    "name": "Teriyaki Chicken",
                },
            },
        ),
        client.get("/api/me/basket"),
        client.post(
            "/api/me/basket",
            json={"mealId": "52772", "name": "Teriyaki Chicken"},
        ),
    ]

    assert all(response.status_code == 401 for response in responses)
