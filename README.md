# GlobalTaste — Full-Stack Meal Discovery & Planning Application

GlobalTaste is a full-stack web application for discovering meals, exploring food categories and cuisines, saving favourites, planning weekly meals, and managing a basket. The project combines a React + Vite frontend with a Python Flask REST API and PostgreSQL persistence.

## Project links

| Resource | Link |
|---|---|
| Live frontend | https://phase1-capstone-project-group-4.netlify.app/ |
| Backend service (Render) | https://phase1-capstone-project-group-4.onrender.com/ |
| Backend health endpoint | https://phase1-capstone-project-group-4.onrender.com/api/health |
| GitHub repository | https://github.com/SDF-PT14-Group-4/Phase1-Capstone-Project-Group-4 |


## 1. Project overview

GlobalTaste began as a React frontend prototype using TheMealDB for meal information. The full-stack implementation adds a Flask API and PostgreSQL database so that account information and user-specific favourites, weekly planner entries, and basket data can be stored persistently.

The backend also provides meal-discovery endpoints that proxy TheMealDB responses, allowing the frontend to retrieve meal information through the application API.

### Main capabilities

- Browse and search meals.
- Explore meal categories and cuisines.
- View meal details, ingredients, and preparation instructions.
- Retrieve random meal suggestions.
- Register and log in using the Flask API.
- Save and remove favourite meals.
- Add meals to a weekly planner and remove planned entries.
- Add basket items, retrieve the basket, update quantities, remove items, and clear the basket.
- Keep saved account data associated with the authenticated user.

The application uses TheMealDB as the external source of public recipe information. PostgreSQL stores GlobalTaste account and user-specific application data.

## 2. Technology stack

| Layer | Technologies | Purpose |
|---|---|---|
| Frontend | React 19, JavaScript (ES6+), Vite | User interface and development/build tooling |
| Navigation | React Router | Client-side page routing |
| Frontend state | React Hooks, Context API | Component and shared application state |
| Styling | CSS | Responsive application presentation |
| Backend | Python 3.10+, Flask | REST API and application logic |
| Authentication | JWT | Authenticated API requests |
| Database | PostgreSQL 14+ | Persistent relational data |
| ORM and migrations | SQLAlchemy / Flask database extensions, Flask-Migrate | Database access and schema migrations |
| External data | TheMealDB API | Public meal and recipe information |
| Frontend testing | Vitest, Testing Library | Component, service, and application-flow tests |
| Code quality | ESLint | Frontend linting |
| Backend testing | pytest | API and backend tests |
| Version control | Git and GitHub | Source control and collaboration |
| Deployment | Netlify, Render | Frontend and backend hosting |

## 3. Application architecture

The application follows a client-server architecture:

```text
┌────────────────────────────────────────────┐
│             React + Vite Frontend          │
│  Pages · Components · Forms · State        │
└──────────────────────┬─────────────────────┘
                       │ HTTPS / JSON
                       │ REST API requests
                       ▼
┌────────────────────────────────────────────┐
│                Flask REST API              │
│ Routes · Validation · Business Logic       │
│ JWT Authentication · SQLAlchemy            │
└───────────────┬─────────────────┬──────────┘
                │                 │
                ▼                 ▼
┌────────────────────────┐  ┌─────────────────┐
│      PostgreSQL        │  │   TheMealDB API │
│ Accounts and user data │  │ Public recipes  │
│ Favourites, planner,   │  │ and meal data   │
│ and basket records     │  └─────────────────┘
└────────────────────────┘
```

### Request flow

1. A user interacts with the React frontend.
2. The frontend sends an HTTP request to the Flask API.
3. Flask validates the request and checks authentication when the route is protected.
4. SQLAlchemy reads or updates PostgreSQL records, or the backend requests public meal data from TheMealDB.
5. Flask returns a JSON response.
6. React updates the interface based on the response.

The frontend does not connect directly to PostgreSQL. Database credentials and database operations remain on the backend.

## 4. Repository structure

