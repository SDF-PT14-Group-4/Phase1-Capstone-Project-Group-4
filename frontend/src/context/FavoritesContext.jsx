
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { FavoritesContext } from "./favorites-context.js";
import { useAuth } from "../hooks/useAuth.js";
import {
  deleteFavorite,
  getFavorites,
  saveFavorite,
} from "../services/favoritesService.js";

export function FavoritesProvider({ children }) {
  const { accessToken, user } = useAuth();

  const ownerKey =
    accessToken && user ? `${user.id}:${accessToken}` : null;

  const [favoriteState, setFavoriteState] = useState({
    ownerKey: null,
    favorites: [],
    error: "",
  });

  const pendingIds = useRef(new Set());
  const requestVersion = useRef(0);

  useEffect(() => {
    const version = ++requestVersion.current;
    let cancelled = false;

    pendingIds.current.clear();

    if (!accessToken || !user) {
      return () => {
        cancelled = true;
      };
    }

    getFavorites(accessToken)
      .then((savedFavorites) => {
        if (!cancelled && version === requestVersion.current) {
          setFavoriteState({
            ownerKey: `${user.id}:${accessToken}`,
            favorites: savedFavorites,
            error: "",
          });
        }
      })
      .catch((requestError) => {
        if (!cancelled && version === requestVersion.current) {
          setFavoriteState({
            ownerKey: `${user.id}:${accessToken}`,
            favorites: [],
            error: requestError.message,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, user]);

  const stateMatchesUser =
    ownerKey !== null && favoriteState.ownerKey === ownerKey;

  const favorites = useMemo(
  () => (stateMatchesUser ? favoriteState.favorites : []),
  [stateMatchesUser, favoriteState.favorites]
);

  const error = stateMatchesUser ? favoriteState.error : "";

  const loading = Boolean(
    accessToken && user && !stateMatchesUser
  );

  const isFavorite = useCallback(
    (mealId) =>
      favorites.some(
        (favorite) => String(favorite.idMeal) === String(mealId)
      ),
    [favorites]
  );

  const setError = useCallback(
    (message) => {
      if (!ownerKey) return;

      setFavoriteState((current) => ({
        ownerKey,
        favorites:
          current.ownerKey === ownerKey ? current.favorites : [],
        error: message,
      }));
    },
    [ownerKey]
  );

  const addFavorite = useCallback(
    async (meal) => {
      if (!accessToken || !user || !ownerKey) {
        return;
      }

      const mealId = String(meal?.idMeal ?? "");

      if (
        !mealId ||
        pendingIds.current.has(mealId) ||
        isFavorite(mealId)
      ) {
        return;
      }

      const version = requestVersion.current;
      pendingIds.current.add(mealId);
      setError("");

      try {
        const savedMeal = await saveFavorite(meal, accessToken);

        if (
          version !== requestVersion.current ||
          ownerKey !== `${user.id}:${accessToken}`
        ) {
          return;
        }

        setFavoriteState((current) => {
          if (current.ownerKey !== ownerKey) {
            return {
              ownerKey,
              favorites: [savedMeal],
              error: "",
            };
          }

          if (
            current.favorites.some(
              (item) => String(item.idMeal) === mealId
            )
          ) {
            return current;
          }

          return {
            ...current,
            favorites: [...current.favorites, savedMeal],
            error: "",
          };
        });
      } catch (requestError) {
        if (version === requestVersion.current) {
          setError(requestError.message);
        }
      } finally {
        pendingIds.current.delete(mealId);
      }
    },
    [accessToken, user, ownerKey, isFavorite, setError]
  );

  const removeFavorite = useCallback(
    async (mealId) => {
      if (!accessToken || !user || !ownerKey) {
        return;
      }

      const normalizedId = String(mealId ?? "");

      if (!normalizedId || pendingIds.current.has(normalizedId)) {
        return;
      }

      const version = requestVersion.current;
      pendingIds.current.add(normalizedId);
      setError("");

      try {
        await deleteFavorite(normalizedId, accessToken);

        if (version !== requestVersion.current) {
          return;
        }

        setFavoriteState((current) => {
          if (current.ownerKey !== ownerKey) return current;

          return {
            ...current,
            favorites: current.favorites.filter(
              (meal) => String(meal.idMeal) !== normalizedId
            ),
            error: "",
          };
        });
      } catch (requestError) {
        if (version === requestVersion.current) {
          setError(requestError.message);
        }
      } finally {
        pendingIds.current.delete(normalizedId);
      }
    },
    [accessToken, user, ownerKey, setError]
  );

  const toggleFavorite = useCallback(
    (meal) =>
      isFavorite(meal.idMeal)
        ? removeFavorite(meal.idMeal)
        : addFavorite(meal),
    [isFavorite, addFavorite, removeFavorite]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        setError,
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
