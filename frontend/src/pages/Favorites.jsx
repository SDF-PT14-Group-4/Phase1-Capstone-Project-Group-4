import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import MealGrid from "../components/meal/MealGrid";

import { useFavorites } from "../context/FavoritesContext";

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <main>

      <PageHeader
        eyebrow="SAVED"
        title="My Favorites"
      />

      {favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Save meals you love and they will appear here."
        />
      ) : (
        <MealGrid meals={favorites} />
      )}

    </main>
  );
}