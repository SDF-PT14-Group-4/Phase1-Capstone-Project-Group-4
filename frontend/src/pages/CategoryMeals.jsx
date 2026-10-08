import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MealGrid from "../components/meal/MealGrid";

const BASE_URL =
  "https://www.themealdb.com/api/json/v1/1";

export default function CategoryMeals() {
  const { category } = useParams();

  const decodedCategory = decodeURIComponent(
    category || ""
  );

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(Boolean(decodedCategory));
  const [error, setError] = useState(
    decodedCategory ? "" : "No category was selected."
  );

  useEffect(() => {
    if (!decodedCategory) {
      return;
    }

    async function loadMeals() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${BASE_URL}/filter.php?c=${encodeURIComponent(
            decodedCategory
          )}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load category meals."
          );
        }

        const data = await response.json();

        setMeals(data.meals || []);
      } catch {
        setError("Unable to load category meals.");
        setMeals([]);
      } finally {
        setLoading(false);
      }
    }

    loadMeals();
    if (decodedCategory) {
      loadMeals();
    }
  }, [decodedCategory]);

  const selectionError = decodedCategory ? "" : "No category was selected.";
  const displayedError = error || selectionError;

  return (
    <main className="category-meals-page">
      <section className="category-meals-header container">
        <p className="category-eyebrow">
          EXPLORE BY CATEGORY
        </p>

        <h1>{decodedCategory} Meals</h1>

        <p className="category-description">
          Discover delicious {decodedCategory.toLowerCase()} recipes
          to add to your meal plans and favorites.
        </p>
      </section>

      <section className="category-meals-results container">
        {loading && (
          <p className="category-message">
            Loading {decodedCategory} meals...
          </p>
        )}

        {error && (
          <p
            className="category-message"
            role="alert"
          >
            {error}
          </p>
        )}

        {!loading && !error && (
          <MealGrid meals={meals} />
        )}
      </section>
      {loading && decodedCategory && (
        <p>Loading {decodedCategory} meals...</p>
      )}

      {displayedError && <p>{displayedError}</p>}

      {!loading && !displayedError && (
        <MealGrid meals={meals} />
      )}
    </main>
  );
}