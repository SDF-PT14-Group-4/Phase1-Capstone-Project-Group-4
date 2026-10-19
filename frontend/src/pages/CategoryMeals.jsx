import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MealGrid from "../components/meal/MealGrid";
import { getMealsByCategory } from "../services/backendMealService";
import "./Discovery.css";

export default function CategoryMeals() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category || "");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMeals() {
      try {
        setLoading(true);
        setError("");

        const results = await getMealsByCategory(decodedCategory);
        setMeals(results);
      } catch (error) {
        console.error("Category meals error:", error);
        setError("Unable to load category meals.");
      } finally {
        setLoading(false);
      }
    }

    if (!decodedCategory) {
      return;
    }

    loadMeals();
  }, [decodedCategory]);

  const selectionError = decodedCategory ? "" : "No category was selected.";
  const displayedError = error || selectionError;

  return (
    <main className="discovery-page listing-page">
      <h1>{decodedCategory} Meals</h1>

      {loading && decodedCategory && (
        <p>Loading {decodedCategory} meals...</p>
      )}

      {displayedError && <p role="alert">{displayedError}</p>}

      {!loading && !displayedError && <MealGrid meals={meals} />}
    </main>
  );
}
