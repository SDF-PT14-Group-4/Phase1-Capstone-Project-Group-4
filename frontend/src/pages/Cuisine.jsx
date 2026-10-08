import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Discovery.css";

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
      <main className="discovery-page listing-page">
        <header className="discovery-header">
          <p className="eyebrow">TASTE THE WORLD</p>
          <h1>Explore cuisines</h1>
        </header>
        <p>Loading cuisines...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="discovery-page listing-page">
        <header className="discovery-header">
          <p className="eyebrow">TASTE THE WORLD</p>
          <h1>Explore cuisines</h1>
        </header>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="discovery-page listing-page">
      <header className="discovery-header">
        <p className="eyebrow">TASTE THE WORLD</p>
        <h1>Explore cuisines</h1>
        <p>Travel through flavor with recipes inspired by kitchens around the world.</p>
      </header>

      <div className="cuisine-grid">
        {cuisines.map((cuisine) => (
          <Link
            key={cuisine.strArea}
            to={`/cuisines/${encodeURIComponent(
              cuisine.strArea
            )}`}
            className="cuisine-card"
          >
            <span className="cuisine-card-mark" aria-hidden="true">
              {cuisine.strArea.slice(0, 1)}
            </span>
            <h2>{cuisine.strArea}</h2>
            <span className="cuisine-card-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}