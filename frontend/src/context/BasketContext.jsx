import { BasketContext } from "./basket-context.js";
import { STORAGE_KEYS } from "../utils/storage";
import useLocalStorage from "../hooks/useLocalStorage";

// Prototype pricing only. TheMealDB is a recipe source, not a reliable restaurant
// catalogue. Prices are explicitly labelled as demo prices.
const DEMO_PRICE = 10;

export function BasketProvider({ children }) {
  const [items, setItems] = useLocalStorage(
    STORAGE_KEYS.basket,
    []
  );

  function addToBasket(meal, price = DEMO_PRICE) {
    if (!meal?.id || !price || Number(price) <= 0) {
      return;
    }

    const numericPrice = Number(price);

    setItems((current) => {
      const existing = current.find(
        (item) => item.id === meal.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === meal.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                price: numericPrice,
              }
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
  }

  function decrement(id) {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromBasket(id) {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function clearBasket() {
    setItems([]);
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = {
  items,
  total,
  addToBasket,
  decrement,
  removeFromBasket,
  clearBasket,
};

  return (
    <BasketContext.Provider value={value}>
      {children}
    </BasketContext.Provider>
  );
}
