import { useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../../hooks/useFavorites.js";
import SignInPrompt from "../common/SignInPrompt.jsx";

function MealCard({ meal }) {
  const {
    toggleFavorite,
    isFavorite,
    isGuest,
  } = useFavorites();
  const [showPrompt, setShowPrompt] = useState(false);

  const favorite = isFavorite(meal.idMeal);

  function handleFavoriteClick() {
    // Guests cannot save anything, so explain why instead of doing nothing.
    if (isGuest) {
      setShowPrompt((current) => !current);
      return;
    }
    toggleFavorite(meal);
  }

  return (
    <article className="meal-card">
      <div className="meal-card-image">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
        />

        <button
          type="button"
          className={`favorite-button ${
            favorite ? "active" : ""
          }`}
          onClick={handleFavoriteClick}
          aria-label={
            favorite
              ? `Remove ${meal.strMeal} from favorites`
              : `Add ${meal.strMeal} to favorites`
          }
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="meal-card-content">
        <h3>{meal.strMeal}</h3>

        {meal.strCategory && (
          <p>
            <Link
              className="meal-category-link"
              to={`/categories/${encodeURIComponent(meal.strCategory)}`}
              aria-label={`Explore ${meal.strCategory} recipes`}
            >
              {meal.strCategory}
            </Link>
          </p>
        )}

        {meal.strArea && (
          <p>{meal.strArea}</p>
        )}

        <Link to={`/meal/${meal.idMeal}`}>
          View Recipe
        </Link>

        {isGuest && showPrompt && (
          <SignInPrompt inline message="Sign in to save favorites." />
        )}
      </div>
    </article>
  );
}

export default MealCard;
