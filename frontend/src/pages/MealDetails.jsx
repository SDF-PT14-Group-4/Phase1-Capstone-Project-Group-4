import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites.js";
import { useBasket } from "../hooks/useBasket.js";

function MealDetails() {
  const { id } = useParams();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToBasket } = useBasket();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    async function fetchMealDetails() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch meal details.");
        }

        const data = await response.json();

        if (!data.meals || data.meals.length === 0) {
          setError("Meal not found.");
          setMeal(null);
          return;
        }

        setMeal(data.meals[0]);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to fetch meal details right now.");
          setMeal(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchMealDetails();

    return () => controller.abort();
  }, [id]);

  if (!id) {
    return (
      <main className="meal-details-page container">
        <h1>Meal Details</h1>
        <p>Meal ID not provided.</p>
        <Link to="/search">Back to search</Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="meal-details-page container">
        <p className="meal-details-message">Loading meal details...</p>
      </main>
    );
  }

  if (error || !meal) {
    return (
      <main className="meal-details-page container">
        <section className="meal-details-message">
          <h1>Meal Details</h1>
          <p role="alert">{error || "Meal not found."}</p>
          <Link to="/search">Back to Search</Link>
        </section>
      </main>
    );
  }

  const favorite = isFavorite(meal.idMeal);
  const ingredients = [];

  for (let i = 1; i <= 20; i += 1) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: measure ? measure.trim() : "",
      });
    }
  }

  function handleAddToBasket() {
    if (!price || !Number.isFinite(Number(price)) || Number(price) <= 0) {
      setMessage("Please enter a valid price.");
      return;
    }

    addToBasket(
      {
        id: meal.idMeal,
        name: meal.strMeal,
        image: meal.strMealThumb,
      },
      Number(price)
    );

    setMessage(`${meal.strMeal} added to basket.`);
  }

  return (
    <main className="meal-details-page">
      <div className="container">
        <Link to="/search" className="meal-details-back">
          ← Back to Search
        </Link>

        <section className="meal-details-hero">
          <div className="meal-details-image">
            <img src={meal.strMealThumb} alt={meal.strMeal} />
          </div>

          <div className="meal-details-intro">
            <p className="meal-details-eyebrow">RECIPE</p>

            <div className="meal-details-title-row">
              <h1>{meal.strMeal}</h1>

              <button
                type="button"
                className={`meal-details-favorite ${favorite ? "active" : ""}`}
                onClick={() => toggleFavorite(meal)}
                aria-label={
                  favorite
                    ? `Remove ${meal.strMeal} from favorites`
                    : `Add ${meal.strMeal} to favorites`
                }
                aria-pressed={favorite}
              >
                {favorite ? "♥" : "♡"}
              </button>
            </div>

            <div className="meal-details-meta">
              <span>{meal.strCategory}</span>
              <span>{meal.strArea}</span>
            </div>

            {meal.strTags && (
              <div className="meal-details-tags">
                {meal.strTags.split(",").map((tag) => (
                  <span key={tag.trim()}>{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="meal-details-section">
          <div className="meal-details-section-heading">
            <p className="meal-details-eyebrow">WHAT YOU NEED</p>
            <h2>Ingredients</h2>
          </div>

          <div className="ingredients-grid">
            {ingredients.map(({ ingredient, measure }) => (
              <div
                className="ingredient-item"
                key={`${ingredient}-${measure}`}
              >
                <span className="ingredient-name">{ingredient}</span>
                {measure && (
                  <span className="ingredient-measure">{measure}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="meal-details-section">
          <div className="meal-details-section-heading">
            <p className="meal-details-eyebrow">HOW TO PREPARE IT</p>
            <h2>Instructions</h2>
          </div>

          <div className="instructions">
            {(meal.strInstructions || "")
              .split(/\r?\n/)
              .filter((step) => step.trim())
              .map((step, index) => (
                <div className="instruction-step" key={`step-${index}`}>
                  <span className="instruction-number">{index + 1}</span>
                  <p>{step.trim()}</p>
                </div>
              ))}
          </div>
        </section>

        <section className="meal-details-section basket-section">
          <div className="meal-details-section-heading">
            <p className="meal-details-eyebrow">MEAL MANAGEMENT</p>
            <h2>Add to Basket</h2>
          </div>

          <div className="basket-form">
            <label htmlFor="meal-price">Price (Ksh)</label>

            <div className="basket-input-row">
              <input
                id="meal-price"
                type="number"
                min="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Enter price"
              />

              <button type="button" onClick={handleAddToBasket}>
                Add to Basket
              </button>
            </div>

            {message && (
              <p className="basket-message" role="status">
                {message}
              </p>
            )}
          </div>
        </section>

        {meal.strYoutube && (
          <section className="meal-details-section video-section">
            <div className="meal-details-section-heading">
              <p className="meal-details-eyebrow">WATCH AND LEARN</p>
              <h2>Preparation Video</h2>
            </div>

            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noreferrer"
              className="video-link"
            >
              Watch {meal.strMeal} preparation on YouTube →
            </a>
          </section>
        )}
      </div>
    </main>
  );
}

export default MealDetails;