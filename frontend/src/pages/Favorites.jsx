import MealGrid from "../components/meal/MealGrid";
import { useFavorites } from "../hooks/useFavorites.js";

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <main>
      <h1>My Favorites</h1>

      {favorites.length === 0 ? (
        <p>
          You haven't added any favorites yet.
        </p>
      ) : (
        <MealGrid meals={favorites} />
      )}
    </main>
  );
}