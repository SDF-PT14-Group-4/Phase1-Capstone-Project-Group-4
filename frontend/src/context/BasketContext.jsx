import useLocalStorage from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";
import { BasketContext } from "./basketContext.js";

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

  const value = { items, total, addToBasket, decrement, removeFromBasket, clearBasket };

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}
