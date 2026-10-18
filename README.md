# GlobalTaste

## Repository

This project is hosted in the GitHub organization `SDF-PT14-Group-4` under the repository `Phase1-Capstone-Project-Group-4`.

## Live Demo

[View the live application](https://phase1-capstone-project-group-4.netlify.app)

GlobalTaste is a React + Vite meal discovery application for browsing meals, searching by keyword, viewing ingredients and instructions, saving favorites, and planning meals from around the world.

## Project overview

This app provides a responsive single-page experience for browsing meals using the public TheMealDB API. It includes:

- Home screen with app branding and overview
- Search page for meal lookup by keyword
- Meal detail page with ingredients and instructions
- Categories page for browsing cuisine and meal types
- Favorites page to save and revisit selected meals
- Planner page for organizing meals
- Basket page for selected items or ingredients
- Surprise Me page for a random recommendation

## Tech stack

- React 19
- Vite
- React Router
- Flask REST API
- PostgreSQL
- TheMealDB API
- Vitest + Testing Library
- ESLint

## Project structure

```bash
Phase1-Capstone-Project-Group-4/
├── .github/
│   └── workflows/
├── backend/
│   ├── app/
│   ├── migrations/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
├── README.md
├── SECURITY.md
├── TEST_CASES.md
├── TEST_MATRIX.csv
├── frontend/
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public/
│   ├── src/
│   └── vite.config.js
└── LICENCE
```

## Getting started

### Frontend

From the repository root, change into the frontend app directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal, typically:

```text
http://localhost:5173/
```

### Flask API

The backend exposes meal discovery endpoints and JWT-protected account, favorites, weekly planner, and basket endpoints. Its setup, PostgreSQL configuration, API contract, and tests are documented in [backend/README.md](./backend/README.md).

Registration and login use the Flask API. Guest favorites, planner entries, and basket items stay in browser storage. When signed in, favorites, planner entries, and basket items are loaded from and saved to the account API, so they follow the account across browsers.

For local development, run the Flask API at `http://127.0.0.1:5000`; the frontend uses `http://127.0.0.1:5000/api` by default. Copy [frontend/.env.example](./frontend/.env.example) to `frontend/.env.local` and change `VITE_API_BASE_URL` when the API runs elsewhere.

### Production deployment

The frontend is deployed to Netlify. [render.yaml](./render.yaml) defines the Flask API and a private PostgreSQL database on Render. To create them, connect this repository in Render and apply the Blueprint:

1. In Render, create a Blueprint instance from this repository and review the services before confirming. The blueprint generates unique backend secrets and runs database migrations before starting the API.
2. The included API and database plans are free for a demo. **The API may spin down after 15 minutes of inactivity, and its first request after that can take about a minute. Render free PostgreSQL databases expire 30 days after creation and are eventually deleted if not upgraded.** These plans are not suitable for durable production data; see [Render's free-instance limitations](https://render.com/docs/free).
3. After Render provisions the API, copy its public service URL and set the GitHub Actions repository variable `VITE_API_BASE_URL` to that URL ending in `/api`.
4. Configure `NETLIFY_SITE_ID` as a repository variable and `NETLIFY_AUTH_TOKEN` as a repository secret. CI builds the frontend with `VITE_API_BASE_URL` and deploys it to Netlify.

Render and Netlify resources are not provisioned automatically by a code change; the Blueprint must be created in the Render dashboard and the repository variables/secrets must be configured there.

## Available scripts

```bash
npm run dev        # run the app in development mode
npm run build      # create a production build
npm run preview    # preview the production build locally
npm run lint       # run ESLint checks
npm run test       # run the Vitest test suite
npm run test:coverage  # run tests and enforce coverage thresholds
npm run test:watch # run tests in watch mode
```

## Testing

The project uses Vitest and Testing Library for service, component, and app-flow tests. Run:

```bash
npm run test
npm run test:coverage
```

The coverage command reports statement, branch, function, and line coverage in the terminal and writes HTML and LCOV reports to `frontend/coverage/`. CI runs the coverage command and enforces the current minimums: 45% statements, 60% branches, 50% functions, and 45% lines. The CSV test matrix identifies the user journeys automated in the suite; cases needing a real browser or deployment remain manual.

## CI/CD

GitHub Actions runs the test suite, ESLint, and a production build for pull requests and pushes to `main`. Successful pushes to `main` also deploy the build to Netlify when deployment credentials are configured.

To enable production deploys, add `NETLIFY_SITE_ID` and `VITE_API_BASE_URL` as repository variables and `NETLIFY_AUTH_TOKEN` as an Actions secret in the GitHub repository settings. Without the site ID variable, CI still runs but the deploy step is skipped.

## Notes

- The app fetches real meal data from TheMealDB.
- Internet access is required for live API calls while running the app in development.
- This README serves as the project setup and usage guide for the GlobalTaste app.

## Contributor instructions

1. Install Node.js 18 or newer.
2. Run `npm install` in the frontend folder before starting work.
3. Use `npm run dev` while developing.
4. Validate changes with `npm run lint` and `npm run test:coverage` before submitting updates.
5. Use `npm run build` to confirm the production bundle still compiles.
