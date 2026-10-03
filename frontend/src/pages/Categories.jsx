import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/mealApi";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        setError("Unable to load categories.");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (loading) {
    return <p>Loading categories...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Meal Categories</h1>

      <div className="category-grid">

        {categories.map((category) => (
          <Link
            key={category.idCategory}
            to={`/categories/${category.strCategory}`}
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