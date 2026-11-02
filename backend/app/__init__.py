import os

from flask import Flask, jsonify, render_template_string, request, url_for
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import IntegrityError


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def _int_env(name, default):
    try:
        return max(60, int(os.getenv(name, default)))
    except (TypeError, ValueError):
        return default


def create_app(test_config=None):
    from .security import ensure_secrets, register_jwt_handlers

    app = Flask(__name__)
    app.config.from_mapping(
        # No fallback values: ensure_secrets() below refuses to start without real ones.
        SECRET_KEY=os.getenv("SECRET_KEY"),
        JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY"),
        FLASK_DEBUG_ENV=os.getenv("FLASK_DEBUG", ""),
        SQLALCHEMY_DATABASE_URI=os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg://postgres:postgres@localhost:5432/globaltaste",
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        MEALDB_BASE_URL=os.getenv(
            "MEALDB_BASE_URL", "https://www.themealdb.com/api/json/v1/1"
        ),
        FRONTEND_ORIGIN=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
        JWT_ACCESS_TOKEN_EXPIRES=_int_env("JWT_ACCESS_TOKEN_EXPIRES_SECONDS", 3600),
    )
    if test_config:
        app.config.update(test_config)

    ensure_secrets(app)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    register_jwt_handlers(jwt)

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin")
        allowed_origins = app.config["FRONTEND_ORIGIN"]
        if isinstance(allowed_origins, str):
            allowed_origins = [
                o.strip().rstrip("/") for o in allowed_origins.split(",") if o.strip()
            ]
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response.headers.add("Vary", "Origin")
        return response

    from . import models  # noqa: F401
    from .routes import api, ADMIN_PAGE
    from .account import account
    from .custom_meals import custom_meals

    app.register_blueprint(api, url_prefix="/api")
    app.register_blueprint(account, url_prefix="/api")
    app.register_blueprint(custom_meals, url_prefix="/api")

    @app.get("/")
    def index():
        best = request.accept_mimetypes.best_match(["application/json", "text/html"])
        if best == "text/html":
            return render_template_string(
                ADMIN_PAGE,
                login_url=url_for("api.login"),
                customers_url=url_for("api.list_customers"),
            )
        return jsonify({
            "message": "Welcome to the GlobalTaste Backend",
            "status": "healthy",
            "version": "1.0.0",
        })

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        db.session.rollback()
        app.logger.warning("Database integrity constraint rejected a request: %s", error)
        return jsonify({"error": {"code": "CONFLICT", "message": "The request conflicts with existing data."}}), 409

    @app.errorhandler(404)
    def handle_not_found(_error):
        return jsonify({"error": {"code": "NOT_FOUND", "message": "The requested resource was not found."}}), 404

    @app.errorhandler(500)
    def handle_internal_error(_error):
        db.session.rollback()
        return jsonify({"error": {"code": "INTERNAL_ERROR", "message": "An unexpected server error occurred."}}), 500

    @app.cli.command("init-db")
    def init_db():
        """Create database tables for local development."""
        db.create_all()
        print("Database tables created.")

    return app