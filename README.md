# GlobalTaste Phase 2

# GlobalTaste — Full-Stack Meal Discovery and Planning Application

**Project Phase:** Phase 2 — Full-Stack Application  
**Frontend:** React, JavaScript (ES6+), Vite  
**Backend:** Python, Flask, Flask REST API  
**Database:** PostgreSQL  
**API Architecture:** RESTful API  
**Status:** In Development

## 1. Project Overview

[View the live application](https://phase1-capstone-project-group-4.netlify.app)
[View the live backend application](https://phase1-capstone-project-group-4.onrender.com/)

The project began as a frontend proof of concept developed with React and Vite. In Phase 1, the application used TheMealDB public API to retrieve meal information, including meal names, images, categories, cuisines, ingredients, and preparation instructions.

Phase 2 extends the existing application into a full-stack system by introducing a custom Flask backend and a PostgreSQL relational database. Instead of relying on a public API for application-owned information, GlobalTaste will communicate with its own REST API to create, retrieve, update, and delete persistent user-generated records.

The transition preserves the original product concept and frontend experience while introducing a structured backend, relational data models, server-side validation, and persistent storage.

The central objective is to transform GlobalTaste from a meal discovery prototype into a maintainable application that supports meaningful meal planning and data management.

### Git Repository Link
https://github.com/SDF-PT14-Group-4/Phase1-Capstone-Project-Group-4

### Front End Deployment Link
https://phase1-capstone-project-group-4.netlify.app/

### Backend Deployment Link


### Project evolution

| Phase | Focus | Main technologies |
|---|---|---|
| Phase 1 | Frontend prototype and external meal discovery | React, Vite, JavaScript, TheMealDB |
| Phase 2 | Custom REST API, relational database, and CRUD functionality | React, Flask, PostgreSQL, SQLAlchemy |
| Phase 3 | Authentication, user-specific data ownership, and expanded personalisation | React, Flask, JWT, PostgreSQL |

Phase 3 represents the planned next stage of development. Any functionality described as planned in this README should be considered incomplete until implemented and tested.

## 2. Business Problem

Meal planning can become difficult when people must search across different sources to discover meals, remember recipes, organise their preferred dishes, and decide what to prepare throughout the week.

Without a centralised application, users may struggle to:

- Discover meals that match their interests.
- Explore different food categories and cuisines.
- Keep track of favourite dishes.
- Organise meals into practical plans.
- Maintain an organised record of planned meals.
- Revisit and update their plans when their preferences or schedules change.

A frontend-only application that depends entirely on a public API also has limitations. It does not automatically provide a reliable backend for storing application-owned records, maintaining relationships between records, or enforcing data ownership.

GlobalTaste addresses these challenges by combining meal discovery with structured meal planning and persistent data management.

### Target users

The intended users include:

- Individuals who want to organise their meals.
- People exploring international cuisines.
- Users who want to maintain reusable meal plans.
- Home cooks looking for inspiration and a more organised approach to food preparation.

## 3. Proposed Solution

GlobalTaste provides a centralised web application where users can discover meals and manage structured meal-planning information through an intuitive React interface.

The Phase 2 solution introduces three main technical layers:

1. **React frontend:** Provides the user interface, navigation, forms, meal displays, and interactive workflows.
2. **Flask backend:** Exposes RESTful endpoints, validates incoming requests, enforces applicable business rules, and coordinates database operations.
3. **PostgreSQL database:** Stores application-owned records in related relational tables and maintains data integrity.

SQLAlchemy will provide the object-relational mapping layer between Python models and PostgreSQL.

The core Phase 2 data-management workflow will focus on two related resources:

- **Meal Plans:** Represent collections of meals organised for a particular purpose or period.
- **Planned Meals:** Represent individual meal entries associated with a meal plan.

For example, a user could create a meal plan called *Weekly Family Meals* and add individual entries for Monday's lunch, Tuesday's dinner, and Wednesday's breakfast.

Each planned meal belongs to a meal plan, creating a clear relational structure that supports independent CRUD operations on both resources.

The application may retain TheMealDB for external meal discovery where useful, but the custom backend and PostgreSQL database will manage the application's own persistent meal-planning data.

## 4. Project Objectives

The project aims to:

1. Extend the existing GlobalTaste React application instead of rebuilding the product from scratch.
2. Develop a Flask backend that exposes documented RESTful endpoints.
3. Configure PostgreSQL as the persistent relational database.
4. Design at least two related data resources with appropriate relationships.
5. Implement create, read, update, and delete operations for both resources.
6. Connect the React frontend to the custom backend.
7. Handle asynchronous requests, loading states, empty results, and API errors.
8. Apply server-side validation and maintain relational data integrity.
9. Prepare the data model for authentication and user ownership.
10. Use Git and GitHub to maintain a clear, incremental development history.
11. Document installation, configuration, API usage, and testing procedures.
12. Prepare the application for deployment and a professional project demonstration.

## 5. Project Scope

### In scope

- Existing React application and navigation.
- Flask REST API.
- PostgreSQL database integration.
- SQLAlchemy data models and relationships.
- Meal plan management.
- Planned meal management.
- CRUD operations for both resources.
- Frontend-to-backend HTTP communication.
- Request validation and error handling.
- Pagination for collection endpoints.
- Environment-based configuration.
- Backend and frontend testing.
- GitHub documentation and deployment preparation.

### Out of scope for the initial Phase 2 MVP

Unless implemented as additional features, the following are not required for the initial release:

- Production-ready authentication and registration.
- Payment processing or online food ordering.
- Restaurant reservations and delivery tracking.
- Nutrition analysis backed by verified nutritional data.
- AI-generated recipes or meal recommendations.
- Multi-tenant restaurant administration.
- Advanced analytics and reporting.

Authentication and record ownership are planned for the next development stage.

## 6. Key Features

### 6.1 Meal discovery

The existing React application provides the foundation for discovering meals and navigating between food-related views.

Existing Phase 1 functionality includes:

- Home page.
- Meal search.
- Category exploration.
- Cuisine exploration.
- Meal details.
- Favourites.
- Meal planning interface.
- Surprise Me functionality.
- Basket prototype.
- Login and registration interfaces.

The current Phase 1 implementation uses TheMealDB for public meal information. These existing screens can be retained and adapted as the custom backend becomes the source of application-owned data.

### 6.2 Meal plan management

The meal plan resource will support:

- Creating a meal plan.
- Viewing a list of meal plans.
- Viewing an individual meal plan.
- Updating a plan's title, description, or relevant scheduling information.
- Deleting a meal plan.
- Retrieving the planned meals associated with a plan.

Example:

**Plan title:** Weekly Family Meals

**Description:** Meals organised for the coming week.

### 6.3 Planned meal management

The planned meal resource will support:

- Adding a meal entry to a meal plan.
- Viewing planned meals.
- Retrieving an individual planned meal.
- Updating the meal name, scheduled date, meal type, or notes.
- Removing an entry from a plan.
- Associating each entry with its parent meal plan.

Example entries:

- Monday — Breakfast — Pancakes.
- Tuesday — Lunch — Vegetable Rice.
- Wednesday — Dinner — Grilled Chicken.

These examples describe the intended functionality; the final available fields depend on the implemented database schema.

### 6.4 Persistent storage

PostgreSQL will store the application-owned meal plans and planned meal entries. Data will remain available after a browser refresh or application restart, subject to the database and deployment environment remaining available.

### 6.5 User experience

The frontend will provide appropriate:

- Loading indicators.
- Error messages.
- Empty states.
- Form validation feedback.
- Confirmation before destructive actions.
- Success feedback after operations.
- Responsive layouts for different screen sizes.

## 7. Technology Stack

| Technology | Purpose |
|---|---|
| React | Component-based frontend development |
| Vite | Frontend development server and build tooling |
| JavaScript (ES6+) | Application logic |
| React Router | Client-side navigation |
| React Hooks | Component state and lifecycle management |
| Context API | Shared frontend state where appropriate |
| CSS | Application styling and responsive layouts |
| Python | Backend programming language |
| Flask | Backend web framework |
| Flask-CORS | Cross-origin communication during development and deployment |
| Flask-SQLAlchemy | SQLAlchemy integration with Flask |
| SQLAlchemy | Relational object modelling and database queries |
| Flask-Migrate | Database schema migrations |
| Flask-JWT-Extended | JWT-based authentication when implemented |
| Flask-Bcrypt | Password hashing when authentication is implemented |
| Marshmallow | Request and response schema validation, if adopted |
| PostgreSQL | Relational database |
| Git | Version control |
| GitHub | Source code hosting and collaboration |
| Postman | API testing and endpoint verification |
| Visual Studio Code | Development environment |

The exact dependencies should match the packages installed in the project's frontend and backend configuration files.

## 8. System Architecture

GlobalTaste follows a client-server architecture.

```text
+------------------------------------+
|          React Frontend            |
|                                    |
| Pages, Components, Forms, State    |
+-----------------+------------------+
                  |
                  | HTTP / JSON
                  | REST API requests
                  v
+------------------------------------+
|          Flask Backend             |
|                                    |
| Routes / Controllers               |
| Validation and Business Logic      |
| SQLAlchemy Models                  |
+-----------------+------------------+
                  |
                  | SQLAlchemy
                  v
+------------------------------------+
|         PostgreSQL Database        |
|                                    |
| meal_plans                          |
| planned_meals                       |
| users (when implemented)            |
+------------------------------------+
```

### Request lifecycle

1. A user interacts with the React interface.
2. The frontend sends an HTTP request to the Flask API.
3. Flask matches the request to the appropriate route.
4. The backend validates the request data.
5. SQLAlchemy queries or modifies PostgreSQL records.
6. Flask returns a JSON response with an appropriate HTTP status code.
7. React updates the displayed data and application state.

The frontend should not connect directly to PostgreSQL. Database credentials and database operations must remain on the backend.

## 9. Database Design

The proposed relational model centres on two related resources.

### 9.1 MealPlan

The `MealPlan` model represents a named collection of planned meals.

| Field | Proposed type | Description |
|---|---|---|
| `id` | Integer | Primary key |
| `title` | String | Name of the meal plan |
| `description` | Text | Optional description |
| `created_at` | Timestamp | Record creation time |
| `updated_at` | Timestamp | Most recent update time |

A user ownership field, such as `user_id`, should be incorporated when the user model and ownership controls are implemented.

### 9.2 PlannedMeal

The `PlannedMeal` model represents an individual entry within a meal plan.

| Field | Proposed type | Description |
|---|---|---|
| `id` | Integer | Primary key |
| `meal_plan_id` | Integer | Foreign key referencing a meal plan |
| `meal_name` | String | Name of the planned dish |
| `scheduled_date` | Date | Intended preparation or consumption date |
| `meal_type` | String | Optional category such as breakfast or dinner |
| `notes` | Text | Optional notes |
| `created_at` | Timestamp | Record creation time |
| `updated_at` | Timestamp | Most recent update time |

Additional fields may be introduced if they support the final application requirements.

### 9.3 Relationships

A meal plan can contain multiple planned meals, while each planned meal belongs to one meal plan.

The relationship is:

`MealPlan (1) → (many) PlannedMeal`

The database should use a foreign key to enforce this relationship.

The deletion policy should be explicit. For example, deleting a meal plan may cascade to its associated planned meals if that behaviour is appropriate for the application.

### 9.4 Database integrity

The implementation should consider:

- Primary key constraints.
- Foreign key constraints.
- Required-field validation.
- Appropriate string-length limits.
- Valid date values.
- Referential integrity.
- Consistent timestamp handling.
- Transaction management for database changes.
- Database migrations for schema updates.


## 10. API Design and Endpoints

The Flask backend will expose a versioned REST API under `/api/v1`.

The following table defines the proposed API contract. These endpoints are design targets and should not be considered operational until they have been implemented and tested.

### 10.1 Health check

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Verify that the API is responding |

Example response:

```json
{
  "status": "ok",
  "message": "GlobalTaste API is running"
}
```

### 10.2 Meal plan endpoints

| Method | Endpoint | Operation |
|---|---|---|
| GET | `/api/v1/meal-plans` | Retrieve a paginated list of meal plans |
| POST | `/api/v1/meal-plans` | Create a meal plan |
| GET | `/api/v1/meal-plans/<id>` | Retrieve one meal plan |
| PATCH | `/api/v1/meal-plans/<id>` | Update selected meal plan fields |
| PUT | `/api/v1/meal-plans/<id>` | Replace a meal plan, if supported |
| DELETE | `/api/v1/meal-plans/<id>` | Delete a meal plan |

### 10.3 Planned meal endpoints

| Method | Endpoint | Operation |
|---|---|---|
| GET | `/api/v1/planned-meals` | Retrieve a paginated list of planned meals |
| POST | `/api/v1/planned-meals` | Create a planned meal |
| GET | `/api/v1/planned-meals/<id>` | Retrieve one planned meal |
| PATCH | `/api/v1/planned-meals/<id>` | Update selected planned meal fields |
| PUT | `/api/v1/planned-meals/<id>` | Replace a planned meal, if supported |
| DELETE | `/api/v1/planned-meals/<id>` | Delete a planned meal |

### 10.4 Retrieve meals within a plan

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/meal-plans/<id>/planned-meals` | Retrieve planned meals associated with a specific plan |

This endpoint supports the relationship between the two resources and allows the frontend to display the contents of a selected meal plan.

### 10.5 Example: Create a meal plan

Request:

```http
POST /api/v1/meal-plans
Content-Type: application/json
```

Body:

```json
{
  "title": "Weekly Family Meals",
  "description": "Meals planned for the coming week."
}
```

Example successful response:

```json
{
  "id": 1,
  "title": "Weekly Family Meals",
  "description": "Meals planned for the coming week.",
  "created_at": "2026-10-19T10:00:00Z",
  "updated_at": "2026-10-19T10:00:00Z"
}
```

The timestamps and identifier above are illustrative. Actual values will be generated by the application.

### 10.6 Example: Create a planned meal

Request:

```http
POST /api/v1/planned-meals
Content-Type: application/json
```

Body:

```json
{
  "meal_plan_id": 1,
  "meal_name": "Vegetable Rice",
  "scheduled_date": "2026-10-20",
  "meal_type": "Lunch",
  "notes": "Prepare enough for two people."
}
```

The backend should verify that the referenced meal plan exists and that the requesting user is authorised to add an entry to it when ownership controls are enabled.

### 10.7 HTTP status codes

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | Resource created successfully |
| `204 No Content` | Resource deleted successfully |
| `400 Bad Request` | Invalid request or validation failure |
| `401 Unauthorized` | Authentication required or invalid |
| `403 Forbidden` | Authenticated user lacks permission |
| `404 Not Found` | Resource does not exist or is not accessible |
| `409 Conflict` | Request conflicts with a data constraint, where applicable |
| `500 Internal Server Error` | Unexpected server-side failure |

The backend should return consistent JSON error messages for failures where a response body is appropriate.

## 11. Frontend Architecture

The React frontend will retain its existing component-based structure and adapt its data-management workflows to communicate with Flask.

### 11.1 Main pages

The existing application includes the following page areas:

- Home.
- Search.
- Categories.
- Category Meals.
- Cuisines.
- Cuisine Meals.
- Meal Details.
- Favourites.
- Meal Planner.
- Basket.
- Surprise Me.
- Login and Registration interfaces.

The final routes and page availability should match the actual implementation.

### 11.2 Reusable components

The application can use reusable components for:

- Page headers.
- Meal cards.
- Meal grids.
- Loading indicators.
- Error messages.
- Empty-state messages.
- Form controls.
- Confirmation dialogs.
- Pagination controls.

Reusable components help maintain consistent presentation and reduce duplicated logic.

### 11.3 State management

React Hooks, including `useState` and `useEffect`, can manage component-level data and asynchronous operations.

The existing Context API implementation provides shared state for features such as favourites, the meal planner, and the basket.

As Phase 2 progresses, persistent meal-plan operations should be backed by the Flask API rather than relying exclusively on local browser storage.

Local storage may still be appropriate for non-sensitive interface preferences, but it should not be treated as the authoritative database for server-managed records.

## 12. Project Structure

The following is a suggested full-stack repository structure. Adjust the backend and frontend filenames to match the actual project.

```text
globaltaste/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── meals/
│   │   │   ├── planner/
│   │   │   └── layout/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── migrations/
│   ├── tests/
│   ├── config.py
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
│
├── .gitignore
└── README.md
```

This structure is illustrative rather than a claim about the repository's current contents. An application factory, blueprints, and separate model modules can be used to keep the backend modular as it grows.

## 13. Installation and Setup

### 13.1 Prerequisites

Install the following tools before starting:

- Node.js and npm.
- Python 3.
- PostgreSQL.
- Git.
- Visual Studio Code or another suitable code editor.
- Postman or an equivalent HTTP client for API testing.

Confirm that the required commands are available:

```bash
node --version
npm --version
python --version
git --version
psql --version
```

Depending on the operating system, the Python command may be `python3` rather than `python`.

### 13.2 Clone the repository

Replace the placeholder URL with the actual public GitHub repository URL.

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd globaltaste
```

### 13.3 Install frontend dependencies

```bash
cd frontend
npm install
```

If the project already has a committed `package-lock.json`, use `npm ci` when a clean, reproducible dependency installation is required.

### 13.4 Set up the backend environment

From the repository root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell**

```powershell
.venv\Scripts\Activate.ps1
```

**Windows Command Prompt**

```cmd
.venv\Scripts\activate.bat
```

**macOS or Linux**

```bash
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

If the dependency file has not yet been created, install the packages required by the implemented backend and generate a reproducible requirements file before committing the project.

### 13.5 Create the PostgreSQL database

Open a PostgreSQL session using an account with permission to create databases.

For example:

```sql
CREATE DATABASE globaltaste_db;
```

Create or select a dedicated database user and configure the necessary privileges according to the local PostgreSQL installation.

Do not use production database credentials in source code or commit them to GitHub.

## 14. Environment Configuration

Environment variables separate application configuration from source code and make it easier to run the application in different environments.

### 14.1 Backend environment variables

Create a `.env` file in the backend directory if the application is configured to load it.

Example `.env.example`:

```dotenv
FLASK_ENV=development
SECRET_KEY=replace_with_a_secure_random_value
DATABASE_URL=postgresql://username:password@localhost:5432/globaltaste_db
JWT_SECRET_KEY=replace_with_a_separate_secure_random_value
FRONTEND_ORIGIN=http://localhost:5173
```

Use real values in your local `.env` file. Do not commit the populated file.

The JWT secret is required only when JWT functionality is configured. The application must explicitly load environment variables using its chosen configuration mechanism.

### 14.2 Frontend environment variables

Create `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:5000/api/v1
```

React components and frontend API helpers can read this value through Vite's `import.meta.env`.

For example:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

Only non-sensitive configuration should use the `VITE_` prefix because these values are exposed to browser code.

Never put database passwords, Flask secret keys, JWT signing secrets, or other private credentials in frontend environment variables.

### 14.3 Git ignore rules

The repository's `.gitignore` should exclude sensitive configuration, virtual environments, generated files, and local dependencies.

Example entries:

```gitignore
# Environment variables
.env
.env.*
!.env.example

# Python
__pycache__/
*.py[cod]
.venv/
venv/
.pytest_cache/

# Frontend
node_modules/
frontend/dist/

# Build and coverage output
coverage/
htmlcov/

# Local databases and logs
*.sqlite
*.db
*.log

# Editor files
.vscode/
```

Adapt these rules to your repository. If a required project configuration file is already tracked, changing `.gitignore` alone will not remove it from version control.

## 15. Running the Application

Start the backend and frontend in separate terminals.

### 15.1 Start Flask

Activate the Python virtual environment and move into the backend directory.

If the Flask application exposes an `app` object in `run.py`, start it with:

```bash
flask --app run:app run --debug
```

If the project uses an application factory, use the appropriate Flask CLI target for that implementation instead.

The local API will typically be available at:

```text
http://127.0.0.1:5000
```

Verify the health endpoint, if implemented:

```text
GET http://127.0.0.1:5000/api/v1/health
```

Debug mode is for local development only and should not be enabled in production.

### 15.2 Start React

Open another terminal:

```bash
cd frontend
npm run dev
```

Vite will display the local frontend URL, typically:

```text
http://localhost:5173
```

Open that address in your browser.

### 15.3 Verify the connection

Confirm that:

1. The React application loads.
2. Flask starts without import or configuration errors.
3. The frontend API base URL is correct.
4. The backend can connect to PostgreSQL.
5. The health endpoint responds, if implemented.
6. The frontend can retrieve data from the custom API.
7. Creating or updating a record persists the change in the database.

## 16. CRUD Operations

CRUD stands for Create, Read, Update, and Delete. Both core resources should support these operations through the API and React interface.

### 16.1 Meal plan CRUD

**Create:** A user fills in a meal plan form and submits it. React sends a `POST` request, Flask validates the input, and SQLAlchemy stores the record.

**Read:** The frontend retrieves meal plans from Flask and renders them in the application. Selecting a plan displays its details and associated planned meals.

**Update:** A user edits a plan. The frontend submits the changed fields through `PATCH` or the supported update method.

**Delete:** A user requests deletion. The frontend should confirm the action where appropriate and then call the corresponding `DELETE` endpoint.

### 16.2 Planned meal CRUD

**Create:** A user selects a meal plan and adds a planned meal with the required fields.

**Read:** The frontend retrieves planned meals globally or for a selected plan.

**Update:** A user changes the scheduled date, meal type, meal name, or other supported fields.

**Delete:** A user removes an unwanted planned meal.

### 16.3 CRUD verification checklist

- [ ] A meal plan can be created successfully.
- [ ] Meal plans can be listed and retrieved individually.
- [ ] A meal plan can be updated.
- [ ] A meal plan can be deleted.
- [ ] A planned meal can be created under an existing plan.
- [ ] Planned meals can be listed and retrieved individually.
- [ ] A planned meal can be updated.
- [ ] A planned meal can be deleted.
- [ ] Invalid input produces an appropriate error response.
- [ ] Invalid foreign key references are rejected.
- [ ] Changes remain after a browser refresh.
- [ ] Pagination works on the applicable collection endpoints.

## 17. Frontend and Backend Communication

The frontend should use a centralised API helper rather than duplicating request configuration throughout individual components.

For example, a frontend service module could provide:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getMealPlans(page = 1, perPage = 10) {
  const url = new URL(
    `${API_BASE_URL}/meal-plans`
  );

  url.searchParams.set("page", page);
  url.searchParams.set("per_page", perPage);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to retrieve meal plans.");
  }

  return response.json();
}
```

This is an illustrative helper. It assumes that the backend implements the proposed endpoint and pagination parameters.

Other helper functions can implement `POST`, `PATCH`, and `DELETE` requests using the same base URL and consistent error handling.

### Asynchronous state

Components that retrieve data should account for three main states:

- **Loading:** The request is in progress.
- **Success:** Data has been received and can be displayed.
- **Error:** The request failed and the user should receive meaningful feedback.

The interface should also distinguish between a failed request and a successful request that returns an empty collection.

For create, update, and delete operations, the frontend should refresh or update its state only after handling the server response appropriately. This helps keep the displayed data consistent with the database.

## 18. Error Handling and Validation

Validation should take place on both the frontend and backend.

Frontend validation improves usability, while backend validation protects the application from invalid requests that bypass the interface.

### Validation examples

For meal plans:

- Require a non-empty title.
- Enforce reasonable field-length limits.
- Validate optional fields when supplied.

For planned meals:

- Require a valid meal name.
- Validate date formats.
- Validate supported meal types if the application defines them.
- Confirm that the referenced meal plan exists.
- Reject malformed request bodies.

### Error-handling principles

The backend should:

- Return meaningful HTTP status codes.
- Use a consistent JSON error structure.
- Roll back failed database transactions where appropriate.
- Avoid exposing database credentials or internal stack traces.
- Log unexpected errors for debugging.

The frontend should:

- Display understandable error messages.
- Preserve form input when appropriate.
- Avoid presenting failed operations as successful.
- Allow users to retry recoverable requests.

## 19. Security and Data Ownership

Security is an important part of the transition from a frontend prototype to a full-stack application.

### 19.1 Configuration security

- Keep secret keys and database credentials outside source code.
- Use environment variables for environment-specific configuration.
- Do not expose sensitive backend configuration to React.
- Disable Flask debug mode in production.
- Configure CORS for the frontend origins that actually require access.

### 19.2 Authentication

Flask-JWT-Extended can be used to implement token-based authentication when the authentication module is introduced.

Flask-Bcrypt can hash passwords before storage if account registration and password-based login are implemented.

Passwords must never be stored as plaintext.

### 19.3 Record ownership

The data model should accommodate a future relationship between users and their meal plans. When authentication is implemented, the backend should associate records with the authenticated user and enforce ownership on every relevant operation.

The server must not trust a client-supplied user ID as proof of ownership.

For example, when a user requests an update, the backend must verify that the record belongs to the authenticated user before allowing the change. Equivalent checks must apply to reads, deletions, and operations involving associated planned meals.

A planned meal must not be accessible or modifiable merely because the caller knows its ID.

### 19.4 Access-control testing

When authenticated accounts are implemented, test that:

- Unauthenticated requests are rejected where authentication is required.
- A user cannot retrieve another user's private records.
- A user cannot update or delete another user's records.
- A user cannot add a planned meal to another user's plan.
- Invalid or expired tokens are rejected.
- Ownership restrictions apply to both parent and child resources.

These controls must be implemented and tested in Flask; hiding interface buttons is not sufficient.

## 20. Pagination

Pagination helps the API return manageable collections as the number of records grows.

Example request:

```http
GET /api/v1/meal-plans?page=1&per_page=10
```

Example response format:

```json
{
  "items": [
    {
      "id": 1,
      "title": "Weekly Family Meals",
      "description": "Meals planned for the coming week."
    }
  ],
  "page": 1,
  "per_page": 10,
  "total": 1,
  "pages": 1
}
```

This response is illustrative and should be adapted to the actual backend response schema.

The backend should validate pagination parameters and apply a reasonable maximum page size. The frontend should display pagination controls when more than one page is available.

Pagination should be implemented on the server, rather than retrieving every database record and splitting the results only in React.

## 21. Testing

Testing will help establish that the application behaves correctly across its frontend, API, and database layers.

### 21.1 Backend testing

Use `pytest` to test Flask routes, model relationships, validation, and database operations.

Important test cases include:

- Health endpoint response.
- Successful meal plan creation.
- Retrieval of meal plans.
- Successful plan updates and deletions.
- Planned meal creation.
- Retrieval of planned meals by plan.
- Successful planned meal updates and deletions.
- Invalid request handling.
- Invalid foreign key handling.
- Pagination boundaries.
- Authentication and ownership enforcement when implemented.

Database tests should use an isolated test database or another appropriately isolated test configuration.

### 21.2 Frontend testing

Verify that:

- Pages and navigation work.
- API requests use the configured backend URL.
- Loading and error states are displayed.
- Forms submit valid data.
- Validation errors are communicated clearly.
- Lists refresh after successful mutations.
- Empty collections are handled correctly.
- Destructive actions behave as expected.

### 21.3 API testing with Postman

Postman can be used to verify each endpoint independently of the React interface.

For each route, test:

1. The HTTP method and URL.
2. Required headers.
3. Request body format.
4. Expected status code.
5. Response structure.
6. Invalid input.
7. Missing resources.
8. Database persistence.
9. Pagination parameters.
10. Access-control behaviour when authentication is enabled.

### 21.4 Final testing checklist

- [ ] Backend starts successfully.
- [ ] PostgreSQL connection works.
- [ ] Database migrations can be applied.
- [ ] All required CRUD operations work.
- [ ] Frontend communicates with Flask.
- [ ] Loading, error, and empty states work.
- [ ] Validation is enforced by the backend.
- [ ] Related resources maintain referential integrity.
- [ ] Pagination is functional.
- [ ] Relevant automated tests pass.
- [ ] The production build completes.
- [ ] No secrets are committed to the repository.

## 22. Git and GitHub Workflow

Git provides version control throughout development, while GitHub provides a central repository for collaboration, review, and submission.

### Recommended branches

- `main` — stable, submission-ready code.
- `develop` — integration branch for ongoing development.
- `feature/backend-api` — custom Flask API development.
- `feature/database-models` — PostgreSQL models and migrations.
- `feature/meal-plan-crud` — meal plan operations.
- `feature/planned-meal-crud` — planned meal operations.
- `feature/frontend-integration` — React and Flask integration.
- `fix/<issue-name>` — targeted bug fixes.

Use the branch structure that matches the repository's existing workflow and protection rules.

### Example workflow

```bash
git checkout develop
git pull origin develop

git checkout -b feature/backend-api
```

After making and testing changes:

```bash
git add .
git commit -m "feat: implement meal plan API"
git push -u origin feature/backend-api
```

Create a pull request into the appropriate integration branch and merge only after reviewing the changes and resolving conflicts.

### Commit message examples

```text
feat: add meal plan model
feat: implement planned meal CRUD
feat: connect React planner to Flask API
fix: handle invalid meal plan references
test: add meal plan API tests
docs: update full-stack README
```

### Repository hygiene

Before submitting:

- Remove unnecessary files and abandoned code.
- Keep `.env` files and credentials out of version control.
- Exclude virtual environments and `node_modules`.
- Commit useful source files, migrations, tests, and dependency manifests.
- Maintain meaningful incremental commits.
- Confirm the GitHub repository is public if required for assessment.
- Verify that a fresh clone can be configured using the README.

## 23. Deployment

The frontend and backend may be deployed separately.

### Frontend deployment

The React/Vite frontend can be deployed to a provider such as Netlify or Vercel.

Typical build settings:

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`

Configure the frontend environment variable `VITE_API_BASE_URL` to point to the deployed Flask API.

If React Router is used, configure the hosting provider to serve the application entry point for supported client-side routes.

### Backend deployment

The Flask backend can be deployed to a Python-compatible hosting provider, such as Render, with a managed PostgreSQL database or another supported PostgreSQL service.

The backend deployment should configure:

- A production WSGI server such as Gunicorn.
- The production database connection string.
- Secret keys through environment variables.
- CORS for the deployed frontend origin.
- Database migrations.
- Production logging and error handling.

The exact start command depends on the Flask application's entry point and structure.

### Deployment verification

After deployment:

1. Confirm that the backend health endpoint responds.
2. Confirm that the deployed frontend uses the production API URL.
3. Verify that database migrations have been applied.
4. Test creating, reading, updating, and deleting records.
5. Confirm that records persist after refreshing the browser.
6. Verify CORS and authentication settings where applicable.
7. Ensure that private environment variables are not exposed.

**Live application:** To be added after successful deployment.

**GitHub repository:** To be replaced with the actual public repository URL.

## 24. Development Roadmap

### Phase 1 — Frontend proof of concept

Completed project foundation:

- React and Vite application.
- Meal discovery using TheMealDB.
- Search, categories, cuisines, and meal details.
- Favourites and meal-planning interface.
- Shared frontend state and browser-based persistence for prototype features.

### Phase 2 — Full-stack application

Development objectives:

- Create a custom Flask API.
- Configure PostgreSQL.
- Implement SQLAlchemy models and relationships.
- Implement CRUD for meal plans and planned meals.
- Connect the React interface to the custom API.
- Add validation, error handling, and pagination.
- Test backend routes and frontend workflows.
- Update documentation and prepare the final demonstration.

### Phase 3 — Authentication and personalisation

Potential next-stage enhancements:

- User registration and login.
- JWT-based authentication.
- User-owned meal plans and planned meals.
- Backend-enforced record ownership.
- User-specific favourites and saved information.
- Personalised dashboards and reporting.
- Improved meal-planning workflows.

### Future enhancements

Depending on user needs and project priorities, future releases could introduce:

- AI-assisted meal suggestions.
- Nutrition information from a suitable verified source.
- Shopping lists generated from planned meals.
- More advanced meal calendars.
- Search and filtering of saved plans.
- A multi-tenant hospitality platform for restaurants and other food businesses.

These enhancements are not prerequisites for the Phase 2 MVP.

## 25. Known Limitations

The original GlobalTaste application was designed as a frontend prototype, so some behaviours may still rely on browser-based state or simulated workflows.

The following limitations should be reviewed during the Phase 2 transition:

- Existing favourites, basket, and planner data stored in local storage are not automatically migrated to PostgreSQL.
- Login and registration screens do not constitute working authentication unless connected to a real backend authentication flow.
- Meal discovery may continue to depend on TheMealDB if that integration is retained.
- The planned API endpoints and schemas in this README must be aligned with the actual implementation.
- Authentication, record ownership, and production security should not be considered complete until implemented and tested.
- Deployment URLs and operational status must be added only after the relevant services have been deployed and verified.

## 28. Author and Acknowledgements

**Project:** GlobalTaste

GlobalTaste was developed as a phased software project, beginning with a React frontend proof of concept and progressing towards a full-stack application.

The project demonstrates the application of frontend development, RESTful API design, relational database modelling, asynchronous communication, version control, testing, and technical documentation.

### Acknowledgements

- **TheMealDB:** Public meal information used during the frontend prototype phase.
- **React and Vite:** Frontend development tools.
- **Flask and SQLAlchemy:** Backend development and database integration.
- **PostgreSQL:** Relational data storage.
- **Git and GitHub:** Version control and source code collaboration.

---

*GlobalTaste Phase 2 — Extending meal discovery into a persistent, full-stack meal-planning application.*
