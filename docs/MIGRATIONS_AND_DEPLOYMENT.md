# Migrations and Deployment (Task #9)

This guide covers how database migrations are created, checked and applied, and how the backend is configured on Render. See the main `README.md` (section 7.5) for general setup.

## 1. Migration workflow

Run these commands from the `backend` folder with the virtual environment active.

| Step | Command |
|------|---------|
| Create a migration after changing a model | `flask --app app:create_app db migrate -m "describe the change"` |
| Review the generated file in `migrations/versions/` | Check that it does only what you intended, and that it has a working `downgrade()` |
| Apply it locally | `flask --app app:create_app db upgrade` |
| Show the current head(s) | `flask --app app:create_app db heads` |

Rules:
- There must be exactly **one head**. If `db heads` prints two, two migrations were created at the same time. Merge them with `flask --app app:create_app db merge -m "merge heads" <rev1> <rev2>`.
- Never edit a migration that has already been merged to `main`. Create a new one instead.
- Never use `init-db` on production. It is only for disposable local databases.

## 2. How to test migrations on an empty database

This proves a brand-new database can be built from scratch. It needs a local PostgreSQL server. The commands assume the project's default user `postgres` with password `postgres`; change them if yours differ.

```bash
# 1. Create an empty test database
PGPASSWORD=postgres psql -U postgres -h localhost -c "CREATE DATABASE globaltaste_migtest;"

# 2. Point the app at it (FLASK_DEBUG=1 lets the app use temporary secrets locally)
cd backend
export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/globaltaste_migtest
export FLASK_DEBUG=1

# 3. Exactly one head
flask --app app:create_app db heads

# 4. Build everything from scratch
flask --app app:create_app db upgrade

# 5. Models and migrations must agree
python - <<'EOF'
from app import create_app, db
from alembic.migration import MigrationContext
from alembic.autogenerate import compare_metadata

app = create_app()
with app.app_context():
    with db.engine.connect() as conn:
        diff = compare_metadata(MigrationContext.configure(conn), db.metadata)
        print("DIFF:", diff if diff else "none - models and migrations agree")
EOF

# 6. Round trip: remove everything, then rebuild
flask --app app:create_app db downgrade base
flask --app app:create_app db upgrade

# 7. Clean up
PGPASSWORD=postgres psql -U postgres -h localhost -c "DROP DATABASE globaltaste_migtest;"
unset DATABASE_URL FLASK_DEBUG
```

### Result recorded on November 2, 2026

- One migration head: `5c1d7a90b3e4`.
- All four migrations applied from an empty database in order and created 9 tables: `users`, `favorite_meals`, `planned_meals`, `basket_items`, `admin_meals`, `custom_meals`, `revoked_tokens`, `rate_limit_events` and `alembic_version`.
- Models and migrations agreed (no missing migration).
- `downgrade base` removed all tables except `alembic_version`, and `upgrade` rebuilt all 9, so every migration has a working `downgrade()`.

## 3. Render configuration

| Setting | Value |
|---------|-------|
| Service type | Web service, Python 3 runtime |
| Branch | `main` (it was previously set to a leftover docs branch, which meant production ran old code) |
| Auto-Deploy | On commit |
| Start command | `flask --app "app:create_app" db upgrade && gunicorn "app:create_app()"` |
| Python version | Environment variable `PYTHON_VERSION=3.12.3`, to match the version the tests run on (Render defaults to a newer Python for services created after February 2026) |

Migrations are applied automatically on every deploy because `db upgrade` runs before gunicorn starts. A migration that fails stops the deploy, and Render keeps the previous version running.

### Required environment variables

Set these in Render under **Environment**. Never commit their values to git.

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Flask signing key. Long random value (at least 32 characters). |
| `JWT_SECRET_KEY` | Login token signing key. A different long random value. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `FRONTEND_ORIGIN` | Allowed frontend origin(s) for CORS, comma separated, no trailing slash. |
| `ADMIN_EMAILS` | Comma-separated emails that have admin access. |
| `PYTHON_VERSION` | Python version used to build and run the service. |

Generate a secret with:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

The app refuses to start in production when `SECRET_KEY` or `JWT_SECRET_KEY` is missing or still a placeholder value.

## 4. Release checklist

Before merging a change that includes a migration:

- [ ] `pytest` passes in `backend`
- [ ] `db heads` shows a single head
- [ ] The empty-database test above passes (steps 3 to 6)
- [ ] The migration has been reviewed and has a working `downgrade()`

After the deploy goes live:

- [ ] Render shows **Live** on the newest commit from `main`
- [ ] `curl -si https://phase1-capstone-project-group-4.onrender.com/api/me/favorites` returns `401` with `AUTH_REQUIRED`
- [ ] Logging in on the frontend works

## 5. Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| Deploy log ends with `RuntimeError: SECRET_KEY must be set...` | `SECRET_KEY` or `JWT_SECRET_KEY` is missing or a placeholder in Render's environment |
| Production behaves like an old version | Render is deploying a different branch, or Auto-Deploy is off |
| `db upgrade` fails with a multiple heads error | Two migrations share the same parent; merge them with `db merge` |
| CORS errors in the browser | `FRONTEND_ORIGIN` does not contain the exact frontend URL |
| Everyone is logged out after a deploy | `SECRET_KEY` or `JWT_SECRET_KEY` was changed; this is expected |
