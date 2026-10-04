import { useContext } from "react";
import { FavoritesContext } from "../context/favoritesContext.js";

export function useFavorites() {
  return useContext(FavoritesContext);
}