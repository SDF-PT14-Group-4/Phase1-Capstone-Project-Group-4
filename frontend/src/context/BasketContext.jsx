import { useCallback, useEffect, useState } from "react";
import { BasketContext } from "./basket-context.js";
import { useAuth } from "../hooks/useAuth.js";
import {
  addBasketItem as addBasketItemRequest,
  BasketApiError,
  clearBasketItems,
  getBasket,
  removeBasketItem as removeBasketItemRequest,
  updateBasketQuantity,
} from "../services/basketService.js";
import { readStorage, STORAGE_KEYS, writeStorage } from "../utils/storage.js";

// Demo pricing only: TheMealDB is a recipe source, not a restaurant catalogue.
const DEMO_PRICE = 10;

export function BasketProvider({ children }) {
  const { accessToken } = useAuth();
  return (
    <BasketStateProvider accessToken={accessToken}>
      {children}
    </BasketStateProvider>
  );
}

function BasketStateProvider({ children, accessToken }) {
  const [items, setItems] = useState(() =>
    accessToken ? [] : readStorage(STORAGE_KEYS.basket, [])
  );
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(Boolean(accessToken));
  const [error, setError] = useState("");

  const loadBasket = useCallback(async (token) => {
    const basket = await getBasket(token);
    setItems(
      basket.items.map((item) => ({
        ...item,
        id: item.mealId,
        image: item.image || "",
      }))
    );
    setTotal(basket.total);
  }, []);

  useEffect(() => {
    if (!accessToken) return undefined;

    let active = true;
    getBasket(accessToken)
      .then((basket) => {
        if (!active) return;
        setItems(
          basket.items.map((item) => ({
            ...item,
            id: item.mealId,
            image: item.image || "",
          }))
        );
        setTotal(basket.total);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof BasketApiError
              ? requestError.message
              : "Unable to load your basket."
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
    if (!accessToken) {
      writeStorage(STORAGE_KEYS.basket, items);
    }
  }, [accessToken, items]);

  async function runBasketAction(action) {
    setError("");
    try {
      await action();
      return true;
    } catch (requestError) {
      setError(
        requestError instanceof BasketApiError
          ? requestError.message
          : "Unable to update your basket."
      );
      return false;
    }
  }

  async function addToBasket(meal, price = DEMO_PRICE) {
    if (!meal?.id || !price || Number(price) <= 0) {
      return false;
    }

    const numericPrice = Number(price);

    if (accessToken) {
      return runBasketAction(async () => {
        await addBasketItemRequest(accessToken, meal, numericPrice);
        await loadBasket(accessToken);
      });
    }

    setItems((current) => {
      const existing = current.find((item) => item.id === meal.id);
      if (existing) {
        return current.map((item) =>
          item.id === meal.id
            ? { ...item, quantity: item.quantity + 1, price: numericPrice }
            : item
        );
      }
      return [
        ...current,
        {
          id: meal.id,
          name: meal.name,
          image: meal.image || meal.thumbnail || "",
          price: numericPrice,
          quantity: 1,
        },
      ];
    });
    return true;
  }

  async function decrement(id) {
    if (accessToken) {
      const item = items.find((entry) => entry.id === id);
      if (!item) return false;
      return runBasketAction(async () => {
        if (item.quantity === 1) {
          await removeBasketItemRequest(accessToken, id);
        } else {
          await updateBasketQuantity(accessToken, id, item.quantity - 1);
        }
        await loadBasket(accessToken);
      });
    }

    setItems((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
    return true;
  }

  async function removeFromBasket(id) {
    if (accessToken) {
      return runBasketAction(async () => {
        await removeBasketItemRequest(accessToken, id);
        await loadBasket(accessToken);
      });
    }
    setItems((current) => current.filter((item) => item.id !== id));
    return true;
  }

  async function clearBasket() {
    if (accessToken) {
      return runBasketAction(async () => {
        await clearBasketItems(accessToken);
        await loadBasket(accessToken);
      });
    }
    setItems([]);
    return true;
  }

  const basketTotal = accessToken
    ? total
    : items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <BasketContext.Provider
      value={{
        isGuest: !accessToken,
        items,
        total: basketTotal,
        loading,
        error,
        addToBasket,
        decrement,
        removeFromBasket,
        clearBasket,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}
