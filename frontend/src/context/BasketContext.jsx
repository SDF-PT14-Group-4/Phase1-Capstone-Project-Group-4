import { createContext, useContext, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";


const BasketContext = createContext(null);

// Prototype pricing only. TheMealDB is a recipe source, not a reliable restaurant
// catalogue. Prices are explicitly labelled as demo prices.
const DEMO_PRICE = 10;

export function BasketProvider({ children }) {
  const [items, setItems] = useLocalStorage(STORAGE_KEYS.basket, []);

  function addToBasket(meal) {
    if (!meal?.id) return;
    setItems((current) => {
      const existing = current.find((item) => item.id === meal.id);
      if (existing) {
        return current.map((item) =>
          item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...current,
        {
          id: meal.id,
          name: meal.name,
          thumbnail: meal.thumbnail || meal.image || "",
          quantity: 1,
          demoPrice: DEMO_PRICE
        }
      ];
    });
  }

  function decrement(id) {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromBasket(id) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function clearBasket() {
    setItems([]);
  }

  const total = items.reduce((sum, item) => sum + item.demoPrice * item.quantity, 0);

  const value = useMemo(
    () => ({ items, total, addToBasket, decrement, removeFromBasket, clearBasket }),
    [items, total]
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) throw new Error("useBasket must be used inside BasketProvider");
  return context;
}
