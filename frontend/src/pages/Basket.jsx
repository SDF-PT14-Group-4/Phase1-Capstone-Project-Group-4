import { Link } from "react-router-dom";
import { useBasket } from "../context/BasketContext";
import "./Basket.css";

function Basket() {
  const {
    items,
    total,
    decrement,
    removeFromBasket,
    clearBasket,
  } = useBasket();
import { useState } from "react";

function Basket() {
  const [basket, setBasket] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mealBasket") || "[]");
    } catch {
      return [];
    }
  });

  const removeFromBasket = (id) => {
    const updatedBasket = basket.filter((meal) => meal.id !== id);

    setBasket(updatedBasket);
    localStorage.setItem("mealBasket", JSON.stringify(updatedBasket));
  };

  const updateQuantity = (id, quantity) => {
    const updatedBasket = basket.map((meal) =>
      meal.id === id
        ? { ...meal, quantity: Math.max(1, quantity) }
        : meal
    );

    setBasket(updatedBasket);
    localStorage.setItem("mealBasket", JSON.stringify(updatedBasket));
  };

  const total = basket.reduce(
    (sum, meal) => sum + meal.price * meal.quantity,
    0
  );

  return (
    <main className="basket-page">
      <header className="basket-header">
        <p className="basket-eyebrow">YOUR SELECTION</p>

        <h1>Your Basket</h1>

        <p className="basket-description">
          Review the meals you've selected and manage your
          order before continuing.
        </p>
      </header>

      {items.length === 0 ? (
        <section className="basket-empty">
          <div className="basket-empty-content">
            <p className="basket-empty-label">BASKET EMPTY</p>

            <h2>Nothing here yet.</h2>

            <p>
              Explore our meals and add something delicious
              to your basket.
            </p>

            <Link
              to="/search"
              className="basket-primary-button"
            >
              Explore Meals
            </Link>
          </div>
        </section>
      ) : (
        <section className="basket-content">
          <div className="basket-items">
            <div className="basket-section-header">
              <h2>Selected Meals</h2>

              <span>
                {items.length}{" "}
                {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {items.map((meal) => (
              <article className="basket-item" key={meal.id}>
                <img
                  src={meal.thumbnail}
                  alt={meal.name}
                  className="basket-item-image"
                />

                <div className="basket-item-details">
                  <h3>{meal.name}</h3>

                  <p className="basket-item-price">
                    KSh {meal.demoPrice.toLocaleString()} each
                  </p>

                  <div className="basket-item-controls">
                    <div className="basket-quantity">
                      <span>Quantity</span>

                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={() => decrement(meal.id)}
                          aria-label={`Decrease quantity of ${meal.name}`}
                        >
                          −
                        </button>

                        <span>{meal.quantity}</span>

                        <button
                          type="button"
                          onClick={() => {
                            // Adding one through the context
                            // is handled by the existing basket flow.
                          }}
                          disabled
                          aria-label={`Increase quantity of ${meal.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="basket-remove-button"
                      onClick={() => removeFromBasket(meal.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="basket-item-subtotal">
                  <span>Subtotal</span>

                  <strong>
                    KSh{" "}
                    {(
                      meal.demoPrice * meal.quantity
                    ).toLocaleString()}
                  </strong>
                </div>
              </article>
            ))}

            <button
              type="button"
              className="basket-clear-button"
              onClick={clearBasket}
            >
              Clear Basket
            </button>
          </div>

          <aside className="basket-summary">
            <p className="basket-summary-eyebrow">
              ORDER SUMMARY
            </p>

            <h2>Basket Total</h2>

            <div className="basket-summary-row">
              <span>Items</span>

              <span>{items.length}</span>
            </div>

            <div className="basket-summary-row basket-total">
              <span>Total</span>

              <strong>
                KSh {total.toLocaleString()}
              </strong>
            </div>

            <button
              type="button"
              className="basket-checkout-button"
            >
              Continue
            </button>

            <Link
              to="/search"
              className="basket-continue-link"
            >
              Continue Exploring
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}

export default Basket;