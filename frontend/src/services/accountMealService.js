import { requireApiBaseUrl } from "./apiConfig.js";

export class AccountMealApiError extends Error {
  constructor(message, code = "ACCOUNT_MEAL_REQUEST_FAILED", status = 0) {
    super(message);
    this.name = "AccountMealApiError";
    this.code = code;
    this.status = status;
  }
}

async function request(path, accessToken, options = {}) {
  let apiBaseUrl;
  try {
    apiBaseUrl = requireApiBaseUrl();
  } catch (error) {
    throw new AccountMealApiError(error.message, "API_NOT_CONFIGURED");
  }

  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new AccountMealApiError(
      "Unable to connect to the account service. Check your connection and try again.",
      "NETWORK_ERROR"
    );
  }

  if (response.status === 204) return null;

  let data;
  try {
    data = await response.json();
  } catch {
    throw new AccountMealApiError(
      "The account service returned an invalid response.",
      "INVALID_RESPONSE",
      response.status
    );
  }

  if (!response.ok) {
    throw new AccountMealApiError(
      data?.error?.message || "The account service could not complete your request.",
      data?.error?.code || "ACCOUNT_MEAL_REQUEST_FAILED",
      response.status
    );
  }

  return data;
}

function toMeal(record) {
  const mealData =
    record?.mealData && typeof record.mealData === "object"
      ? record.mealData
      : {};
  return {
    ...mealData,
    idMeal: String(record?.mealId ?? mealData.idMeal ?? ""),
    strMeal: record?.name ?? mealData.strMeal ?? "",
    strMealThumb: record?.image ?? mealData.strMealThumb ?? "",
    strCategory: record?.category ?? mealData.strCategory ?? "",
    strArea: record?.cuisine ?? mealData.strArea ?? "",
  };
}

function mealPayload(meal) {
  return {
    ...meal,
    mealId: meal.idMeal ?? meal.mealId ?? meal.id,
    name: meal.strMeal ?? meal.name,
    image: meal.strMealThumb ?? meal.image ?? meal.thumbnail ?? "",
    category: meal.strCategory ?? meal.category ?? "",
    cuisine: meal.strArea ?? meal.cuisine ?? "",
  };
}

export async function getFavorites(accessToken) {
  const data = await request("/me/favorites", accessToken);
  if (!Array.isArray(data?.favorites)) {
    throw new AccountMealApiError(
      "The account service returned an invalid favorites response.",
      "INVALID_RESPONSE"
    );
  }
  return data.favorites.map(toMeal);
}

export async function addFavorite(accessToken, meal) {
  return toMeal(
    await request("/me/favorites", accessToken, {
      method: "POST",
      body: JSON.stringify(mealPayload(meal)),
    })
  );
}

export function removeFavorite(accessToken, mealId) {
  return request(`/me/favorites/${encodeURIComponent(mealId)}`, accessToken, {
    method: "DELETE",
  });
}

export async function getPlanner(accessToken) {
  const data = await request("/me/planner", accessToken);
  if (!data?.planner || typeof data.planner !== "object") {
    throw new AccountMealApiError(
      "The account service returned an invalid planner response.",
      "INVALID_RESPONSE"
    );
  }
  return Object.fromEntries(
    Object.entries(data.planner).map(([day, meals]) => [
      day,
      Array.isArray(meals) ? meals.map(toMeal) : [],
    ])
  );
}

export async function addPlannedMeal(accessToken, day, meal) {
  const record = await request("/me/planner", accessToken, {
    method: "POST",
    body: JSON.stringify({ day, meal: mealPayload(meal) }),
  });
  return { day: record.day, meal: toMeal(record) };
}

export function removePlannedMeal(accessToken, day, mealId) {
  return request(
    `/me/planner/${encodeURIComponent(day)}/${encodeURIComponent(mealId)}`,
    accessToken,
    { method: "DELETE" }
  );
}

export function clearPlannedDay(accessToken, day) {
  return request(
    `/me/planner/${encodeURIComponent(day)}`,
    accessToken,
    { method: "DELETE" }
  );
}
