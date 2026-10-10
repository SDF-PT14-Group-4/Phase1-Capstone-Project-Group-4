import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BASE_URL =
  "https://www.themealdb.com/api/json/v1/1";

export default function Cuisines() {
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCuisines() {
      try {
        const response = await fetch(
          `${BASE_URL}/list.php?a=list`
        );

        if (!response.ok) {
          throw new Error("Failed to load cuisines.");
        }

        const data = await response.json();

        setCuisines(data.meals || []);
      } catch {
        setError("Unable to load cuisines.");
      } finally {
        setLoading(false);
      }
    }

    loadCuisines();
  }, []);

  return (
    <main className="container cuisine-page">
      <section className="cuisine-header">
        <p className="cuisine-eyebrow">
          EXPLORE GLOBAL FLAVORS
        </p>

        <h1>Meal Cuisines</h1>

        <p className="cuisine-description">
          Discover recipes from different cuisines around
          the world and explore new flavors.
        </p>
      </section>

      {loading && (
        <p className="cuisine-message">
          Loading cuisines...
        </p>
      )}

      {error && (
        <p
          className="cuisine-message"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="cuisine-grid">
          {cuisines.map((cuisine) => (
            <Link
              key={cuisine.strArea}
              to={`/cuisines/${encodeURIComponent(
                cuisine.strArea
              )}`}
              className="cuisine-card"
            >
              <span>{cuisine.strArea}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
