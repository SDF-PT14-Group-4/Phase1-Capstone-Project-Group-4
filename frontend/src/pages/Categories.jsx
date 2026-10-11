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
      } catch {
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
      <main className="container category-page">
        <section className="category-header">
          <p className="category-eyebrow">
            EXPLORE GLOBAL TASTES
          </p>

          <h1>Meal Categories</h1>

          <p className="category-description">
            Explore meals by category and discover something
            delicious to prepare.
          </p>
        </section>

        <p className="category-message">
          Loading categories...
        </p>
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
      <main className="container category-page">
        <section className="category-header">
          <p className="category-eyebrow">
            EXPLORE GLOBAL TASTES
          </p>

          <h1>Meal Categories</h1>

          <p className="category-description">
            Explore meals by category and discover something
            delicious to prepare.
          </p>
        </section>

        <p className="category-message" role="alert">
          {error}
        </p>
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
    <main className="container category-page">
      <section className="category-header">
        <p className="category-eyebrow">
          EXPLORE GLOBAL TASTES
        </p>

        <h1>Meal Categories</h1>

        <p className="category-description">
          Explore meals by category and discover something
          delicious to prepare.
        </p>
      </section>

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