import { useState } from "react";
import MealGrid from "../components/meal/MealGrid";

function Search() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter the meal you wish to search for.");
      setMeals([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch meals.");
      }

      const data = await response.json();
      const results = data.meals || [];

      if (results.length === 0) {
        setError("No meals found for your search.");
        setMeals([]);
      } else {
        setMeals(results);
      }
    } catch {
      setError("Unable to search meals right now.");
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="search-page">
      <section className="search-hero container">
        <p className="search-eyebrow">DISCOVER YOUR NEXT MEAL</p>

        <h1>Find a Meal</h1>

        <p className="search-description">
          Search thousands of recipes and discover something delicious
          to cook today.
        </p>

        <form
          className="search-form"
          onSubmit={handleSearch}
        >
          <div className="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a meal..."
              aria-label="Search for a meal"
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      </section>

      <section className="search-results container">
        {error && (
          <div
            className="search-message"
            role="alert"
          >
            {error}
          </div>
        )}

        {!error && meals.length > 0 && (
          <>
            <div className="search-results-header">
              <h2>Search Results</h2>
              <p>
                {meals.length}{" "}
                {meals.length === 1 ? "meal" : "meals"} found
              </p>
            </div>

            <MealGrid meals={meals} />
          </>
        )}
      </section>
    </main>
  );
}

export default Search;