import MealGrid from "../components/meal/MealGrid";
import { useFavorites } from "../context/FavoritesContext";

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <main className="favorites-page container">
      <section className="favorites-header">
        <p className="favorites-eyebrow">
          YOUR COLLECTION
        </p>

        <h1>My Favorites</h1>

        <p className="favorites-description">
          Keep track of the recipes you love and come back
          to them whenever you are ready to cook.
        </p>
      </section>

      {favorites.length === 0 ? (
        <section className="favorites-empty">
          <h2>No favorites yet</h2>

          <p>
            Start exploring meals and save the recipes
            you would like to try.
          </p>
        </section>
      ) : (
        <>
          <div className="favorites-count">
            {favorites.length}{" "}
            {favorites.length === 1
              ? "favorite"
              : "favorites"}
          </div>

          <MealGrid meals={favorites} />
        </>
      )}
    </main>
  );
}
