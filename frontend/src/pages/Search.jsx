import { useState } from "react";
import MealGrid from "../components/meal/MealGrid";
import { searchMeals } from "../services/mealService";
import "./Discovery.css";

function Search() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();

    if (!query.trim()) {
      setError("Enter a meal name to start searching.");
      setMeals([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const results = await searchMeals(query);
      setMeals(results);
      if (results.length === 0) {
        setError("No meals found. Try another name.");
      }
    } catch {
      setMeals([]);
      setError("Unable to search meals right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="discovery-page search-page">
      <header className="discovery-header search-header">
        <p className="eyebrow">YOUR NEXT FAVORITE DISH</p>
        <h1>Find a recipe</h1>
        <p>Search thousands of recipes and explore more from their categories.</p>
      </header>

      <form className="recipe-search-form" onSubmit={handleSearch} role="search">
        <label className="visually-hidden" htmlFor="meal-search">
          Search meals
        </label>
        <input
          id="meal-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try “chicken”, “pasta” or “soup”"
        />
        <button className="discovery-button discovery-button-primary" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <p className="search-message" role="status">
          {error}
        </p>
      )}

      {meals.length > 0 && (
        <section className="search-results" aria-label="Meal search results">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MATCHING RECIPES</p>
              <h2>Search results</h2>
            </div>
            <span className="results-count">
              {meals.length} {meals.length === 1 ? "recipe" : "recipes"}
            </span>
          </div>
          <MealGrid meals={meals} />
        </section>
      )}

      {!hasSearched && (
        <aside className="search-tip">
          <span aria-hidden="true">✦</span>
          <p>
            Every recipe card includes a category link, so you can keep
            exploring dishes with similar ingredients and flavors.
          </p>
        </aside>
      )}
    </main>
  );
}

export default Search;
