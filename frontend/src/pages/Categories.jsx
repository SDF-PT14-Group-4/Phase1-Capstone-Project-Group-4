import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
      <main>
        <h1>Meal Categories</h1>
        <p>Loading categories...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Meal Categories</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Meal Categories</h1>

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

            <h2>{category.strCategory}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}