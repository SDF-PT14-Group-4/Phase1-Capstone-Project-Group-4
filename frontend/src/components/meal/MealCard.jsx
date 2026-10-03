import { Link } from "react-router-dom";
import { useFavorites } from "../../context/FavoritesContext";

function MealCard({ meal }) {
  const { toggleFavorite, isFavorite } = useFavorites();

  const favorite = isFavorite(meal.idMeal);

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
          onClick={() => toggleFavorite(meal)}
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
          <p>{meal.strCategory}</p>
        )}

        {meal.strArea && (
          <p>{meal.strArea}</p>
        )}

        <Link to={`/meal/${meal.idMeal}`}>
          View Recipe
        </Link>

      </div>

    </article>
  );
}
export default MealCard;