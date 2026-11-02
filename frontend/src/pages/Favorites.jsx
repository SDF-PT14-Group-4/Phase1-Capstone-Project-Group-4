import MealGrid from "../components/meal/MealGrid";
import { useFavorites } from "../hooks/useFavorites.js";
import { useAuth } from "../hooks/useAuth.js";
import SignInPrompt from "../components/common/SignInPrompt.jsx";

export default function Favorites() {
  const { favorites, loading, error, setError } = useFavorites();
  const { isAuthenticated } = useAuth();

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

      {!isAuthenticated ? (
        <SignInPrompt
          title="Sign in to view your favorites"
          message="Your saved recipes are connected to your account. Sign in to save meals you love and find them again on any device. You can still browse every recipe without an account."
        />
      ) : loading ? (
        <section className="favorites-empty" aria-live="polite">
          <p>Loading your favorites...</p>
        </section>
      ) : error ? (
        <section className="favorites-empty" role="alert">
          <h2>Unable to load favorites</h2>
          <p>{error}</p>
          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </section>
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
            {favorites.length === 1 ? "favorite" : "favorites"}
          </div>

          <MealGrid meals={favorites} />
        </>
      )}
    </main>
  );
}