import { Link } from "react-router-dom";
import { useBasket } from "../hooks/useBasket.js";
import "./Basket.css";

function Basket() {
  const {
    items,
    total,
    addToBasket,
    decrement,
    removeFromBasket,
    clearBasket,
  } = useBasket();

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
            <Link to="/search" className="basket-primary-button">
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
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {items.map((meal) => (
              <article className="basket-item" key={meal.id}>
                <img
                  src={meal.image || meal.thumbnail || ""}
                  alt={meal.name}
                  className="basket-item-image"
                />

                <div className="basket-item-details">
                  <h3>{meal.name}</h3>
                  <p className="basket-item-price">
                    KSh {Number(meal.price || 0).toLocaleString()} each
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
                          onClick={() =>
                            addToBasket(
                              {
                                id: meal.id,
                                name: meal.name,
                                image: meal.image || meal.thumbnail || "",
                              },
                              meal.price,
                            )
                          }
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
                    KSh {(
                      Number(meal.price || 0) * meal.quantity
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
            <p className="basket-summary-eyebrow">ORDER SUMMARY</p>
            <h2>Basket Total</h2>
            <div className="basket-summary-row">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="basket-summary-row basket-total">
              <span>Total</span>
              <strong>KSh {total.toLocaleString()}</strong>
            </div>
            <button type="button" className="basket-checkout-button">
              Continue
            </button>
            <Link to="/search" className="basket-continue-link">
              Continue Exploring
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}

export default Basket;
