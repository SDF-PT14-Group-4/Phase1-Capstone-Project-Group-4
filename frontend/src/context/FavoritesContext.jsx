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
      const savedFavorites =
        localStorage.getItem("favorites");

      return savedFavorites
        ? JSON.parse(savedFavorites)
        : [];
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

  const addFavorite = (meal) => {
    setFavorites((currentFavorites) => {
      const alreadyExists =
        currentFavorites.some(
          (favorite) =>
            favorite.idMeal === meal.idMeal
        );

      if (alreadyExists) {
        return currentFavorites;
      }

      return [...currentFavorites, meal];
    });
  };

  const removeFavorite = (mealId) => {
    setFavorites((currentFavorites) =>
      currentFavorites.filter(
        (favorite) =>
          favorite.idMeal !== mealId
      )
    );
  };

  const isFavorite = (mealId) => {
    return favorites.some(
      (favorite) =>
        favorite.idMeal === mealId
    );
  };

  const toggleFavorite = (meal) => {
    if (isFavorite(meal.idMeal)) {
      removeFavorite(meal.idMeal);
    } else {
      addFavorite(meal);
    }
  };

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