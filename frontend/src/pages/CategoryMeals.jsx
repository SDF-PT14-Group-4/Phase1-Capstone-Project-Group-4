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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
      } catch (error) {
        console.error("Category meals error:", error);
        setError("Unable to load category meals.");
      } finally {
        setLoading(false);
      }
    }

    if (decodedCategory) {
      loadMeals();
    } else {
      setError("No category was selected.");
      setLoading(false);
    }
  }, [decodedCategory]);

  return (
    <main>
      <h1>{decodedCategory} Meals</h1>

      {loading && (
        <p>Loading {decodedCategory} meals...</p>
      )}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <MealGrid meals={meals} />
      )}
    </main>
  );
}