```text
Phase1-Capstone-Project-Group-4/
├── .github/
├── .vscode/
├── backend/
│   ├── app/
│   ├── migrations/
│   ├── tests/
│   ├── venv/
│   ├── .env.example
│   ├── .gitignore
│   ├── pytest.ini
│   ├── README.md
│   └── requirements.txt
├── frontend/
│   ├── dist/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── test/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
├── .gitignore
├── LICENCE
├── netlify.toml
├── package-lock.json
├── README.md
├── SECURITY.md
├── TEST_CASES.md
└── TEST_MATRIX.csv
```

**Repository structure note:** This tree follows the VS Code Explorer structure shown for the project. `backend/venv/`, `frontend/node_modules/`, and `frontend/dist/` are local environment, dependency, and build-output directories. They may appear in a local workspace but should normally remain excluded from Git; a fresh clone recreates them during setup/build. The root `package-lock.json` is included because it appears in the supplied project structure.


## 5. Prerequisites

Install the following before running the project locally:

- Node.js 18 or newer and npm.
- Python 3.10 or newer.
- PostgreSQL 14 or newer.
- Git.
- Visual Studio Code or another code editor.

Check your installations:

```bash
node --version
npm --version
python --version
git --version
psql --version
```

## 6. Clone the repository

```bash
git clone https://github.com/SDF-PT14-Group-4/Phase1-Capstone-Project-Group-4.git
cd Phase1-Capstone-Project-Group-4
```

## 7. Backend setup — Flask and PostgreSQL

### 7.1 Create and activate a virtual environment

From the repository root:

```bash
cd backend
python -m venv .venv
```

**Windows PowerShell:**

```powershell
.venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**

```cmd
.venv\Scripts\activate.bat
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

### 7.2 Install backend dependencies

```bash
pip install -r requirements.txt
```

### 7.3 Configure environment variables

Create a local `.env` file from the supplied template:

```bash
cp .env.example .env
```

On Windows, you can also copy `.env.example` to `.env` using File Explorer or PowerShell.

Set the required values in `backend/.env`:

```dotenv
DATABASE_URL=postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/globaltaste
SECRET_KEY=replace_with_a_long_random_secret
JWT_SECRET_KEY=replace_with_a_different_long_random_secret
FRONTEND_ORIGIN=http://localhost:5173
```

Use the variable names and any additional settings defined by the current `backend/.env.example`. Do not commit your populated `.env` file or share production secrets.

### 7.4 Create the PostgreSQL database

Create a PostgreSQL database named `globaltaste` using pgAdmin or the PostgreSQL command line:

```sql
CREATE DATABASE globaltaste;
```

Make sure the database username and password in `DATABASE_URL` match a PostgreSQL user that has permission to access this database.

### 7.5 Apply database migrations

With the virtual environment activated and the terminal inside `backend/`:

```bash
flask --app app:create_app db upgrade
```

### 7.6 Start the Flask development server

```bash
flask --app app:create_app run --debug
```

The local API should listen at:

```text
http://127.0.0.1:5000
```

Check the health endpoint:

```text
http://127.0.0.1:5000/api/health
```

Use Flask debug mode only for local development, never for production.

### 7.7 Run backend tests

From the `backend/` directory, with the virtual environment active:

```bash
pytest
```

The backend test suite uses an isolated in-memory SQLite database; the application's local and production data stores use PostgreSQL.

## 8. Frontend setup — React and Vite

Open a second terminal at the repository root.

### 8.1 Install frontend dependencies

```bash
cd frontend
npm install
```

If you want a clean installation from the committed lockfile, use:

```bash
npm ci
```

### 8.2 Configure the API URL

Create `frontend/.env` and set:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

For the deployed backend, configure the Netlify environment variable as:

```dotenv
VITE_API_BASE_URL=https://phase1-capstone-project-group-4.onrender.com/api
```

The frontend's API helper should append the relevant route to this base URL. Keep the `/api` prefix consistent with the Flask routes.

Vite exposes variables prefixed with `VITE_` to browser code. Never place database credentials, Flask secret keys, JWT signing secrets, or other private values in frontend environment variables.

