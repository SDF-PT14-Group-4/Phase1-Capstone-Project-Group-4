import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/mealApi.js";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        setError("");

        const data = await getCategories();

        setCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to load categories:", error);

        setError(
          error.message || "Unable to load categories."
        );
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

      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${encodeURIComponent(
                category.name
              )}`}
              className="category-card"
            >
              <img
                src={category.thumbnail}
                alt={category.name}
              />

              <h2>{category.name}</h2>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}