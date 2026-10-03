import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MealGrid from "../components/meal/MealGrid";
import { getMealsByCuisine } from "../services/mealApi";

export default function CuisineMeals() {
  const { cuisine } = useParams();

  const decodedCuisine = decodeURIComponent(cuisine);

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMeals() {
      try {
        setLoading(true);

        const data = await getMealsByCuisine(
          decodedCuisine
        );

        setMeals(data);
      } catch (error) {
        setError("Unable to load cuisine meals.");
      } finally {
        setLoading(false);
      }
    }

    loadMeals();
  }, [decodedCuisine]);

  return (
    <main>

      <h1>{decodedCuisine} Cuisine</h1>

      {loading && <p>Loading meals...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <MealGrid meals={meals} />
      )}

    </main>
  );
}