import { useState } from "react";
import { searchMeals } from "../services/mealService";
import { usePlanner } from "../context/usePlanner";

function Planner() {
  const { planner, addMeal, removeMeal } = usePlanner();

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

  return (
    <main>
      <h1>Weekly Meal Planner</h1>
      <p>Search for meals and add them to your weekly plan.</p>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a meal"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <label>
        Plan for:{" "}
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          {days.map((day) => (
            <option key={day} value={day}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <section>
        <h2>Search Results</h2>

        {meals.length === 0 && !error && <p>No meals searched yet.</p>}

        <ul>
          {meals.map((meal) => (
            <li key={meal.idMeal}>
              <span>{meal.strMeal}</span>

              <button
                type="button"
                onClick={() => handleAddMeal(meal)}
              >
                Add to {selectedDay}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Weekly Plan</h2>

        {days.map((day) => (
          <div key={day}>
            <h3>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </h3>

            {planner[day].length === 0 ? (
              <p>No meals planned.</p>
            ) : (
              <ul>
                {planner[day].map((meal) => (
                  <li key={meal.idMeal}>
                    {meal.strMeal}

                    <button
                      type="button"
                      onClick={() => removeMeal(day, meal.idMeal)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

export default Planner;