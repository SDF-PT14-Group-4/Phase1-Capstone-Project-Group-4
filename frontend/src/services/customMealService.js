import { authFetch } from "./apiClient.js";
import { API_BASE_URL } from "./authService.js";

export const MAX_INGREDIENTS = 20;
export const CUSTOM_MEAL_PREFIX = "custom-";

export class CustomMealApiError extends Error {
  constructor(message, code = "CUSTOM_MEAL_REQUEST_FAILED", status = 0) {
    super(message);
    this.name = "CustomMealApiError";
    this.code = code;
    this.status = status;
  }
}

export function isCustomMealId(id) {
  return typeof id === "string" && /^custom-\d+$/.test(id);
}

async function requestMeals(path, accessToken, options = {}) {
  let response;
  try {
    response = await authFetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
  } catch {
    throw new CustomMealApiError(
      "Unable to connect to GlobalTaste. Check your connection and try again.",
      "NETWORK_ERROR"
    );
  }

  if (response.status === 204) return null;

  let data;
  try {
    data = await response.json();
  } catch {
    throw new CustomMealApiError(
      "The server returned an invalid response.",
      "INVALID_RESPONSE",
      response.status
    );
  }

  if (!response.ok) {
    throw new CustomMealApiError(
      data?.error?.message || "Unable to complete your request.",
      data?.error?.code || "CUSTOM_MEAL_REQUEST_FAILED",
      response.status
    );
  }
  return data;
}

export async function listMyMeals(accessToken) {
  const data = await requestMeals("/me/custom-meals", accessToken);
  return Array.isArray(data?.meals) ? data.meals : [];
}

export async function listPublicMeals(search = "") {
  const query = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
  const data = await requestMeals(`/custom-meals${query}`, null);
  return Array.isArray(data?.meals) ? data.meals : [];
}

export async function createMeal(accessToken, meal) {
  const data = await requestMeals("/me/custom-meals", accessToken, {
    method: "POST",
    body: JSON.stringify(meal),
  });
  return data.meal;
}

export async function updateMeal(accessToken, id, meal) {
  const data = await requestMeals(`/me/custom-meals/${encodeURIComponent(id)}`, accessToken, {
    method: "PUT",
    body: JSON.stringify(meal),
  });
  return data.meal;
}

export function deleteMeal(accessToken, id) {
  return requestMeals(`/me/custom-meals/${encodeURIComponent(id)}`, accessToken, {
    method: "DELETE",
  });
}

// Loads a custom meal for the meal page in the same shape as a TheMealDB meal.
// The token is optional: public meals open for guests, private ones need the owner.
export async function getCustomMealDetails(mealId, accessToken) {
  const numericId = String(mealId).slice(CUSTOM_MEAL_PREFIX.length);
  const data = await requestMeals(
    `/custom-meals/${encodeURIComponent(numericId)}`,
    accessToken
  );
  return { ...data.meal.mealData, ownerName: data.meal.ownerName };
}
