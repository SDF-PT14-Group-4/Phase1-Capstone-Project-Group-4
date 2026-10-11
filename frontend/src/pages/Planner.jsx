import { useState } from "react";
import { Link } from "react-router-dom";
import { searchMeals } from "../services/mealService";
import { usePlanner } from "../context/usePlanner";
import "./Planner.css";

function Planner() {
  const {
  planner,
  addMeal,
  removeMeal,
  clearDay,
} = usePlanner();

  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [selectedDay, setSelectedDay] = useState("monday");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const days = Object.keys(planner);

  async function handleSearch(e) {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a meal to search for.");
      setMeals([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results = await searchMeals(query);
      setMeals(results);

      if (results.length === 0) {
        setError("No meals found.");
      }
    } catch {
      setMeals([]);
      setError("Unable to search meals right now.");
    } finally {
      setLoading(false);
    }
  }

  function handleAddMeal(meal) {
    addMeal(selectedDay, meal);
  }

  function formatDay(day) {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  return (
    <main className="planner-page">
      <header className="planner-header">
        <h1>Weekly Meal Planner</h1>
        <p>Search for meals and organize your meals for the week.</p>
      </header>

      <section className="planner-search">
        <form onSubmit={handleSearch} className="planner-search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a meal"
            aria-label="Search for a meal"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <p className="planner-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="planner-day-selector">
        <label htmlFor="planner-day">
          Plan meal for:
        </label>

        <select
          id="planner-day"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          {days.map((day) => (
            <option key={day} value={day}>
              {formatDay(day)}
            </option>
          ))}
        </select>
      </section>

      <section className="planner-section">
        <div className="planner-section-header">
          <h2>Search Results</h2>
          {meals.length > 0 && <span>{meals.length} meals found</span>}
        </div>

        {meals.length === 0 && !error && (
          <p className="planner-empty">
            Search for a meal to see results here.
          </p>
        )}

        {meals.length > 0 && (
          <div className="planner-meal-grid">
            {meals.map((meal) => (
              <article className="planner-meal-card" key={meal.idMeal}>
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="planner-meal-image"
                />

                <div className="planner-meal-content">
                  <h3>{meal.strMeal}</h3>

                  {meal.strCategory && (
                    <p>{meal.strCategory}</p>
                  )}

                  {meal.strArea && (
                    <p>{meal.strArea}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAddMeal(meal)}
                  >
                    Add to {formatDay(selectedDay)}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="planner-section">
        <div className="planner-section-header">
          <h2>Your Weekly Plan</h2>
        </div>

        <div className="weekly-plan">
          {days.map((day) => (
            <section className="day-plan" key={day}>
              <div className="day-plan-header">
  <div>
    <h3>{formatDay(day)}</h3>
    <span>
      {planner[day].length}{" "}
      {planner[day].length === 1 ? "meal" : "meals"}
    </span>
  </div>

  {planner[day].length > 0 && (
    <button
      type="button"
      className="clear-day-button"
      onClick={() => clearDay(day)}
    >
      Clear Day
    </button>
  )}
</div>

              {planner[day].length === 0 ? (
                <p className="planner-empty">
                  No meals planned.
                </p>
              ) : (
                <div className="planned-meals">
                  {planner[day].map((meal) => (
                    <article
  className="planned-meal"
  key={meal.idMeal}
>
  <Link
    to={`/meal/${meal.idMeal}`}
    className="planned-meal-link"
  >
    <img
      src={meal.strMealThumb}
      alt={meal.strMeal}
    />

    <div className="planned-meal-info">
      <h4>{meal.strMeal}</h4>
      <span>View recipe →</span>
    </div>
  </Link>

  <button
    type="button"
    className="planned-meal-remove"
    onClick={() =>
      removeMeal(day, meal.idMeal)
    }
  >
    Remove
  </button>
</article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Planner;