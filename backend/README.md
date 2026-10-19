# GlobalTaste Flask API

Flask REST API and PostgreSQL persistence for GlobalTaste meal discovery, accounts, favorites, weekly plans, and basket data.

## Requirements

- Python 3.10+
- PostgreSQL 14+

## Local setup

From this directory, create a virtual environment, install requirements, and configure the database:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
createdb globaltaste
```

Set `DATABASE_URL`, `SECRET_KEY`, and `JWT_SECRET_KEY` in `.env`. For local development, initialize the schema and start Flask:

```bash
flask --app app:create_app db upgrade
flask --app app:create_app run --debug
```

The API listens on `http://127.0.0.1:5000`. Set `FRONTEND_ORIGIN` to the exact frontend origin allowed to call it. Production deployments must use strong, unique secrets, HTTPS, and reviewed database migrations. `flask --app app:create_app init-db` is also available for disposable local databases but must not be used in production.

Run tests with:

```bash
pytest
```

Tests use an isolated in-memory SQLite database; production and local application data use PostgreSQL.

## API

All errors use `{"error":{"code":"...","message":"..."}}`. Meal discovery responses retain TheMealDB's response shape so the frontend can transition without changing its meal rendering model. Requests to TheMealDB use a bounded timeout and return `502 UPSTREAM_UNAVAILABLE` on connection, HTTP, or malformed-JSON errors.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create an account and return a JWT |
| POST | `/api/auth/login` | Authenticate and return a JWT |
| GET | `/api/me` | Return the authenticated account |
| GET | `/api/meals/search?q=...` | Search meals |
| GET | `/api/meals/categories` | List meal categories |
| GET | `/api/meals/cuisines` | List cuisines |
| GET | `/api/meals/random` | Get a random meal |
| GET | `/api/meals/<meal_id>` | Get recipe details |
| GET | `/api/meals/category/<category>` | List meals by category |
| GET | `/api/meals/cuisine/<cuisine>` | List meals by cuisine |
| GET, POST | `/api/me/favorites` | List or save a favorite meal |
| DELETE | `/api/me/favorites/<meal_id>` | Remove a favorite |
| GET, POST | `/api/me/planner` | Read the weekly plan or add a meal to a day |
| DELETE | `/api/me/planner/<day>/<meal_id>` | Remove a planned meal |
| GET, POST, DELETE | `/api/me/basket` | Read basket, add an item, or clear it |
| PATCH, DELETE | `/api/me/basket/<meal_id>` | Set quantity or remove an item |

Send `Authorization: Bearer <accessToken>` to `/api/me` and all `/api/me/*` endpoints. Registration/login JSON is `{"email":"...","password":"..."}`. Favorite JSON accepts a meal object with `mealId` (or TheMealDB `idMeal`) and `name` (or `strMeal`). Planner additions wrap the meal with its day, for example `{"day":"monday","meal":{"mealId":"52772","name":"Teriyaki Chicken"}}`. Basket additions accept the same meal fields plus an optional integer `quantity` and nonnegative `price` in KES; adding an existing meal increments its quantity.

Each saved record is owned by the authenticated account. PostgreSQL constraints enforce unique email, favorite, planner, and basket records as well as valid planner weekdays and positive basket quantities.
