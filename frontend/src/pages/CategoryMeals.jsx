import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MealGrid from "../components/meal/MealGrid";
import { getMealsByCategory } from "../services/mealApi.js";

export default function CategoryMeals() {
  const { category } = useParams();

  const decodedCategory = decodeURIComponent(category);

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMeals() {
      try {
        setLoading(true);
        setError("");

        console.log("Loading category:", decodedCategory);

        const data = await getMealsByCategory(decodedCategory);

        console.log("API returned:", data);
        console.log("Meals returned:", data.meals);

        setMeals(data.meals);
      } catch (error) {
        console.error("Category meals error:", error);
        setError(error.message || "Unable to load category meals.");
      } finally {
        setLoading(false);
      }
    }

    loadMeals();
  }, [decodedCategory]);

  return (
    <main>
      <h1>{decodedCategory} Meals</h1>

      {loading && <p>Loading meals...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <MealGrid meals={meals} />
      )}
    </main>
  );
}