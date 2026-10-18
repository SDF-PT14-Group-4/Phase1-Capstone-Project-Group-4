# GlobalTaste Frontend

This folder contains the React + Vite frontend for the GlobalTaste project.

## Local development

```bash
npm install
npm run dev
```

Registration and login use the Flask API. By default, the frontend sends auth
requests to `http://127.0.0.1:5000/api`; set `VITE_API_BASE_URL` to a different
API base URL when needed (for example, `https://api.example.com/api`). Configure
the backend's `FRONTEND_ORIGIN` to the origin serving this frontend.

Copy `.env.example` to `.env.local` to configure the API URL for local development.
Production builds use `https://globaltaste-api.onrender.com/api` by default.
Set `VITE_API_BASE_URL` at build time to override it when deploying another API.

Signed-in users load and update favorites, weekly planner entries, and basket
items through the authenticated account API. Guest selections remain local to
that browser and are kept separate from account data.

## Project scripts

```bash
npm run dev        # runs the app in development mode
npm run build      # creates the production build
npm run preview    # previews the built app locally
npm run lint       # runs the ESLint checks
npm run test       # runs the Vitest test suite
npm run test:coverage # runs tests and reports/enforces coverage
npm run test:watch # runs tests in watch mode
```

Coverage reports are written to `coverage/` (HTML and LCOV) and are excluded from version control. The current minimums are 45% statements, 60% branches, 50% functions, and 45% lines.

## Repository

Repository: `SDF-PT14-Group-4/Phase1-Capstone-Project-Group-4`
