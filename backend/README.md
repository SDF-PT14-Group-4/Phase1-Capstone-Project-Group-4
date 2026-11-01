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

Set `DATABASE_URL`, `SECRET_KEY`, and `JWT_SECRET_KEY` in `.env`. The two secrets must be long random values; generate each with `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Outside debug mode and tests the app **refuses to start** if either is missing or still a placeholder from `.env.example`. With `--debug` (or `FLASK_DEBUG=1`) it generates temporary secrets instead, so sessions end whenever the server restarts. For local development, initialize the schema and start Flask:

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
| POST | `/api/auth/register` | Create an account and return a JWT (rate limited, password rules apply) |
| POST | `/api/auth/login` | Authenticate and return a JWT (failed attempts are limited) |
| POST | `/api/auth/logout` | Revoke the current token on the server |
| GET, PATCH | `/api/me` | Read the account (details and stats) or update display name and dietary preferences |
| POST | `/api/me/password` | Change password; needs the current password and returns a new token |
| DELETE | `/api/me` | Delete the account and everything it owns; needs the password |
| GET, POST | `/api/me/custom-meals` | List or create your own meals |
| GET, PUT, DELETE | `/api/me/custom-meals/<id>` | Read, edit or delete one of your meals (owner only) |
| GET | `/api/custom-meals?q=...` | Browse meals other cooks made public (no login) |
| GET | `/api/custom-meals/<id>` | Read a public meal, or your own private one |
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

## Sessions, credentials and account security

- **Tokens.** Access tokens are JWTs that expire after `JWT_ACCESS_TOKEN_EXPIRES_SECONDS` (default 3600). Each carries a unique id and the user's `token_version`. Logging out stores the id in `revoked_tokens` so the token stops working immediately; changing the password bumps `token_version`, which ends every older session on every device. Deleting an account also invalidates its tokens.
- **Errors the client can act on.** Every authentication failure is a `401` with a code: `AUTH_REQUIRED`, `TOKEN_EXPIRED`, `TOKEN_INVALID` or `TOKEN_REVOKED`. The frontend logs the user out and explains why when it sees one.
- **Passwords.** 10 to 128 characters, at least one letter and one non-letter, not a common password, and not containing the email name. Hashes use Werkzeug's salted hashing. Login always answers `Email or password is incorrect.` and spends the same time whether or not the email exists.
- **Rate limiting.** Failed logins are counted per email (5) and per client address (30) in a 15-minute window and then answered with `429 TOO_MANY_ATTEMPTS` and a `Retry-After` header; a successful login clears the email's count. Registrations are limited per address (10 per hour). Wrong current-password attempts on the password and delete-account endpoints are limited per user. Counts live in the `rate_limit_events` table, so they are shared by all server processes and survive restarts. Because lockout is per email, someone who knows an address can slow down logins to that account for 15 minutes; this is the usual trade-off for lockout and is why the limit is kept short.
- **Custom meals** are private unless `isPublic` is true. Every `/api/me/custom-meals` query filters by the user in the token; another user's meal answers `404`, exactly like a missing one. Custom meals use ids like `custom-12` so they can be favorited, planned and added to the basket; the server reads the stored meal rather than trusting the client's copy.
- **Token storage on the frontend.** The token is kept in `localStorage` so a session survives a refresh and is shared across tabs. That makes it readable by any script running on the page, so the frontend must never render untrusted HTML, and the production host should send a strict `Content-Security-Policy`. Moving to HttpOnly cookies would remove that exposure but needs CSRF protection and same-site hosting for the frontend and API, which the current Netlify and Render split does not provide.
