import { authFetch } from "./apiClient.js";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/+$/, "");

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function normalizeMeal(meal) {
  const originalMeal = meal.mealData || {};

  return {
    ...originalMeal,
    idMeal: String(meal.mealId ?? originalMeal.idMeal ?? ""),
    strMeal: meal.name ?? originalMeal.strMeal ?? "",
    strMealThumb: meal.image ?? originalMeal.strMealThumb ?? "",
    strCategory: meal.category ?? originalMeal.strCategory ?? "",
    strArea: meal.cuisine ?? originalMeal.strArea ?? "",
  };
}

async function requestPlanner(path, accessToken, options = {}) {
  if (!accessToken) {
    throw new Error("Please sign in to manage your weekly planner.");
  }

  let response;

  try {
    response = await authFetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to GlobalTaste. Check your connection."
    );
  }

  if (response.status === 204) {
    return null;
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Unable to update your weekly planner."
    );
  }

  return data;
}

export async function getPlanner(accessToken) {
  const data = await requestPlanner("/me/planner", accessToken);

  return Object.fromEntries(
    WEEKDAYS.map((day) => [
      day,
      Array.isArray(data?.planner?.[day])
        ? data.planner[day].map(normalizeMeal)
        : [],
    ])
  );
}

export async function savePlannedMeal(day, meal, accessToken) {
  if (!WEEKDAYS.includes(day)) {
    throw new Error("Please select a valid day.");
  }

  const data = await requestPlanner("/me/planner", accessToken, {
    method: "POST",
    body: JSON.stringify({ day, meal }),
  });

  return normalizeMeal(data);
}

export async function deletePlannedMeal(day, mealId, accessToken) {
  if (!WEEKDAYS.includes(day)) {
    throw new Error("Please select a valid day.");
  }

  return requestPlanner(
    `/me/planner/${encodeURIComponent(day)}/${encodeURIComponent(mealId)}`,
    accessToken,
    { method: "DELETE" }
  );
}
