import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MealGrid from "../components/meal/MealGrid";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export default function CuisineMeals() {
  const { cuisine = "" } = useParams();

  let decodedCuisine = cuisine;
  try {
    decodedCuisine = decodeURIComponent(cuisine);
  } catch {
    decodedCuisine = cuisine;
  }

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(Boolean(decodedCuisine));
  const [error, setError] = useState(
    decodedCuisine ? "" : "No cuisine was selected."
  );

  useEffect(() => {
    if (!decodedCuisine) return;

    const controller = new AbortController();

    async function loadMeals() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${BASE_URL}/filter.php?a=${encodeURIComponent(decodedCuisine)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load cuisine meals.");
        }

        const data = await response.json();

        if (!data.meals || data.meals.length === 0) {
          setMeals([]);
          setError(`No meals found for cuisine "${decodedCuisine}".`);
        } else {
          setMeals(data.meals);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load cuisine meals.");
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
  }, [decodedCuisine]);

  return (
    <main className="cuisine-meals-page">
      <section className="cuisine-meals-header container">
        <p className="cuisine-eyebrow">EXPLORE BY CUISINE</p>
        <h1>{decodedCuisine} Cuisine</h1>
        <p className="cuisine-description">
          Discover delicious {decodedCuisine.toLowerCase()} recipes to add to
          your meal plans and favorites.
        </p>
      </section>

      <section className="cuisine-meals-results container">
        {loading && (
          <p className="cuisine-message">
            Loading {decodedCuisine} meals...
          </p>
        )}

        {error && (
          <p className="cuisine-message" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && <MealGrid meals={meals} />}
      </section>
    </main>
  );
}