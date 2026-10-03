# GlobalTaste Test Cases

## 1. Scope
This test suite covers the core navigation and user-flow checks for the GlobalTaste meal discovery app. The app currently includes these main routes:

- Home
- Search
- Meal Details
- Categories
- Favorites
- Planner
- Basket
- Surprise Me

## 2. Assumptions
- The app is a React single-page application built with React Router.
- The current implementation is a UI shell, and some user features are expected to be added in later phases.
- The test cases below are written to validate both the existing screens and the likely functional requirements from the project brief.

## 3. Functional Test Cases

### TC-01: Application loads successfully
- ID: TC-01
- Title: App starts on the Home page
- Precondition: User opens the application in a browser
- Steps:
  1. Launch the app.
  2. Wait for the homepage to render.
- Expected result:
  - The GlobalTaste header is visible.
  - The Home page content is displayed.
  - The page does not crash or show a blank screen.

### TC-02: Header navigation is visible on all pages
- ID: TC-02
- Title: Navigation bar displays all main menu items
- Precondition: User is on any valid page
- Steps:
  1. Observe the top navigation bar.
- Expected result:
  - Links for Home, Search, Categories, Favorites, Planner, Basket, and Surprise Me are visible.
  - The branding text GlobalTaste is visible.

### TC-03: Home navigation works
- ID: TC-03
- Title: User can navigate to the Home page
- Steps:
  1. Click the Home link in the header.
- Expected result:
  - The URL updates to the home route.
  - The Home page heading and text are displayed.

### TC-04: Search page navigation works
- ID: TC-04
- Title: User can navigate to the Search page
- Steps:
  1. Click the Search link.
- Expected result:
  - The application navigates to the Search route.
  - The page shows the Search heading.
  - The user can search for meals from TheMealDB.

### TC-05: Categories page navigation works
- ID: TC-05
- Title: User can navigate to the Categories page
- Steps:
  1. Click the Categories link.
- Expected result:
  - The URL points to the categories route.
  - The Categories page heading is visible.
  - The page lists or allows selection of categories and cuisine options.

### TC-06: Favorites page navigation works
- ID: TC-06
- Title: User can navigate to the Favorites page
- Steps:
  1. Click the Favorites link.
- Expected result:
  - The user reaches the Favorites route.
  - The screen displays saved favorite meals or an empty-state message when no favorites exist.

### TC-07: Planner page navigation works
- ID: TC-07
- Title: User can navigate to the Planner page
- Steps:
  1. Click the Planner link.
- Expected result:
  - The Planner route opens successfully.
  - The user can view or organize meal plans.

### TC-08: Basket page navigation works
- ID: TC-08
- Title: User can navigate to the Basket page
- Steps:
  1. Click the Basket link.
- Expected result:
  - The Basket route loads.
  - The user can review selected meals or ingredients.

### TC-09: Surprise Me page navigation works
- ID: TC-09
- Title: User can navigate to the Surprise Me page
- Steps:
  1. Click the Surprise Me link.
- Expected result:
  - The Surprise route loads.
  - The user receives a random meal suggestion or an appropriate discovery experience.

### TC-10: Meal Details route loads with meal ID
- ID: TC-10
- Title: Dynamic meal detail page renders the correct meal ID
- Precondition: A meal ID is available in the URL such as /meal/52772
- Steps:
  1. Navigate to /meal/52772.
- Expected result:
  - The page displays the Meal Details heading.
  - The text includes the provided meal ID.
  - The route matches the URL parameter correctly.

### TC-11: Meal Details route handles missing ID gracefully
- ID: TC-11
- Title: Meal details page does not crash when no meal ID exists
- Steps:
  1. Navigate to /meal.
- Expected result:
  - The app does not crash.
  - The page either shows a fallback message or a helpful empty state.

### TC-12: Main layout persists across navigation
- ID: TC-12
- Title: Header and footer remain visible while switching routes
- Steps:
  1. Move from one page to another using navigation links.
- Expected result:
  - The header and footer remain visible across screen transitions.
  - Only the main content area changes.

### TC-13: Footer content is present
- ID: TC-13
- Title: Footer renders branding and copyright information
- Steps:
  1. Observe the page footer.
- Expected result:
  - The footer contains the GlobalTaste brand.
  - The copyright line shows the current year or a valid text label.

