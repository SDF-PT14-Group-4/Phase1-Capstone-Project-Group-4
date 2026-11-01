from datetime import timedelta

import pytest
from flask_jwt_extended import create_access_token

from app import create_app, db
from app.models import PlannedMeal, User

PASSWORD = "correct horse battery"


def register(client, email, password=PASSWORD):
    response = client.post("/api/auth/register", json={"email": email, "password": password})
    assert response.status_code == 201, response.json
    return response.json


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def login(client, email, password):
    return client.post("/api/auth/login", json={"email": email, "password": password})


# ------------------------------------------------------------------ secrets --

class TestSecrets:
    def test_production_refuses_to_start_without_secrets(self, monkeypatch):
        monkeypatch.delenv("SECRET_KEY", raising=False)
        monkeypatch.delenv("JWT_SECRET_KEY", raising=False)
        monkeypatch.delenv("FLASK_DEBUG", raising=False)
        with pytest.raises(RuntimeError, match="SECRET_KEY"):
            create_app({"SQLALCHEMY_DATABASE_URI": "sqlite://"})

    def test_production_refuses_placeholder_secrets(self, monkeypatch):
        monkeypatch.delenv("FLASK_DEBUG", raising=False)
        with pytest.raises(RuntimeError, match="JWT_SECRET_KEY"):
            create_app({
                "SQLALCHEMY_DATABASE_URI": "sqlite://",
                "SECRET_KEY": "a-real-secret-key-that-is-long-enough-1234",
                "JWT_SECRET_KEY": "development-only-change-me",
            })

    def test_production_starts_with_real_secrets(self, monkeypatch):
        monkeypatch.delenv("FLASK_DEBUG", raising=False)
        app = create_app({
            "SQLALCHEMY_DATABASE_URI": "sqlite://",
            "SECRET_KEY": "a-real-secret-key-that-is-long-enough-1234",
            "JWT_SECRET_KEY": "another-real-secret-that-is-long-enough-5678",
        })
        assert app.config["JWT_SECRET_KEY"] == "another-real-secret-that-is-long-enough-5678"

    def test_development_generates_temporary_secrets(self, monkeypatch):
        monkeypatch.delenv("SECRET_KEY", raising=False)
        monkeypatch.delenv("JWT_SECRET_KEY", raising=False)
        monkeypatch.setenv("FLASK_DEBUG", "1")
        app = create_app({"SQLALCHEMY_DATABASE_URI": "sqlite://"})
        assert len(app.config["SECRET_KEY"]) >= 32
        assert app.config["SECRET_KEY"] != app.config["JWT_SECRET_KEY"]


# ---------------------------------------------------------------- passwords --

class TestPasswordRules:
    @pytest.mark.parametrize("password", [
        "short1!",              # too short
        "a" * 9,                # nine characters
        "x" * 129,              # too long
        "aaaaaaaaaaaa",         # one repeated character
        "1234567890",           # common
        "password123",          # common
        "abcdefghijkl",         # letters only
        "12345678901234",       # digits only
        "person.example1",      # contains the email name ("person")
    ])
    def test_weak_passwords_are_rejected(self, client, password):
        response = client.post(
            "/api/auth/register", json={"email": "person@example.com", "password": password}
        )
        assert response.status_code == 400
        assert response.json["error"]["code"] == "INVALID_PASSWORD"

    def test_passphrase_is_accepted(self, client):
        register(client, "person@example.com", "purple tractor sings")

    def test_non_string_password_is_rejected(self, client):
        response = client.post("/api/auth/register", json={"email": "p@example.com", "password": 12345678901})
        assert response.status_code == 400


# ------------------------------------------------------------ lockout / rate --

