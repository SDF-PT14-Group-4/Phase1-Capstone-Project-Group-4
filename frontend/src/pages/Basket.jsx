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
    <main>
      <h1>Basket</h1>

      {basket.length === 0 ? (
        <p>Your basket is empty.</p>
      ) : (
        <>
          {basket.map((meal) => (
            <div
              key={meal.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >
              <img
                src={meal.image}
                alt={meal.name}
                width="120"
              />

              <h2>{meal.name}</h2>

              <p>
                Price: Ksh {meal.price.toLocaleString()}
              </p>

              <label>
                Quantity:{" "}
                <input
                  type="number"
                  min="1"
                  value={meal.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      meal.id,
                      Number(e.target.value)
                    )
                  }
                  style={{ width: "60px" }}
                />
              </label>

              <p>
                Subtotal:{" "}
                <strong>
                  Ksh{" "}
                  {(meal.price * meal.quantity).toLocaleString()}
                </strong>
              </p>

              <button onClick={() => removeFromBasket(meal.id)}>
                Remove
              </button>
            </div>
          ))}

          <h2>
            Total: Ksh {total.toLocaleString()}
          </h2>
        </>
      )}
    </main>
  );
}

export default Basket;