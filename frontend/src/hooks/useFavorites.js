import { useContext } from "react";
import { FavoritesContext } from "../context/favorites-context.js";

export function useFavorites() {
  return useContext(FavoritesContext);
}