class TestRateLimiting:
    def test_repeated_failures_lock_the_account_out(self, client):
        register(client, "target@example.com")
        for _ in range(5):
            assert login(client, "target@example.com", "wrong password!").status_code == 401

        locked = login(client, "target@example.com", PASSWORD)  # even the right password
        assert locked.status_code == 429
        assert locked.json["error"]["code"] == "TOO_MANY_ATTEMPTS"
        assert "Retry-After" in locked.headers

    def test_unknown_emails_are_limited_the_same_way(self, client):
        for _ in range(5):
            assert login(client, "ghost@example.com", "whatever password").status_code == 401
        assert login(client, "ghost@example.com", "whatever password").status_code == 429

    def test_failure_response_does_not_reveal_whether_the_account_exists(self, client):
        register(client, "real@example.com")
        known = login(client, "real@example.com", "wrong password!")
        unknown = login(client, "nobody@example.com", "wrong password!")
        assert known.status_code == unknown.status_code == 401
        assert known.json == unknown.json
        assert known.json["error"]["message"] == "Email or password is incorrect."

    def test_success_resets_the_failure_count(self, client):
        register(client, "reset@example.com")
        for _ in range(4):
            login(client, "reset@example.com", "wrong password!")
        assert login(client, "reset@example.com", PASSWORD).status_code == 200
        for _ in range(4):
            assert login(client, "reset@example.com", "wrong password!").status_code == 401

    def test_other_accounts_are_not_locked_by_someone_elses_failures(self, client):
        register(client, "victim@example.com")
        register(client, "bystander@example.com")
        for _ in range(5):
            login(client, "victim@example.com", "wrong password!")
        assert login(client, "bystander@example.com", PASSWORD).status_code == 200

    def test_registration_is_rate_limited(self, app, client):
        app.config["REGISTER_LIMIT"] = 2
        register(client, "one@example.com")
        register(client, "two@example.com")
        blocked = client.post("/api/auth/register", json={"email": "three@example.com", "password": PASSWORD})
        assert blocked.status_code == 429


# ------------------------------------------------------------------- tokens --

class TestSessions:
    def test_logout_revokes_the_token(self, client):
        token = register(client, "out@example.com")["accessToken"]
        assert client.get("/api/me", headers=bearer(token)).status_code == 200

        assert client.post("/api/auth/logout", headers=bearer(token)).status_code == 204

        after = client.get("/api/me", headers=bearer(token))
        assert after.status_code == 401
        assert after.json["error"]["code"] == "TOKEN_REVOKED"

    def test_logout_only_ends_that_session(self, client):
        first = register(client, "multi@example.com")["accessToken"]
        second = login(client, "multi@example.com", PASSWORD).json["accessToken"]
        client.post("/api/auth/logout", headers=bearer(first))
        assert client.get("/api/me", headers=bearer(second)).status_code == 200

    def test_logout_requires_a_token(self, client):
        assert client.post("/api/auth/logout").status_code == 401

    def test_expired_token_gets_a_clear_401(self, client):
        register(client, "late@example.com")
        user = db.session.scalar(db.select(User))
        token = create_access_token(
            identity=str(user.id), expires_delta=timedelta(seconds=-5), additional_claims={"tv": 0}
        )
        response = client.get("/api/me", headers=bearer(token))
        assert response.status_code == 401
        assert response.json["error"]["code"] == "TOKEN_EXPIRED"

    def test_missing_token_gets_a_clear_401(self, client):
        response = client.get("/api/me/favorites")
        assert response.status_code == 401
        assert response.json["error"]["code"] == "AUTH_REQUIRED"

    def test_tampered_token_is_rejected(self, client):
        token = register(client, "tamper@example.com")["accessToken"]
        header, payload, signature = token.split(".")
        flipped = ("A" if signature[0] != "A" else "B") + signature[1:]
        response = client.get("/api/me", headers=bearer(f"{header}.{payload}.{flipped}"))
        assert response.status_code == 401
        assert response.json["error"]["code"] == "TOKEN_INVALID"

    def test_token_for_a_deleted_user_is_rejected(self, client):
        token = register(client, "gone@example.com")["accessToken"]
        db.session.delete(db.session.scalar(db.select(User)))
        db.session.commit()
        assert client.get("/api/me", headers=bearer(token)).status_code == 401


