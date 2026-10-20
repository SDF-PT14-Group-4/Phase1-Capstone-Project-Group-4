
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/+$/, "");

function normalizeMeal(meal) {
  const originalMeal = meal.mealData || {};

  return {
    ...originalMeal,
    idMeal: String(meal.mealId ?? originalMeal.idMeal ?? ""),
    strMeal: meal.name ?? originalMeal.strMeal ?? "",
    strMealThumb:
      meal.image ?? originalMeal.strMealThumb ?? "",
    strCategory:
      meal.category ?? originalMeal.strCategory ?? "",
    strArea:
      meal.cuisine ?? originalMeal.strArea ?? "",
  };
}

async function requestFavorites(path, accessToken, options = {}) {
  if (!accessToken) {
    throw new Error("Please sign in to manage favorites.");
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
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
      data?.error?.message || "Unable to update your favorites."
    );
  }

  return data;
}

export async function getFavorites(accessToken) {
  const data = await requestFavorites("/me/favorites", accessToken);

  return Array.isArray(data?.favorites)
    ? data.favorites.map(normalizeMeal)
    : [];
}

export async function saveFavorite(meal, accessToken) {
  const data = await requestFavorites("/me/favorites", accessToken, {
    method: "POST",
    body: JSON.stringify(meal),
  });

  return normalizeMeal(data);
}

export async function deleteFavorite(mealId, accessToken) {
  return requestFavorites(
    `/me/favorites/${encodeURIComponent(mealId)}`,
    accessToken,
    { method: "DELETE" }
  );
}
