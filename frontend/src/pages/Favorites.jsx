import MealGrid from "../components/meal/MealGrid";
import { useFavorites } from "../hooks/useFavorites.js";

export default function Favorites() {
  const { favorites, loading, loadError } = useFavorites();

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

      {loading ? (
        <p role="status">Loading your favorites...</p>
      ) : loadError ? (
        <p role="alert">{loadError}</p>
      ) : favorites.length === 0 ? (
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
