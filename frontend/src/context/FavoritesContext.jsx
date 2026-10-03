import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const FavoritesContext = createContext(undefined);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favorites");

      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error(
        "Unable to load favorites:",
        error
      );

      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  function addFavorite(meal) {
    setFavorites((currentFavorites) => {
      const exists = currentFavorites.some(
        (favorite) =>
          favorite.idMeal === meal.idMeal
      );

      if (exists) {
        return currentFavorites;
      }

      return [...currentFavorites, meal];
    });
  }

  function removeFavorite(mealId) {
    setFavorites((currentFavorites) =>
      currentFavorites.filter(
        (favorite) =>
          favorite.idMeal !== mealId
      )
    );
  }

  function isFavorite(mealId) {
    return favorites.some(
      (favorite) =>
        favorite.idMeal === mealId
    );
  }

  function toggleFavorite(meal) {
    if (isFavorite(meal.idMeal)) {
      removeFavorite(meal.idMeal);
    } else {
      addFavorite(meal);
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}