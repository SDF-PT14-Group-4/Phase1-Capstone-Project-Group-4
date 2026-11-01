
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://phase1-capstone-project-group-4.onrender.com/api"
    : "http://127.0.0.1:5000/api")
).replace(/\/+$/, "");

async function adminRequest(endpoint, accessToken, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Unable to complete the admin request."
    );
  }

  return data;
}

// Get all admin-managed meals.
export async function getAdminMeals(accessToken) {
  const data = await adminRequest("/admin/meals", accessToken);
  return data.meals;
}

// Add a meal.
export async function createAdminMeal(accessToken, meal) {
  const data = await adminRequest("/admin/meals", accessToken, {
    method: "POST",
    body: JSON.stringify(meal),
  });

  return data.meal;
}

// Update a meal.
export async function updateAdminMeal(accessToken, mealId, meal) {
  const data = await adminRequest(`/admin/meals/${mealId}`, accessToken, {
    method: "PUT",
    body: JSON.stringify(meal),
  });

  return data.meal;
}

// Delete a meal.
export async function deleteAdminMeal(accessToken, mealId) {
  return adminRequest(`/admin/meals/${mealId}`, accessToken, {
    method: "DELETE",
  });
}
