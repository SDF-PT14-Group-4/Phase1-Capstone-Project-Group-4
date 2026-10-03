# GlobalTaste

GlobalTaste is a React + Vite meal discovery application that helps users explore meals, search by keyword, view ingredients and instructions, save favorites, and plan meals from around the world.

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
- TheMealDB API
- Vitest + Testing Library
- ESLint

## Project structure

```bash
Phase1-Capstone-Project-Group-4/
├── README.md
├── TEST_CASES.md
├── TEST_MATRIX.csv
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       └── test/
└── Phase1-Capstone-Project-Group-4/   # duplicate project folder in this workspace
```

## Getting started

From the workspace root, open the actual app directory:

```bash
cd Phase1-Capstone-Project-Group-4/frontend
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

## Available scripts

```bash
npm run dev        # run the app in development mode
npm run build      # create a production build
npm run preview    # preview the production build locally
npm run lint       # run ESLint checks
npm run test       # run the Vitest test suite
npm run test:watch # run tests in watch mode
```

## Testing

The project includes unit tests for the meal service and UI layout. To run the test suite:

```bash
npm run test
```

## Notes

- The app fetches real meal data from TheMealDB.
- Internet access is required for live API calls while running the app in development.
- This README is meant to serve as the project setup and usage guide for the GlobalTaste app.

## Contributor instructions

1. Install Node.js 18 or newer.
2. Run `npm install` in the frontend folder before starting work.
3. Use `npm run dev` while developing.
4. Validate changes with `npm run lint` and `npm run test` before submitting updates.
5. Use `npm run build` to confirm the production bundle still compiles.
