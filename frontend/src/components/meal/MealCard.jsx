import { Link } from "react-router-dom";
import { useFavorites } from "../../context/FavoritesContext";

function MealCard({ meal }) {
  const {
    toggleFavorite,
    isFavorite,
  } = useFavorites();

  const favorite = isFavorite(meal.id);

  return (
    <article className="meal-card">
      <div className="meal-card-image">
        <img
          src={meal.thumbnail}
          alt={meal.name}
        />

        <button
          type="button"
          className={`favorite-button ${
            favorite ? "active" : ""
          }`}
          onClick={() => toggleFavorite(meal)}
          aria-label={
            favorite
              ? `Remove ${meal.name} from favorites`
              : `Add ${meal.name} to favorites`
          }
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="meal-card-content">
        <h3>{meal.name}</h3>

        {meal.category && (
          <p>{meal.category}</p>
        )}

        {meal.cuisine && (
          <p>{meal.cuisine}</p>
        )}

        <Link to={`/meal/${meal.id}`}>
          View Recipe
        </Link>
      </div>
    </article>
  );
}

export default MealCard;