# ------------------------------------------------------------------ profile --

class TestProfile:
    def test_profile_includes_stats(self, client, auth_headers):
        client.post("/api/me/favorites", json={"mealId": "1", "name": "Soup"}, headers=auth_headers)
        client.post("/api/me/planner", json={"day": "monday", "meal": {"mealId": "1", "name": "Soup"}}, headers=auth_headers)
        client.post("/api/me/basket", json={"mealId": "1", "name": "Soup", "price": 5}, headers=auth_headers)

        profile = client.get("/api/me", headers=auth_headers).json
        assert profile["email"] == "person@example.com"
        assert profile["stats"] == {"favorites": 1, "plannedMeals": 1, "basketItems": 1, "customMeals": 0}
        assert profile["displayName"] is None
        assert profile["dietaryPreferences"] == []
        assert "password" not in str(profile).lower()

    def test_update_display_name_and_preferences(self, client, auth_headers):
        response = client.patch(
            "/api/me",
            json={"displayName": "  Ada   Lovelace ", "dietaryPreferences": ["vegan", "halal", "vegan"]},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json["displayName"] == "Ada Lovelace"
        assert response.json["dietaryPreferences"] == ["vegan", "halal"]
        assert client.get("/api/me", headers=auth_headers).json["displayName"] == "Ada Lovelace"

    def test_clearing_the_display_name(self, client, auth_headers):
        client.patch("/api/me", json={"displayName": "Ada"}, headers=auth_headers)
        cleared = client.patch("/api/me", json={"displayName": ""}, headers=auth_headers)
        assert cleared.json["displayName"] is None

    @pytest.mark.parametrize("body", [
        {"displayName": "x" * 61},
        {"displayName": 12},
        {"displayName": "bad\x00name"},
        {"dietaryPreferences": ["carnivore"]},
        {"dietaryPreferences": "vegan"},
        {"dietaryPreferences": [1]},
    ])
    def test_invalid_profile_updates_are_rejected(self, client, auth_headers, body):
        assert client.patch("/api/me", json=body, headers=auth_headers).status_code == 400

    def test_profile_requires_login(self, client):
        assert client.get("/api/me").status_code == 401
        assert client.patch("/api/me", json={"displayName": "x"}).status_code == 401


class TestChangePassword:
    def test_requires_the_current_password(self, client, auth_headers):
        response = client.post(
            "/api/me/password",
            json={"currentPassword": "not my password", "newPassword": "a brand new passphrase 9"},
            headers=auth_headers,
        )
        assert response.status_code == 400
        assert response.json["error"]["code"] == "INVALID_CURRENT_PASSWORD"

    def test_new_password_must_meet_the_rules(self, client, auth_headers):
        response = client.post(
            "/api/me/password",
            json={"currentPassword": PASSWORD, "newPassword": "short1"},
            headers=auth_headers,
        )
        assert response.status_code == 400
        assert response.json["error"]["code"] == "INVALID_PASSWORD"

    def test_new_password_must_differ(self, client, auth_headers):
        response = client.post(
            "/api/me/password", json={"currentPassword": PASSWORD, "newPassword": PASSWORD}, headers=auth_headers
        )
        assert response.status_code == 400

    def test_change_ends_other_sessions_and_keeps_the_current_one(self, client, auth_headers):
        other_device = login(client, "person@example.com", PASSWORD).json["accessToken"]
        response = client.post(
            "/api/me/password",
            json={"currentPassword": PASSWORD, "newPassword": "a brand new passphrase 9"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        fresh = response.json["accessToken"]

        assert client.get("/api/me", headers=bearer(fresh)).status_code == 200
        assert client.get("/api/me", headers=auth_headers).status_code == 401
        assert client.get("/api/me", headers=bearer(other_device)).status_code == 401

        assert login(client, "person@example.com", PASSWORD).status_code == 401
        assert login(client, "person@example.com", "a brand new passphrase 9").status_code == 200

    def test_wrong_current_password_attempts_are_limited(self, client, auth_headers):
        for _ in range(5):
            client.post(
                "/api/me/password",
                json={"currentPassword": "guess", "newPassword": "a brand new passphrase 9"},
                headers=auth_headers,
            )
        blocked = client.post(
            "/api/me/password",
            json={"currentPassword": PASSWORD, "newPassword": "a brand new passphrase 9"},
            headers=auth_headers,
        )
        assert blocked.status_code == 429


class TestDeleteAccount:
    def test_requires_the_password(self, client, auth_headers):
        assert client.delete("/api/me", json={"password": "wrong"}, headers=auth_headers).status_code == 400
        assert client.delete("/api/me", headers=auth_headers).status_code == 400
        assert client.get("/api/me", headers=auth_headers).status_code == 200

    def test_deletes_the_account_and_everything_it_owns(self, client, auth_headers):
        client.post("/api/me/favorites", json={"mealId": "1", "name": "Soup"}, headers=auth_headers)
        client.post("/api/me/planner", json={"day": "friday", "meal": {"mealId": "1", "name": "Soup"}}, headers=auth_headers)
        client.post("/api/me/custom-meals", json={"name": "Mine"}, headers=auth_headers)

        assert client.delete("/api/me", json={"password": PASSWORD}, headers=auth_headers).status_code == 204

        assert client.get("/api/me", headers=auth_headers).status_code == 401
        assert login(client, "person@example.com", PASSWORD).status_code == 401
        assert db.session.query(User).count() == 0
        assert db.session.query(PlannedMeal).count() == 0

    def test_other_users_data_is_untouched(self, client, auth_headers):
        other = register(client, "keeper@example.com")["accessToken"]
        client.post("/api/me/favorites", json={"mealId": "9", "name": "Pie"}, headers=bearer(other))
        client.delete("/api/me", json={"password": PASSWORD}, headers=auth_headers)
        favorites = client.get("/api/me/favorites", headers=bearer(other)).json["favorites"]
        assert [meal["mealId"] for meal in favorites] == ["9"]


# ------------------------------------------------------------- custom meals --

SALAD = {
    "name": "Guacamole Salad",
    "category": "Salad",
    "cuisine": "Mexican",
    "image": "https://example.com/salad.jpg",
    "ingredients": [{"ingredient": "Avocado", "measure": "2"}, {"ingredient": "Lime", "measure": "1"}],
    "instructions": "Mash and mix.",
    "isPublic": False,
}


class TestCustomMeals:
    def test_full_crud_for_the_owner(self, client, auth_headers):
        created = client.post("/api/me/custom-meals", json=SALAD, headers=auth_headers)
        assert created.status_code == 201
        meal = created.json["meal"]
        assert meal["mealId"] == f"custom-{meal['id']}"
        assert meal["isPublic"] is False
        assert meal["mealData"]["strIngredient1"] == "Avocado"
        assert meal["mealData"]["strMeasure2"] == "1"

        listed = client.get("/api/me/custom-meals", headers=auth_headers).json["meals"]
        assert [item["id"] for item in listed] == [meal["id"]]

        fetched = client.get(f"/api/me/custom-meals/{meal['id']}", headers=auth_headers)
        assert fetched.json["meal"]["name"] == "Guacamole Salad"

        updated = client.put(
            f"/api/me/custom-meals/{meal['id']}",
            json={**SALAD, "name": "Better Salad", "isPublic": True},
            headers=auth_headers,
        )
        assert updated.status_code == 200
        assert updated.json["meal"]["name"] == "Better Salad"
        assert updated.json["meal"]["isPublic"] is True

        assert client.delete(f"/api/me/custom-meals/{meal['id']}", headers=auth_headers).status_code == 204
        assert client.get(f"/api/me/custom-meals/{meal['id']}", headers=auth_headers).status_code == 404

    @pytest.mark.parametrize("override", [
        {"name": ""},
        {"name": "   "},
        {"name": "x" * 256},
        {"name": 5},
        {"image": "javascript:alert(1)"},
        {"image": "data:text/html;base64,AAAA"},
        {"image": "https://exa mple.com/a.png"},
        {"ingredients": "eggs"},
        {"ingredients": [{"measure": "1"}]},
        {"ingredients": [{"ingredient": "x" * 101}]},
        {"ingredients": [{"ingredient": "egg"}] * 21},
        {"instructions": "x" * 5001},
        {"isPublic": "yes"},
        {"category": "x" * 121},
    ])
    def test_invalid_meals_are_rejected(self, client, auth_headers, override):
        response = client.post("/api/me/custom-meals", json={**SALAD, **override}, headers=auth_headers)
        assert response.status_code == 400
        assert response.json["error"]["code"] == "INVALID_CUSTOM_MEAL"

    def test_malformed_json_is_rejected(self, client, auth_headers):
        response = client.post(
            "/api/me/custom-meals", data="{not json", content_type="application/json", headers=auth_headers
        )
        assert response.status_code == 400

    def test_minimal_meal_only_needs_a_name(self, client, auth_headers):
        response = client.post("/api/me/custom-meals", json={"name": "Toast"}, headers=auth_headers)
        assert response.status_code == 201
        assert response.json["meal"]["ingredients"] == []

    def test_requires_login(self, client):
        assert client.get("/api/me/custom-meals").status_code == 401
        assert client.post("/api/me/custom-meals", json=SALAD).status_code == 401

    def test_user_b_cannot_read_change_or_delete_user_a_meals(self, client, auth_headers):
        meal_id = client.post("/api/me/custom-meals", json=SALAD, headers=auth_headers).json["meal"]["id"]
        intruder = bearer(register(client, "intruder@example.com")["accessToken"])

        assert client.get("/api/me/custom-meals", headers=intruder).json["meals"] == []
        assert client.get(f"/api/me/custom-meals/{meal_id}", headers=intruder).status_code == 404
        assert client.put(f"/api/me/custom-meals/{meal_id}", json={**SALAD, "name": "Hacked"}, headers=intruder).status_code == 404
        assert client.delete(f"/api/me/custom-meals/{meal_id}", headers=intruder).status_code == 404

        untouched = client.get(f"/api/me/custom-meals/{meal_id}", headers=auth_headers).json["meal"]
        assert untouched["name"] == "Guacamole Salad"

    def test_private_meals_are_hidden_and_public_ones_are_shared(self, client, auth_headers):
        private_id = client.post("/api/me/custom-meals", json=SALAD, headers=auth_headers).json["meal"]["id"]
        public_id = client.post(
            "/api/me/custom-meals", json={**SALAD, "name": "Shared Stew", "isPublic": True}, headers=auth_headers
        ).json["meal"]["id"]
        client.patch("/api/me", json={"displayName": "Ada"}, headers=auth_headers)

        # Anyone, even logged out, can browse public meals - never the private one.
        public = client.get("/api/custom-meals").json["meals"]
        assert [item["id"] for item in public] == [public_id]
        assert public[0]["ownerName"] == "Ada"
        assert "person@example.com" not in str(public)

        assert client.get(f"/api/custom-meals/{public_id}").status_code == 200
        assert client.get(f"/api/custom-meals/{private_id}").status_code == 404

        stranger = bearer(register(client, "stranger@example.com")["accessToken"])
        assert client.get(f"/api/custom-meals/{private_id}", headers=stranger).status_code == 404
        assert client.get(f"/api/custom-meals/{private_id}", headers=auth_headers).status_code == 200

    def test_public_search_filters_by_name_and_escapes_wildcards(self, client, auth_headers):
        client.post("/api/me/custom-meals", json={"name": "Spicy Stew", "isPublic": True}, headers=auth_headers)
        client.post("/api/me/custom-meals", json={"name": "Mild Soup", "isPublic": True}, headers=auth_headers)
        assert [m["name"] for m in client.get("/api/custom-meals?q=stew").json["meals"]] == ["Spicy Stew"]
        assert client.get("/api/custom-meals?q=%25").json["meals"] == []

    def test_custom_meal_works_in_the_planner(self, client, auth_headers):
        meal = client.post("/api/me/custom-meals", json=SALAD, headers=auth_headers).json["meal"]
        added = client.post(
            "/api/me/planner",
            json={"day": "monday", "meal": {"mealId": meal["mealId"], "name": "client-supplied name"}},
            headers=auth_headers,
        )
        assert added.status_code == 201
        # The stored meal wins over whatever the client sent.
        assert added.json["name"] == "Guacamole Salad"

        planned = client.get("/api/me/planner", headers=auth_headers).json["planner"]["monday"]
        assert planned[0]["mealId"] == meal["mealId"]
        assert planned[0]["mealData"]["strIngredient1"] == "Avocado"

    def test_cannot_plan_someone_elses_private_meal(self, client, auth_headers):
        meal = client.post("/api/me/custom-meals", json=SALAD, headers=auth_headers).json["meal"]
        intruder = bearer(register(client, "sneaky@example.com")["accessToken"])
        for path, body in (
            ("/api/me/planner", {"day": "monday", "meal": {"mealId": meal["mealId"], "name": "x"}}),
            ("/api/me/favorites", {"mealId": meal["mealId"], "name": "x"}),
            ("/api/me/basket", {"mealId": meal["mealId"], "name": "x", "price": 1}),
        ):
            response = client.post(path, json=body, headers=intruder)
            assert response.status_code == 404, path
            assert response.json["error"]["code"] == "CUSTOM_MEAL_NOT_FOUND"

    def test_can_plan_a_public_meal_from_another_cook(self, client, auth_headers):
        meal = client.post("/api/me/custom-meals", json={**SALAD, "isPublic": True}, headers=auth_headers).json["meal"]
        other = bearer(register(client, "diner@example.com")["accessToken"])
        added = client.post(
            "/api/me/planner", json={"day": "tuesday", "meal": {"mealId": meal["mealId"], "name": "x"}}, headers=other
        )
        assert added.status_code == 201

    def test_unknown_custom_id_is_rejected(self, client, auth_headers):
        response = client.post(
            "/api/me/planner", json={"day": "monday", "meal": {"mealId": "custom-9999", "name": "Ghost"}}, headers=auth_headers
        )
        assert response.status_code == 404

    def test_regular_meals_are_unaffected(self, client, auth_headers):
        response = client.post(
            "/api/me/planner", json={"day": "monday", "meal": {"mealId": "52772", "name": "Teriyaki"}}, headers=auth_headers
        )
        assert response.status_code == 201
        assert response.json["name"] == "Teriyaki"

    def test_deleting_a_custom_meal_removes_it_from_planner_and_favorites(self, client, auth_headers):
        meal = client.post("/api/me/custom-meals", json=SALAD, headers=auth_headers).json["meal"]
        client.post("/api/me/planner", json={"day": "monday", "meal": {"mealId": meal["mealId"], "name": "x"}}, headers=auth_headers)
        client.post("/api/me/favorites", json={"mealId": meal["mealId"], "name": "x"}, headers=auth_headers)

        client.delete(f"/api/me/custom-meals/{meal['id']}", headers=auth_headers)

        planner = client.get("/api/me/planner", headers=auth_headers).json["planner"]
        assert planner["monday"] == []
        assert client.get("/api/me/favorites", headers=auth_headers).json["favorites"] == []

    def test_meal_count_is_capped(self, client, auth_headers, monkeypatch):
        monkeypatch.setattr("app.custom_meals.MAX_CUSTOM_MEALS_PER_USER", 2)
        for index in range(2):
            assert client.post("/api/me/custom-meals", json={"name": f"Meal {index}"}, headers=auth_headers).status_code == 201
        capped = client.post("/api/me/custom-meals", json={"name": "One too many"}, headers=auth_headers)
        assert capped.status_code == 400
        assert capped.json["error"]["code"] == "CUSTOM_MEAL_LIMIT"
