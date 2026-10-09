import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MealGrid from "../components/meal/MealGrid";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export default function CategoryMeals() {
  const { category = "" } = useParams();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(Boolean(category));
  const [error, setError] = useState(
    category ? "" : "No category was selected.",
  );

  useEffect(() => {
    if (!category) return;

    const controller = new AbortController();

    async function loadMeals() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Failed to load category meals.");
        }

        const data = await response.json();

        if (!data.meals) {
          setError(`No meals found for category "${category}".`);
          setMeals([]);
        } else {
          setMeals(data.meals);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load category meals.");
          setMeals([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMeals();

    return () => controller.abort();
  }, [category]);

  return (
    <main className="category-meals-page">
      <section className="category-meals-header container">
        <p className="category-eyebrow">EXPLORE BY CATEGORY</p>
        <h1>{category} Meals</h1>
        <p className="category-description">
          Discover delicious {category.toLowerCase()} recipes to add to your
          meal plans and favorites.
        </p>
      </section>

      <section className="category-meals-results container">
        {loading && (
          <p className="category-message">
            Loading {category} meals...
          </p>
        )}

        {error && (
          <p className="category-message" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && <MealGrid meals={meals} />}
      </section>
    </main>
  );
}
