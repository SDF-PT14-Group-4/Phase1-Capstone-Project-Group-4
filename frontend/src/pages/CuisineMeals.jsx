import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MealGrid from "../components/meal/MealGrid";

const BASE_URL =
  "https://www.themealdb.com/api/json/v1/1";

export default function CuisineMeals() {
  const { cuisine } = useParams();

  const decodedCuisine = decodeURIComponent(
    cuisine || ""
  );

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(Boolean(decodedCuisine));
  const [error, setError] = useState(
    decodedCuisine ? "" : "No cuisine was selected."
  );

  useEffect(() => {
    if (!decodedCuisine) {
      return;
    }

    async function loadMeals() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${BASE_URL}/filter.php?a=${encodeURIComponent(
            decodedCuisine
          )}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load cuisine meals."
          );
        }

        const data = await response.json();

        setMeals(data.meals || []);
      } catch {
        setError("Unable to load cuisine meals.");
        setMeals([]);
      } finally {
        setLoading(false);
      }
    }

    loadMeals();
    if (decodedCuisine) {
      loadMeals();
    }
  }, [decodedCuisine]);

  const selectionError = decodedCuisine ? "" : "No cuisine was selected.";
  const displayedError = error || selectionError;

  return (
    <main className="cuisine-meals-page">
      <section className="cuisine-meals-header container">
        <p className="cuisine-eyebrow">
          EXPLORE BY CUISINE
        </p>

        <h1>{decodedCuisine} Cuisine</h1>

        <p className="cuisine-description">
          Discover delicious {decodedCuisine.toLowerCase()} recipes
          to add to your meal plans and favorites.
        </p>
      </section>

      <section className="cuisine-meals-results container">
        {loading && (
          <p className="cuisine-message">
            Loading {decodedCuisine} meals...
          </p>
        )}

        {error && (
          <p
            className="cuisine-message"
            role="alert"
          >
            {error}
          </p>
        )}

        {!loading && !error && (
          <MealGrid meals={meals} />
        )}
      </section>
      {loading && decodedCuisine && (
        <p>Loading {decodedCuisine} meals...</p>
      )}

      {displayedError && <p>{displayedError}</p>}

      {!loading && !displayedError && (
        <MealGrid meals={meals} />
      )}
    </main>
  );
}
