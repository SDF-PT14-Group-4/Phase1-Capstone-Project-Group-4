"""Session, token and credential protections shared by the auth routes."""

import re
import secrets
from datetime import datetime, timedelta, timezone

from flask import jsonify, request
from flask_jwt_extended import create_access_token
from sqlalchemy import delete, func, select
from werkzeug.security import check_password_hash, generate_password_hash

from . import db
from .models import RateLimitEvent, RevokedToken, User

PLACEHOLDER_SECRETS = {
    "",
    "development-only-change-me",
    "replace-with-a-long-random-value",
    "replace-with-another-long-random-value",
    "replace_with_a_secure_random_value",
    "replace_with_a_separate_secure_random_value",
}

# Defaults can be overridden through app.config (tests lower them).
LOGIN_FAILURE_LIMIT = 5          # failed logins per email ...
LOGIN_IP_FAILURE_LIMIT = 30      # ... and per client address ...
LOGIN_WINDOW_SECONDS = 15 * 60   # ... inside this window
REGISTER_LIMIT = 10              # registrations per client address ...
REGISTER_WINDOW_SECONDS = 60 * 60
REAUTH_FAILURE_LIMIT = 5         # wrong current-password attempts per user

COMMON_PASSWORDS = {
    "password", "password1", "password12", "password123", "password1234",
    "1234567890", "12345678910", "qwertyuiop", "qwerty12345", "iloveyou123",
    "letmein1234", "welcome1234", "admin12345", "administrator", "changeme123",
    "abcdefghij", "abc1234567", "0123456789", "1q2w3e4r5t", "passw0rd123",
}


# ---------------------------------------------------------------- secrets --

def is_dev_mode(app):
    flag = str(app.config.get("FLASK_DEBUG_ENV", "")).strip().lower()
    return bool(app.config.get("TESTING")) or flag in {"1", "true", "yes", "on"}


def ensure_secrets(app):
    """Require real signing secrets; only development/testing may generate them.

    A production process with a missing or placeholder SECRET_KEY or
    JWT_SECRET_KEY refuses to start instead of silently signing tokens with a
    value that is public in the source code.
    """
    for name in ("SECRET_KEY", "JWT_SECRET_KEY"):
        value = app.config.get(name)
        if isinstance(value, str) and value.strip() and value.strip() not in PLACEHOLDER_SECRETS:
            if len(value) < 32 and not app.config.get("TESTING"):
                app.logger.warning("%s is shorter than 32 characters; use a longer random value.", name)
            continue
        if is_dev_mode(app):
            app.config[name] = secrets.token_urlsafe(48)
            app.logger.warning(
                "%s is not set; generated a temporary one. Sessions end when the server restarts.", name
            )
        else:
            raise RuntimeError(
                f"{name} must be set to a long random value (it is missing or a placeholder). "
                "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(48))\""
            )


# ----------------------------------------------------------------- tokens --

def issue_token(user):
    return create_access_token(identity=str(user.id), additional_claims={"tv": user.token_version})


def serialize_user(user):
    return {"id": user.id, "email": user.email, "displayName": user.display_name}


def session_response(user):
    return {"accessToken": issue_token(user), "user": serialize_user(user)}


def register_jwt_handlers(jwt):
    @jwt.token_in_blocklist_loader
    def is_token_revoked(_header, payload):
        if db.session.scalar(select(RevokedToken.id).where(RevokedToken.jti == payload.get("jti"))):
            return True
        try:
            user = db.session.get(User, int(payload["sub"]))
        except (KeyError, TypeError, ValueError):
            return True
        # A deleted account or a password change invalidates older tokens.
        return user is None or payload.get("tv", 0) != user.token_version

    def reject(code, message):
        return jsonify({"error": {"code": code, "message": message}}), 401

    @jwt.expired_token_loader
    def expired(_header, _payload):
        return reject("TOKEN_EXPIRED", "Your session has expired. Please log in again.")

    @jwt.invalid_token_loader
    def invalid(_reason):
        return reject("TOKEN_INVALID", "Your session is not valid. Please log in again.")

    @jwt.unauthorized_loader
    def missing(_reason):
        return reject("AUTH_REQUIRED", "Please log in to continue.")

    @jwt.revoked_token_loader
    def revoked(_header, _payload):
        return reject("TOKEN_REVOKED", "Your session has ended. Please log in again.")


def revoke_token(payload):
    expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    if not db.session.scalar(select(RevokedToken.id).where(RevokedToken.jti == payload["jti"])):
        db.session.add(RevokedToken(jti=payload["jti"], expires_at=expires_at))
    # Expired tokens no longer need to be remembered.
    db.session.execute(delete(RevokedToken).where(RevokedToken.expires_at < datetime.now(timezone.utc)))
    db.session.commit()


# ------------------------------------------------------------ rate limits --

def client_ip():
    """Client address as seen by the platform proxy (last X-Forwarded-For hop)."""
    hops = [hop.strip() for hop in request.headers.get("X-Forwarded-For", "").split(",") if hop.strip()]
    return hops[-1] if hops else (request.remote_addr or "unknown")


def _window(seconds):
    return datetime.now(timezone.utc) - timedelta(seconds=seconds)


def count_events(bucket, seconds):
    return db.session.scalar(
        select(func.count(RateLimitEvent.id)).where(
            RateLimitEvent.bucket == bucket, RateLimitEvent.created_at >= _window(seconds)
        )
    ) or 0


def record_event(bucket):
    db.session.add(RateLimitEvent(bucket=bucket))
    db.session.execute(delete(RateLimitEvent).where(RateLimitEvent.created_at < _window(24 * 60 * 60)))
    db.session.commit()


def clear_events(bucket):
    db.session.execute(delete(RateLimitEvent).where(RateLimitEvent.bucket == bucket))
    db.session.commit()


def too_many_requests(config, seconds_key="LOGIN_WINDOW_SECONDS", default_seconds=LOGIN_WINDOW_SECONDS):
    seconds = int(config.get(seconds_key, default_seconds))
    response = jsonify({
        "error": {
            "code": "TOO_MANY_ATTEMPTS",
            "message": f"Too many attempts. Please wait {max(1, seconds // 60)} minutes and try again.",
        }
    })
    response.status_code = 429
    response.headers["Retry-After"] = str(seconds)
    return response


# --------------------------------------------------------------- passwords --

_DUMMY_HASH = None


def burn_password_check(password):
    """Spend the same time as a real check so unknown emails are not detectable by timing."""
    global _DUMMY_HASH
    if _DUMMY_HASH is None:
        _DUMMY_HASH = generate_password_hash(secrets.token_urlsafe(16))
    check_password_hash(_DUMMY_HASH, password)


PASSWORD_RULES = (
    "Password must be 10 to 128 characters, include a letter and a number, symbol or space, "
    "and not be a common password or contain your email name."
)


def password_problem(password, email=""):
    """Return a short reason the password is rejected, or None when it is acceptable."""
    if not isinstance(password, str) or not 10 <= len(password) <= 128:
        return PASSWORD_RULES
    lowered = password.lower()
    if lowered in COMMON_PASSWORDS or len(set(lowered)) < 4:
        return PASSWORD_RULES
    if not re.search(r"[A-Za-z]", password) or not re.search(r"[^A-Za-z]", password):
        return PASSWORD_RULES
    local_part = email.split("@")[0].lower() if email else ""
    if len(local_part) >= 4 and local_part in lowered:
        return PASSWORD_RULES
    return None
