import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import IntegrityError

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY=os.getenv("SECRET_KEY", "development-only-change-me"),
        JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "development-only-change-me"),
        SQLALCHEMY_DATABASE_URI=os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg://postgres:postgres@localhost:5432/globaltaste",
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        MEALDB_BASE_URL=os.getenv(
            "MEALDB_BASE_URL", "https://www.themealdb.com/api/json/v1/1"
        ),
        FRONTEND_ORIGIN=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
        JWT_ACCESS_TOKEN_EXPIRES=3600,
    )
    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, origins=app.config["FRONTEND_ORIGIN"])

    from . import models  # noqa: F401
    from .routes import api

    app.register_blueprint(api, url_prefix="/api")

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
