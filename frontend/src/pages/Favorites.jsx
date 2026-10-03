import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import MealGrid from "../components/meal/MealGrid";
import { useFavorites } from "../context/FavoritesContext";

function Favorites() {
  const { favorites } = useFavorites();

  return (
    <>
      <PageHeader eyebrow="SAVED" title="Favorites" description="Your locally saved meals." />
      {favorites.length ? (
        <MealGrid meals={favorites} />
      ) : (
        <EmptyState
          title="No favorites yet"
          message="Save meals while browsing and they will appear here."
          action={<Link className="button primary" to="/search">Find a meal</Link>}
        />
      )}
    </>
  );
}

export default Favorites;