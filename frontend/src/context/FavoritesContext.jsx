import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favorites");

    return savedFavorites
      ? JSON.parse(savedFavorites)
      : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  const addFavorite = (meal) => {
    setFavorites((currentFavorites) => {
      const alreadyFavorite = currentFavorites.some(
        (favorite) => favorite.idMeal === meal.idMeal
      );

      if (alreadyFavorite) {
        return currentFavorites;
      }

      return [...currentFavorites, meal];
    });
  };

  const removeFavorite = (mealId) => {
    setFavorites((currentFavorites) =>
      currentFavorites.filter(
        (favorite) => favorite.idMeal !== mealId
      )
    );
  };

  const toggleFavorite = (meal) => {
    const alreadyFavorite = favorites.some(
      (favorite) => favorite.idMeal === meal.idMeal
    );

    if (alreadyFavorite) {
      removeFavorite(meal.idMeal);
    } else {
      addFavorite(meal);
    }
  };

  const isFavorite = (mealId) => {
    return favorites.some(
      (favorite) => favorite.idMeal === mealId
    );
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}