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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
      } catch (error) {
        console.error("Cuisine meals error:", error);
        setError("Unable to load cuisine meals.");
      } finally {
        setLoading(false);
      }
    }

    if (decodedCuisine) {
      loadMeals();
    } else {
      setError("No cuisine was selected.");
      setLoading(false);
    }
  }, [decodedCuisine]);

  return (
    <main>
      <h1>{decodedCuisine} Cuisine</h1>

      {loading && (
        <p>Loading {decodedCuisine} meals...</p>
      )}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <MealGrid meals={meals} />
      )}
    </main>
  );
}