### 8.3 Start the frontend

```bash
npm run dev
```

Vite normally serves the application at:

```text
http://localhost:5173
```

Open the URL printed in your terminal.

## 9. Frontend scripts

Run these commands from the `frontend/` directory:

```bash
npm run dev             # Start the development server
npm run build           # Create the production build
npm run preview         # Preview the production build locally
npm run lint            # Run ESLint checks
npm run test            # Run the Vitest test suite
npm run test:coverage   # Run tests and enforce coverage thresholds
npm run test:watch      # Run tests in watch mode
```


## 10. Backend API reference

The Flask API uses the `/api` prefix.

### Health and authentication

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API availability |
| POST | `/api/auth/register` | Register an account and receive a JWT |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/me` | Retrieve the authenticated account |

Registration and login accept JSON containing an email and password:

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

### Meal discovery

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meals/search?q=...` | Search meals |
| GET | `/api/meals/categories` | List meal categories |
| GET | `/api/meals/cuisines` | List cuisines |
| GET | `/api/meals/random` | Retrieve a random meal |
| GET | `/api/meals/<meal_id>` | Retrieve recipe details |
| GET | `/api/meals/category/<category>` | List meals in a category |
| GET | `/api/meals/cuisine/<cuisine>` | List meals for a cuisine |

### Favourites

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/me/favorites` | List the authenticated user's favourites |
| POST | `/api/me/favorites` | Save a favourite meal |
| DELETE | `/api/me/favorites/<meal_id>` | Remove a favourite |

### Weekly planner

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/me/planner` | Retrieve the user's weekly plan |
| POST | `/api/me/planner` | Add a meal to a planner day |
| DELETE | `/api/me/planner/<day>/<meal_id>` | Remove a planned meal |

### Basket

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/me/basket` | Retrieve the user's basket |
| POST | `/api/me/basket` | Add an item to the basket |
| DELETE | `/api/me/basket` | Clear the basket |
| PATCH | `/api/me/basket/<meal_id>` | Update an item's quantity |
| DELETE | `/api/me/basket/<meal_id>` | Remove an item |

Protected routes under `/api/me` require a valid access token:

```http
Authorization: Bearer <accessToken>
```

Basket additions accept meal fields and optional `quantity` and non-negative `price` in KES. Adding an item that is already in the basket increments its quantity. The backend enforces account ownership and database constraints for user-specific records.

For request examples, response formats, and implementation details, see [`backend/README.md`](backend/README.md).

## 11. Frontend and backend integration

The frontend uses `VITE_API_BASE_URL` to identify the Flask API. Authentication requests use the backend registration and login routes. Authenticated requests to account-specific resources must include the JWT access token in the `Authorization` header.

The authenticated basket workflow supports loading and updating basket items, quantities, and totals through the backend API. Guest users have a separate local-only basket. When a guest signs in, the application loads the account basket.

The backend also provides API routes for meal discovery, favourites, and the weekly planner. Ensure each frontend service uses the matching backend route and that the deployed frontend points to the deployed backend.

## 12. Authentication, security, and data protection

- Passwords must be stored as secure hashes, never as plaintext.
- Protected API requests must include a valid JWT.
- User-specific records must be associated with the authenticated account.
- The backend must enforce ownership; the frontend must not be trusted to enforce access control.
- Keep `DATABASE_URL`, `SECRET_KEY`, and `JWT_SECRET_KEY` private.
- Use HTTPS for deployed services.
- Configure `FRONTEND_ORIGIN` to the exact frontend origin allowed by the backend CORS policy.
- Disable Flask debug mode in production.
- Do not expose internal exception traces or secrets in API responses.
- Do not commit `.env` files, passwords, tokens, or private credentials.

## 13. Testing and quality checks

### Frontend

From `frontend/`:

```bash
npm run lint
npm run test
npm run test:coverage
npm run build
```

The frontend uses Vitest and Testing Library. GitHub Actions runs frontend tests, linting, and a production build for relevant pushes and pull requests. Successful pushes to `main` can deploy to Netlify when the required deployment credentials are configured.

### Backend

From `backend/`:

```bash
pytest
```

Backend tests cover API and data behaviour using the test configuration. Use Postman or another HTTP client to test API routes independently of the React interface.

### Manual integration checks

- [ ] Frontend starts and loads.
- [ ] Backend starts without errors.
- [ ] PostgreSQL connection succeeds.
- [ ] Database migrations apply successfully.
- [ ] The health endpoint responds.
- [ ] Registration and login return the expected responses.
- [ ] Authenticated endpoints reject missing or invalid tokens.
- [ ] Favourites, planner, and basket operations persist correctly.
- [ ] Users cannot access another account's private records.
- [ ] Frontend loading, empty, and error states behave correctly.
- [ ] The production frontend build succeeds.

## 14. Deployment

### Frontend — Netlify

Live application:

https://phase1-capstone-project-group-4.netlify.app/

Typical Netlify build configuration:

| Setting | Value |
|---|---|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Environment variable | `VITE_API_BASE_URL=https://phase1-capstone-project-group-4.onrender.com/api` |

