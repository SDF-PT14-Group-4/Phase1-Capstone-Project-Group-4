import pytest

from app import create_app, db


@pytest.fixture
def app():
    app = create_app({
        "TESTING": True,
        "SECRET_KEY": "test-secret-key-that-is-long-enough",
        "JWT_SECRET_KEY": "test-jwt-secret-key-that-is-long-enough",
        "SQLALCHEMY_DATABASE_URI": "sqlite://",
        "FRONTEND_ORIGIN": "http://localhost:5173",
    })
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "person@example.com", "password": "correct horse battery"},
    )
    return {"Authorization": f"Bearer {response.json['accessToken']}"}
