import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/backendMealService";
import "./Discovery.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        setError("");

        const results = await getCategories();
        setCategories(results);
      } catch (error) {
        console.error("Categories error:", error);
        setError("Unable to load categories.");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (loading) {
    return (
      <main className="discovery-page listing-page">
        <header className="discovery-header">
          <p className="eyebrow">FIND YOUR KIND OF COMFORT</p>
          <h1>Meal categories</h1>
        </header>
        <p>Loading categories...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="discovery-page listing-page">
        <header className="discovery-header">
          <p className="eyebrow">FIND YOUR KIND OF COMFORT</p>
          <h1>Meal categories</h1>
        </header>
        <p role="alert">{error}</p>
      </main>
    );
  }

  return (
    <main className="discovery-page listing-page">
      <header className="discovery-header">
        <p className="eyebrow">FIND YOUR KIND OF COMFORT</p>
        <h1>Meal categories</h1>
        <p>
          From quick breakfasts to special-occasion desserts, find recipes by
          what you’re craving.
        </p>
      </header>

      <div className="category-grid">
        {categories.map((category) => (
          <Link
            key={category.idCategory}
            to={`/categories/${encodeURIComponent(category.strCategory)}`}
            className="category-card"
          >
            <img
              src={category.strCategoryThumb}
              alt={category.strCategory}
            />

            <div className="category-card-content">
              <h2>{category.strCategory}</h2>
              <p>{category.strCategoryDescription}</p>
              <span>
                Explore recipes <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
