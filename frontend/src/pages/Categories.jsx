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
        setError("Unable to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (loading) {
    return (
      <main className="category-page container">
        <header className="category-header">
          <p className="category-eyebrow">
            FIND YOUR KIND OF COMFORT
          </p>
          <h1>Meal categories</h1>
        </header>

        <p className="category-message">Loading categories...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="category-page container">
        <header className="category-header">
          <p className="category-eyebrow">
            FIND YOUR KIND OF COMFORT
          </p>
          <h1>Meal categories</h1>
        </header>

        <p className="category-message" role="alert">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="category-page container">
      <header className="category-header">
        <p className="category-eyebrow">
          FIND YOUR KIND OF COMFORT
        </p>

        <h1>Meal categories</h1>

        <p className="category-description">
          From quick breakfasts to special-occasion desserts, find recipes
          by what you’re craving.
        </p>
      </header>

      {categories.length === 0 ? (
        <p className="category-message">
          No meal categories are currently available.
        </p>
      ) : (
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
                loading="lazy"
                decoding="async"
              />

              <div className="category-card-content">
                <h2>{category.strCategory}</h2>

                <p>{category.strCategoryDescription}</p>

                <span>
                  Explore recipes{" "}
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}