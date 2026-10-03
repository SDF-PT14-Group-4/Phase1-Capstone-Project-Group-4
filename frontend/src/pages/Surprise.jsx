import { useState } from "react";
import { Link } from "react-router-dom";
import "./Surprise.css";

function Surprise() {
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getSurpriseMeal() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/random.php"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch a random meal.");
      }

      const data = await response.json();

      if (!data.meals || data.meals.length === 0) {
        setError("No meal was found. Please try again.");
        setMeal(null);
        return;
      }

      setMeal(data.meals[0]);
    } catch {
      setError("Unable to get a surprise meal right now. Please try again.");
      setMeal(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="surprise-page">
      <section className="surprise-hero">
        <p className="surprise-label">GLOBAL TASTE</p>

        <h1>Surprise Me!</h1>

        <p className="surprise-description">
          Can't decide what to eat? Let GlobalTaste choose a meal for you.
        </p>

        <button
          className="surprise-button"
          onClick={getSurpriseMeal}
          disabled={loading}
        >
          {loading ? "Finding a meal..." : "Surprise Me!"}
        </button>
      </section>

      {error && (
        <p className="surprise-error" role="alert">
          {error}
        </p>
      )}

      {meal && !loading && (
        <section className="surprise-card">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className="surprise-image"
          />

          <div className="surprise-content">
            <p className="meal-category">
              {meal.strCategory} · {meal.strArea}
            </p>

            <h2>{meal.strMeal}</h2>

            <p className="meal-description">
              Your random meal from around the world.
            </p>

            <div className="surprise-actions">
              <Link
                to={`/meal/${meal.idMeal}`}
                className="view-meal-button"
              >
                View Full Recipe
              </Link>

              <button
                className="another-meal-button"
                onClick={getSurpriseMeal}
                disabled={loading}
              >
                Try Another
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default Surprise;
