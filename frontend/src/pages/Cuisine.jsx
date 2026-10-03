import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCuisines } from "../services/mealApi";

export default function Cuisines() {
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCuisines() {
      try {
        const data = await getCuisines();

        setCuisines(data);
      } catch (error) {
        setError("Unable to load cuisines.");
      } finally {
        setLoading(false);
      }
    }

    loadCuisines();
  }, []);

  if (loading) {
    return <p>Loading cuisines...</p>;
  }

  if (error) {
    return <p>{error}</p>;
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