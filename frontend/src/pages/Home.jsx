import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MealGrid from "../components/meal/MealGrid";
import { searchMeals } from "../services/mealService";

function Home() {
  const [featuredMeals, setFeaturedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFeaturedMeals() {
      try {
        setLoading(true);
        setError("");

        const meals = await searchMeals("chicken");

        setFeaturedMeals(meals.slice(0, 6));
      } catch {
        setError(
          "Unable to load featured meals right now."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedMeals();
  }, []);

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">GLOBAL TASTE</p>

          <h1>Discover the world, one meal at a time.</h1>

          <p className="home-hero-description">
            Explore recipes from different cultures, discover new
            flavors, and plan meals you'll love.
          </p>

          <div className="home-hero-actions">
            <Link
              to="/search"
              className="home-primary-button"
            >
              Explore Meals
            </Link>

            <Link
              to="/surprise"
              className="home-secondary-button"
            >
              Surprise Me
            </Link>
          </div>
        </div>
      </section>

      <section className="home-featured">
        <div className="home-section-heading">
          <p className="home-eyebrow">FEATURED MEALS</p>

          <h2>Something delicious to discover</h2>

          <p>
            Explore a selection of recipes and find inspiration
            for your next meal.
          </p>
        </div>

        {loading && (
          <p className="home-message">
            Loading featured meals...
          </p>
        )}

        {error && (
          <p className="home-message" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <MealGrid meals={featuredMeals} />
        )}

        <div className="home-featured-action">
          <Link
            to="/search"
            className="home-primary-button"
          >
            Explore More Meals
          </Link>
        </div>
      </section>

      <section className="home-discovery">
        <div className="home-section-heading">
          <p className="home-eyebrow">EXPLORE</p>

          <h2>A world of flavors awaits</h2>

          <p>
            Search for meals, explore cuisines, save your
            favorites, and create your weekly meal plan with
            GlobalTaste.
          </p>
        </div>

        <div className="home-discovery-grid">
          <Link
            to="/search"
            className="home-discovery-card"
          >
            <span className="home-card-number">01</span>

            <h3>Find a Meal</h3>

            <p>
              Search through recipes and discover something
              delicious.
            </p>
          </Link>

          <Link
            to="/categories"
            className="home-discovery-card"
          >
            <span className="home-card-number">02</span>

            <h3>Explore Categories</h3>

            <p>
              Browse meals by category and discover new
              possibilities.
            </p>
          </Link>

          <Link
            to="/planner"
            className="home-discovery-card"
          >
            <span className="home-card-number">03</span>

            <h3>Plan Your Week</h3>

            <p>
              Organize your favorite meals into a weekly meal
              plan.
            </p>
          </Link>
        </div>
      </section>

      <section className="home-callout">
        <div>
          <p className="home-eyebrow">CAN'T DECIDE?</p>

          <h2>Let GlobalTaste choose for you.</h2>
        </div>

        <Link
          to="/surprise"
          className="home-primary-button"
        >
          Surprise Me
        </Link>
      </section>
    </main>
  );
}

export default Home;