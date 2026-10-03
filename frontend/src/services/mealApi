const BASE_URL =
  import.meta.env.VITE_MEALDB_BASE_URL ||
  "https://www.themealdb.com/api/json/v1/1";

export class ApiError extends Error {
  constructor(message, code = "API_REQUEST_FAILED", status = 0) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

function validate(value, label) {
  if (!String(value ?? "").trim()) {
    throw new ApiError(`${label} is required.`, "INVALID_REQUEST", 400);
  }
}

async function request(path, emptyMessage = "No data was returned.") {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`);
  } catch {
    throw new ApiError(
      "Unable to connect to the meal service. Check your connection and try again.",
      "NETWORK_ERROR",
      0
    );
  }

  if (!response.ok) {
    const code =
      response.status === 429
        ? "RATE_LIMITED"
        : response.status >= 500
          ? "API_UNAVAILABLE"
          : response.status === 404
            ? "NOT_FOUND"
            : "API_REQUEST_FAILED";
    throw new ApiError(
      response.status === 429
        ? "The meal service is busy. Please try again shortly."
        : "The meal service could not complete your request.",
      code,
      response.status
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "The meal service returned an invalid response.",
      "INVALID_RESPONSE",
      response.status
    );
  }

  if (!data || typeof data !== "object") {
    throw new ApiError(emptyMessage, "INVALID_RESPONSE", response.status);
  }

  return data;
}

function normalizeMealSummary(raw) {
  if (!raw) return null;
  return {
    id: String(raw.idMeal ?? raw.id ?? ""),
    name: raw.strMeal ?? raw.name ?? "Unnamed meal",
    thumbnail: raw.strMealThumb ?? raw.thumbnail ?? "",
    category: raw.strCategory ?? raw.category ?? "",
    cuisine: raw.strArea ?? raw.cuisine ?? ""
  };
}

function normalizeMeal(raw) {
  if (!raw) return null;

  const ingredients = [];
  for (let i = 1; i <= 20; i += 1) {
    const name = raw[`strIngredient${i}`]?.trim();
    const measurement = raw[`strMeasure${i}`]?.trim();
    if (name) ingredients.push({ name, measurement: measurement || "" });
  }

  return {
    id: String(raw.idMeal ?? raw.id ?? ""),
    name: raw.strMeal ?? raw.name ?? "Unnamed meal",
    image: raw.strMealThumb ?? raw.image ?? "",
    thumbnail: raw.strMealThumb ?? raw.thumbnail ?? "",
    category: raw.strCategory ?? raw.category ?? "",
    cuisine: raw.strArea ?? raw.cuisine ?? "",
    ingredients,
    instructions: raw.strInstructions?.trim() || "",
    videoUrl: raw.strYoutube?.trim() || "",
    sourceUrl: raw.strSource?.trim() || "",
    tags: raw.strTags
      ? raw.strTags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : []
  };
}

function normalizeCategory(raw) {
  return {
    id: String(raw.idCategory ?? raw.id ?? ""),
    name: raw.strCategory ?? raw.name ?? "",
    thumbnail: raw.strCategoryThumb ?? raw.thumbnail ?? "",
    description: raw.strCategoryDescription ?? raw.description ?? ""
  };
}

export async function searchMeals(query) {
  validate(query, "Search term");
  const data = await request(
    `/search.php?s=${encodeURIComponent(query.trim())}`,
    "No meals found."
  );
  return {
    meals: (data.meals ?? []).map(normalizeMealSummary).filter(Boolean)
  };
}

export async function getMealById(id) {
  validate(id, "Meal ID");
  const data = await request(
    `/lookup.php?i=${encodeURIComponent(id)}`,
    "Meal not found."
  );
  const meal = normalizeMeal(data.meals?.[0]);
  if (!meal) {
    throw new ApiError("The requested meal could not be found.", "EMPTY_RESULT", 404);
  }
  return meal;
}

export async function getRandomMeal() {
  const data = await request("/random.php", "No random meal was returned.");
  const meal = normalizeMeal(data.meals?.[0]);
  if (!meal) {
    throw new ApiError("No random meal was returned.", "EMPTY_RESULT", 404);
  }
  return meal;
}

export async function getCategories() {
  const data = await request("/categories.php", "No categories were returned.");
  return {
    categories: (data.categories ?? []).map(normalizeCategory).filter((item) => item.name)
  };
}

export async function getMealsByCategory(category) {
  validate(category, "Category");
  const data = await request(
    `/filter.php?c=${encodeURIComponent(category.trim())}`,
    "No meals found in this category."
  );
  return {
    meals: (data.meals ?? []).map(normalizeMealSummary).filter(Boolean)
  };
}

export async function getMealsByCuisine(cuisine) {
  validate(cuisine, "Cuisine");
  const data = await request(
    `/filter.php?a=${encodeURIComponent(cuisine.trim())}`,
    "No meals found for this cuisine."
  );
  return {
    meals: (data.meals ?? []).map(normalizeMealSummary).filter(Boolean)
  };
}

// TheMealDB's free endpoint does not expose a separate "list areas" route in the
// contract used by this design. Cuisine discovery is therefore represented by
// a curated list of supported areas, while meal results remain API-driven.
export const SUPPORTED_CUISINES = [
  "American", "British", "Canadian", "Chinese", "Croatian", "Dutch",
  "Egyptian", "Filipino", "French", "Greek", "Indian", "Irish", "Italian",
  "Jamaican", "Japanese", "Kenyan", "Malaysian", "Mexican", "Moroccan",
  "Polish", "Portuguese", "Russian", "Spanish", "Thai", "Tunisian",
  "Turkish", "Ukrainian", "Vietnamese"
];
