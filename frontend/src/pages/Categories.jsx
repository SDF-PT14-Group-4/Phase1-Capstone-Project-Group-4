import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Discovery.css";

const BASE_URL =
  "https://www.themealdb.com/api/json/v1/1";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(
          `${BASE_URL}/categories.php`
        );

        if (!response.ok) {
          throw new Error("Failed to load categories.");
        }

        const data = await response.json();

        setCategories(data.categories || []);
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
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="discovery-page listing-page">
      <header className="discovery-header">
        <p className="eyebrow">FIND YOUR KIND OF COMFORT</p>
        <h1>Meal categories</h1>
        <p>From quick breakfasts to special-occasion desserts, find recipes by what you’re craving.</p>
      </header>

      <div className="category-grid">
        {categories.map((category) => (
          <Link
            key={category.idCategory}
            to={`/categories/${encodeURIComponent(
              category.strCategory
            )}`}
            className="category-card"
          >
            <img
              src={category.strCategoryThumb}
              alt={category.strCategory}
            />

            <div className="category-card-content">
              <h2>{category.strCategory}</h2>
              <p>{category.strCategoryDescription}</p>
              <span>Explore recipes <span aria-hidden="true">→</span></span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}