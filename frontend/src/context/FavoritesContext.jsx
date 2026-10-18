import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext.js";
import { FavoritesContext } from "./favoritesContext.js";
import {
  AccountMealApiError,
  addFavorite as addFavoriteRequest,
  getFavorites,
  removeFavorite as removeFavoriteRequest,
} from "../services/accountMealService.js";
import { readStorage, writeStorage } from "../utils/storage.js";
import {
  useEffect,
  useState,
} from "react";
import { FavoritesContext } from "./favorites-context.js";

function FavoritesStateProvider({ children, accessToken }) {
  const [favorites, setFavorites] = useState(() =>
    accessToken ? [] : readStorage("favorites", [])
  );
  const [loading, setLoading] = useState(Boolean(accessToken));
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!accessToken) return undefined;

    let active = true;
    getFavorites(accessToken)
      .then((accountFavorites) => {
        if (active) {
          setFavorites(accountFavorites);
          setLoadError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setLoadError(
            requestError instanceof AccountMealApiError
              ? requestError.message
              : "Unable to load your favorites."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) writeStorage("favorites", favorites);
  }, [accessToken, favorites]);

  async function addFavorite(meal) {
    setError("");
    if (favorites.some((favorite) => favorite.idMeal === meal.idMeal)) return true;

    if (accessToken) {
      try {
        const savedMeal = await addFavoriteRequest(accessToken, meal);
        setFavorites((current) =>
          current.some((favorite) => favorite.idMeal === savedMeal.idMeal)
            ? current
            : [...current, savedMeal]
        );
        return true;
      } catch (requestError) {
        setError(
          requestError instanceof AccountMealApiError
            ? requestError.message
            : "Unable to save this favorite."
        );
        return false;
      }
    }

    setFavorites((current) =>
      current.some((favorite) => favorite.idMeal === meal.idMeal)
        ? current
        : [...current, meal]
    );
    return true;
  }

  async function removeFavorite(mealId) {
    setError("");
    if (accessToken) {
      try {
        await removeFavoriteRequest(accessToken, mealId);
      } catch (requestError) {
        setError(
          requestError instanceof AccountMealApiError
            ? requestError.message
            : "Unable to remove this favorite."
        );
        return false;
      }
    }
    setFavorites((current) =>
      current.filter((favorite) => favorite.idMeal !== mealId)
    );
    return true;
  }

  function isFavorite(mealId) {
    return favorites.some((favorite) => favorite.idMeal === mealId);
  }

  async function toggleFavorite(meal) {
    return isFavorite(meal.idMeal)
      ? removeFavorite(meal.idMeal)
      : addFavorite(meal);
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        loadError,
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

export function FavoritesProvider({ children }) {
  const auth = useContext(AuthContext);
  const accessToken = auth?.accessToken ?? null;

  return (
    <FavoritesStateProvider
      key={accessToken || "guest"}
      accessToken={accessToken}
    >
      {children}
    </FavoritesStateProvider>
  );
}
