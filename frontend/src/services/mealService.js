const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export async function searchMeals(query = '') {
  const endpoint = `${BASE_URL}/search.php?s=${encodeURIComponent(query.trim())}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error('Failed to fetch meals');
  }

  const data = await response.json();
  return data.meals ?? [];
}

export async function getMealById(id) {
  if (!id) {
    return null;
  }

  const endpoint = `${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error('Failed to fetch meal');
  }

  const data = await response.json();
  return data.meals?.[0] ?? null;
}
