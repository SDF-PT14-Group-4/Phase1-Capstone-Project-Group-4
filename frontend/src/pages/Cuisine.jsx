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
      } catch (error) {
        console.error("Cuisine error:", error);
        setError("Unable to load cuisines.");
      } finally {
        setLoading(false);
      }
    }

    loadCuisines();
  }, []);

  if (loading) {
    return (
      <main>
        <h1>Explore Cuisines</h1>
        <p>Loading cuisines...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Explore Cuisines</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Explore Cuisines</h1>

      <div className="cuisine-grid">
        {cuisines.map((cuisine) => (
          <Link
            key={cuisine.strArea}
            to={`/cuisines/${encodeURIComponent(
              cuisine.strArea
            )}`}
            className="cuisine-card"
          >
            <h2>{cuisine.strArea}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}