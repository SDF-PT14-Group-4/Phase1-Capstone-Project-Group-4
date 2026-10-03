import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MealGrid from "../components/meal/MealGrid";
import { getMealsByCategory } from "../services/mealApi";

export default function CategoryMeals() {
  const { category } = useParams();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMeals() {
      try {
        setLoading(true);

        const data = await getMealsByCategory(category);

        setMeals(data);
      } catch (error) {
        setError("Unable to load meals.");
      } finally {
        setLoading(false);
      }
    }

    loadMeals();
  }, [category]);

  return (
    <main>

      <h1>{category} Meals</h1>

      {loading && <p>Loading meals...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <MealGrid meals={meals} />
      )}

    </main>
  );
}