import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchMeals } from "../services/mealService";
import { usePlanner } from "../context/usePlanner";
import { useAuth } from "../hooks/useAuth.js";
import SignInPrompt from "../components/common/SignInPrompt.jsx";
import { listMyMeals } from "../services/customMealService.js";
import "./Planner.css";

function Planner() {
  const {
  planner,
  addMeal,
  removeMeal,
  clearDay,
  plannerLoading,
  plannerError,
  isGuest,
} = usePlanner();
  const { accessToken } = useAuth();

  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [selectedDay, setSelectedDay] = useState("monday");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Tagged with the token it was loaded for, so one account's meals are never
  // shown to the next account that signs in on this device.
  const [customState, setCustomState] = useState({ token: null, meals: [] });

  const days = Object.keys(planner);

  // The user's own meals can be planned just like meals from the search.
  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    listMyMeals(accessToken)
      .then((items) => {
        if (!active) return;
        // Ignore anything that is not a well-formed custom meal.
        const valid = items.filter(
          (item) =>
            item &&
            typeof item.name === "string" &&
            typeof item.mealId === "string" &&
            item.mealData
        );
        setCustomState({ token: accessToken, meals: valid });
      })
      .catch(() => {
        if (active) setCustomState({ token: accessToken, meals: [] });
      });
    return () => {
      active = false;
    };
  }, [accessToken]);

  const visibleCustomMeals =
    accessToken && customState.token === accessToken ? customState.meals : [];
  const customMatches = visibleCustomMeals.filter((meal) =>
    meal.name.toLowerCase().includes(query.trim().toLowerCase())
  );

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


  function handleClearSearch() {
    setQuery("");
    setMeals([]);
    setError("");
  }


  function handleAddMeal(meal) {
    addMeal(selectedDay, meal);
  }

  function formatDay(day) {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  return (
    <main className="planner-page container">
      <header className="planner-header">
        <h1>Weekly Meal Planner</h1>
        <p>Search for meals and organize your meals for the week.</p>
      </header>

      {isGuest && (
        <SignInPrompt
          title="Sign in to use your meal planner"
          message="The planner saves a meal for each day of your week to your account, so it is there whenever you come back. You can still search for meals below, then sign in to plan them."
        />
      )}

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

  <button
    type="button"
    onClick={handleClearSearch}
    disabled={loading && meals.length === 0}
  >
    Clear Search
  </button>
</form>

        {error && (
          <p className="planner-error" role="alert">
            {error}
          </p>
        )}

        {plannerError && (
           <p className="planner-error" role="alert">
            {plannerError}
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

      {!isGuest && customMatches.length > 0 && (
        <section className="planner-section">
          <div className="planner-section-header">
            <h2>Your Custom Meals</h2>
            <Link to="/my-meals">Manage my meals</Link>
          </div>
          <div className="planner-meal-grid">
            {customMatches.map((meal) => (
              <article className="planner-meal-card" key={meal.mealId}>
                {meal.image && (
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="planner-meal-image"
                  />
                )}
                <div className="planner-meal-content">
                  <h3>{meal.name}</h3>
                  {meal.category && <p>{meal.category}</p>}
                  {meal.cuisine && <p>{meal.cuisine}</p>}
                  <button
                    type="button"
                    onClick={() => handleAddMeal(meal.mealData)}
                    disabled={plannerLoading}
                  >
                    {`Add to ${formatDay(selectedDay)}`}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!isGuest && visibleCustomMeals.length === 0 && (
        <p className="planner-empty">
          Want to plan a meal that is not in the search? <Link to="/my-meals">Create your own meal</Link>.
        </p>
      )}

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
                {meal.strMealThumb && (
                  <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    className="planner-meal-image"
                  />
                )}

                <div className="planner-meal-content">
                  <h3>{meal.strMeal}</h3>

                  {meal.strCategory && (
                    <p>{meal.strCategory}</p>
                  )}

                  {meal.strArea && (
                    <p>{meal.strArea}</p>
                  )}

                  {isGuest ? (
                    <SignInPrompt inline message="Sign in to plan this meal." />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddMeal(meal)}
                      disabled={plannerLoading}
                    >
                      {plannerLoading
                        ? "Loading plan..."
                        : `Add to ${formatDay(selectedDay)}`}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {!isGuest && (
      <section className="planner-section">
        <div className="planner-section-header">
          <h2>Your Weekly Plan</h2>
        </div>
        {plannerLoading && (
  <p role="status">Loading your saved weekly plan...</p>
)}

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
    {meal.strMealThumb && (
      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
      />
    )}

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
      )}
    </main>
  );
}

export default Planner;