If the application uses React Router, ensure the Netlify configuration includes a redirect that sends client-side routes to `index.html`.

The repository includes a GitHub Actions workflow for frontend checks and Netlify deployment. The deployment step requires `NETLIFY_SITE_ID` as a repository variable and `NETLIFY_AUTH_TOKEN` as a GitHub Actions secret.

### Backend — Render

Backend service:

https://phase1-capstone-project-group-4.onrender.com/

Health endpoint:

https://phase1-capstone-project-group-4.onrender.com/api/health

The backend deployment requires a Python-compatible environment, the dependencies in `backend/requirements.txt`, a PostgreSQL database, and the required environment variables. Configure the production database URL and strong secret keys in the Render service settings. Set `FRONTEND_ORIGIN` to:

```text
https://phase1-capstone-project-group-4.netlify.app
```

Apply database migrations as part of the deployment process. Use a production WSGI server such as Gunicorn if required by the Render service configuration. The exact Render build and start commands must match the deployed backend entry point and service settings.

### Production configuration checklist

- [ ] Set the frontend `VITE_API_BASE_URL` to the deployed API base URL.
- [ ] Set backend `DATABASE_URL` to the production PostgreSQL connection string.
- [ ] Set strong, unique `SECRET_KEY` and `JWT_SECRET_KEY` values.
- [ ] Set `FRONTEND_ORIGIN` to the Netlify site origin.
- [ ] Apply database migrations.
- [ ] Confirm the backend health endpoint responds.
- [ ] Test login and authenticated API operations.
- [ ] Confirm basket and other user data persist correctly.
- [ ] Confirm no secrets are exposed in frontend assets or source control.

## 15. Development workflow

The repository uses Git and GitHub for source control and collaboration. Follow the branch and pull-request rules already configured in the repository.

Example:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-change

# Make and test your changes

git add .
git commit -m "feat: describe the change"
git push -u origin feature/your-change
```

Create a pull request and run the relevant checks before merging.

Suggested commit prefixes:

- `feat:` new functionality
- `fix:` bug fixes
- `test:` test additions or changes
- `docs:` documentation updates
- `refactor:` code restructuring without changing behaviour

## 16. Project evolution

| Stage | Focus |
|---|---|
| Phase 1 | React frontend prototype and meal discovery using TheMealDB |
| Phase 2 | Flask REST API, PostgreSQL persistence, authentication, and user-specific favourites, planner, and basket data |
| Future improvements | Expanded personalisation, enhanced planning tools, and additional integrations |

## 18. Acknowledgements

- **TheMealDB** — public meal and recipe information.
- **React and Vite** — frontend development.
- **Flask** — backend REST API.
- **PostgreSQL** — relational data persistence.
- **Git and GitHub** — source control and collaboration.
- **Netlify and Render** — application hosting.

---

**GlobalTaste — Discover meals, organise your week, and keep your food planning in one place.**
