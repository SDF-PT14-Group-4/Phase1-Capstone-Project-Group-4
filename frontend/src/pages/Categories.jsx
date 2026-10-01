import { Link } from "react-router-dom";

function Categories({ category }) {
  return (
    <Link className="category-card" to={`/categories/${encodeURIComponent(category.name)}`}>
      {category.thumbnail && <img src={category.thumbnail} alt="" loading="lazy" />}
      <div>
        <h3>{category.name}</h3>
        {category.description && <p>{category.description}</p>}
      </div>
    </Link>
  );
}

import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import CategoryCard from "../components/meal/CategoryCard";
import { getCategories } from "../services/mealDbApi";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data.categories);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <PageHeader eyebrow="BROWSE" title="Meal categories" description="Explore meals by category." />
      {loading && <LoadingState label="Loading categories..." />}
      {error && <ErrorState message={error.message} onRetry={load} />}
      {!loading && !error && (
        <div className="category-grid">
          {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
        </div>
      )}
    </>
  );
}

export default Categories;