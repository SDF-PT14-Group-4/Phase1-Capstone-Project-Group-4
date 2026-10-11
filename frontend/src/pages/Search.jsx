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
      query,
    )}`,
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

return ( <main className="search-page"> <section className="search-hero container"> <p className="search-eyebrow">DISCOVER YOUR NEXT MEAL</p>


    <h1>Find a Meal</h1>

    <p className="search-description">
      Search thousands of recipes and discover something delicious
      to cook today.
    </p>

    <form className="search-form" onSubmit={handleSearch}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a meal..."
          aria-label="Search for a meal"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  </section>

  <section className="search-results container">
    {error && (
      <div className="search-message" role="alert">
        {error}
      </div>
    )}

    {!error && meals.length > 0 && (
      <>
        <div className="search-results-header">
          <h2>Search Results</h2>
          <p>
            {meals.length} {meals.length === 1 ? "meal" : "meals"} found
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
