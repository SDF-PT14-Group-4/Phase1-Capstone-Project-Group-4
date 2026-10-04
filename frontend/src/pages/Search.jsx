import { useState } from 'react';
import { Link } from 'react-router-dom';

function Search() {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter the meal you wish to search for.');
      setMeals([]);
      return;
    }

    setLoading(true);
    setError('');


       try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
            query
          )}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch meals.');
        }

        const data = await response.json();
        const results = data.meals || [];

        if (results.length === 0) {
          setError('No meals found for your search.');
          setMeals([]);
        } else {
          setMeals(results);
        }
      } catch {
        setError('Unable to search meals right now.');
        setMeals([]);
      } finally {
        setLoading(false);
      }
    }

    return (
      <main>
        <h1>Meal Search</h1>
        <p>Search for meals from TheMealDB.</p>

        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a meal"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p role="alert">{error}</p>}

        <ul>
          {meals.map((meal) => (
            <li key={meal.idMeal}>
              <Link to={`/meal/${meal.idMeal}`}>{meal.strMeal}</Link>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  export default Search;

