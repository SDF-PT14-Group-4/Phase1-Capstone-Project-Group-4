import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import MealGrid from "../components/meal/MealGrid";
import { getMealsByCategory } from "../services/mealDbApi";

function CategoryMeals() {
  const { category } = useParams();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMealsByCategory(category);
      setMeals(data.meals);
    } catch (err) {
      setError(err);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [category]);

  return (
    <>
      <Link className="back-link" to="/categories">← All categories</Link>
      <PageHeader eyebrow="CATEGORY" title={category} description={`Meals in the ${category} category.`} />
      {loading && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={load} />}
      {!loading && !error && meals.length > 0 && <MealGrid meals={meals} />}
      {!loading && !error && !meals.length && <EmptyState title="No meals found" />}
    </>
  );
}
export default CategoryMeals;
