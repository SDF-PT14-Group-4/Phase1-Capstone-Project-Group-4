
const API_BASE_URL = "/api";

// Shared helper for sending requests to the Flask backend.
async function fetchFromBackend(endpoint, signal) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    signal,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Unable to load meal data."
    );
  }

  return data;
}

// Search meals by name or keyword.
export async function searchMeals(query = "", signal) {
  const endpoint = `/meals/search?q=${encodeURIComponent(query.trim())}`;
  const data = await fetchFromBackend(endpoint, signal);

  return Array.isArray(data.meals) ? data.meals : [];
}

// Fetch one meal using its ID.
export async function getMealById(id, signal) {
  const endpoint = `/meals/${encodeURIComponent(id)}`;
  const data = await fetchFromBackend(endpoint, signal);

  return Array.isArray(data.meals) ? data.meals[0] || null : null;
}

// Fetch all meal categories.
export async function getCategories(signal) {
  const data = await fetchFromBackend("/meals/categories", signal);

  return Array.isArray(data.categories) ? data.categories : [];
}

// Fetch all available cuisines.
export async function getCuisines(signal) {
  const data = await fetchFromBackend("/meals/cuisines", signal);

  return Array.isArray(data.meals) ? data.meals : [];
}

// Fetch a random meal.
export async function getRandomMeal(signal) {
  const data = await fetchFromBackend("/meals/random", signal);

  return Array.isArray(data.meals) ? data.meals[0] || null : null;
}

// Fetch meals belonging to a selected category.
export async function getMealsByCategory(category, signal) {
  const endpoint = `/meals/category/${encodeURIComponent(category)}`;
  const data = await fetchFromBackend(endpoint, signal);

  return Array.isArray(data.meals) ? data.meals : [];
}

// Fetch meals belonging to a selected cuisine.
export async function getMealsByCuisine(cuisine, signal) {
  const endpoint = `/meals/cuisine/${encodeURIComponent(cuisine)}`;
  const data = await fetchFromBackend(endpoint, signal);

  return Array.isArray(data.meals) ? data.meals : [];
}