### TC-14: Browser refresh works on route pages
- ID: TC-14
- Title: Refreshing a page does not remove the app shell
- Steps:
  1. Open a route such as /categories.
  2. Refresh the browser.
- Expected result:
  - The app re-renders correctly.
  - The route remains accessible after refresh.

### TC-15: Link active state is applied correctly
- ID: TC-15
- Title: Active navigation item reflects the current page
- Steps:
  1. Click the Search link.
  2. Observe the navigation styling.
- Expected result:
  - The current page link is visually marked as active.
  - Only the active route is emphasized.

### TC-16: Unknown route handling
- ID: TC-16
- Title: Invalid URL does not leave the user on a broken page
- Steps:
  1. Enter a non-existent route such as /unknown-page.
- Expected result:
  - The app shows a not-found state or redirects to a safe page.
  - The page does not render incomplete or broken UI.

### TC-17: Search input placeholder and form behavior
- ID: TC-17
- Title: Search page supports user input
- Steps:
  1. Navigate to Search.
  2. Type a meal keyword into the search field.
- Expected result:
  - The input accepts text.
  - The entered value is visible.
  - Search logic can filter or fetch meal results as designed.

### TC-18: Favorite action can be triggered from a meal card
- ID: TC-18
- Title: User can mark a meal as favorite
- Steps:
  1. Open a meal detail or search result.
  2. Click the favorite button or icon.
- Expected result:
  - The favorite state toggles correctly.
  - The selected meal is saved to the favorites list.
  - The UI reflects the changed state immediately.

### TC-19: Meal selection opens meal details
- ID: TC-19
- Title: Clicking a meal opens its details page
- Steps:
  1. Select a meal from a list or card.
- Expected result:
  - The user is redirected to the meal details route.
  - Correct meal data is displayed.

### TC-20: Surprise feature returns a valid meal recommendation
- ID: TC-20
- Title: Surprise Me generates or selects a valid suggestion
- Steps:
  1. Navigate to Surprise Me.
  2. Trigger the surprise action.
- Expected result:
  - A valid meal is returned.
  - The meal is displayed with the correct title or identifier.
  - No empty or invalid selection is shown.

## 4. Negative / Edge Test Cases

### TC-21: No results returned from search
- ID: TC-21
- Title: Search with no matching meals shows a clear empty state
- Steps:
  1. Enter a keyword that does not match any meals.
- Expected result:
  - No crash occurs.
  - An empty-state message explains that no meals were found.

### TC-22: Duplicate favorites are prevented
- ID: TC-22
- Title: Same meal should not be added twice to favorites
- Steps:
  1. Add the same meal to favorites twice.
- Expected result:
  - The meal appears once in favorites.
  - The UI prevents duplicate saves.

### TC-23: Basket handles empty state
- ID: TC-23
- Title: Basket shows a meaningful empty state when no meals are selected
- Steps:
  1. Open the Basket page without added items.
- Expected result:
  - The empty basket message is displayed.
  - No broken layout or null errors occur.

### TC-24: Meal detail loads when data fetch is delayed
- ID: TC-24
- Title: UI handles loading state correctly
- Steps:
  1. Simulate a slow API response for meal details.
- Expected result:
  - A loading indicator or placeholder appears.
  - The user is informed that content is still loading.

### TC-25: Invalid meal ID is handled gracefully
- ID: TC-25
- Title: Invalid or missing meal data is displayed safely
- Steps:
  1. Navigate to a meal route with an ID that does not exist.
- Expected result:
  - The app shows a not-found or error message.
  - The application remains stable and interactive.

## 5. Suggested Acceptance Criteria
- All main navigation links work correctly.
- The app displays a consistent layout across all routes.
- Meal detail pages render dynamic content using the URL parameter.
- Search, favorites, basket, and surprise flows each show meaningful empty states and valid results.
- The UI handles invalid routes and missing data without crashing.

## 6. Priority Summary
- High priority: TC-01, TC-02, TC-03, TC-04, TC-05, TC-10, TC-12, TC-16, TC-19
- Medium priority: TC-06, TC-07, TC-08, TC-09, TC-15, TC-17, TC-18, TC-20
- Low priority but important: TC-21 to TC-25

## 7. Notes
This test suite is based on the current screen structure and app routes in the project. If the original brief contains additional business rules or requirements from the PDF, these test cases can be expanded into a formal BRD-to-test-matrix format with IDs mapped to each requirement.
