import { createContext, useContext, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.favorites, []);

  function isFavorite(id) {
    return favorites.some((meal) => meal.id === String(id));
  }

  function addFavorite(meal) {
    if (!meal?.id || isFavorite(meal.id)) return;
    setFavorites((current) => [...current, meal]);
  }

  function removeFavorite(id) {
    setFavorites((current) => current.filter((meal) => meal.id !== String(id)));
  }

  function toggleFavorite(meal) {
    if (isFavorite(meal.id)) removeFavorite(meal.id);
    else addFavorite(meal);
  }

  const value = useMemo(
    () => ({ favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite }),
    [favorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider");
  return context;
}
