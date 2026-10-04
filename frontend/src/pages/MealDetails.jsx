import{useEffect, useState} from "react";
import { Link,useParams } from "react-router-dom";

function MealDetails() {
  const { id } = useParams();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchMealDetails() {
      try{
        setLoading(true);
        setError('');
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch meal details.');
        }

        const data = await response.json();
 
        if (!data.meals || data.meals.length === 0) {
          setError('Meal not found.');
          setMeal(null);
          return;
        }

        setMeal(data.meals[0]);

      } catch {
        setError('Unable to fetch meal details right now.');
        setMeal(null);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchMealDetails();
    }
  }, [id]);

  if (!id) {
    return (
      <main>
        <h1>Meal Details</h1>
        <p>Meal ID not provided.</p>
        <Link to="/search">Back to search</Link>
      </main>
    );
  }

  if (loading) {
    return <p>Loading meal details...</p>;
  }

  if (error) {
    return (
      <main>
        <h1>Meal Details</h1>
        <p>{error}</p>
        <Link to="/search">Back to search</Link>
      </main>
    );
  }

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure ? measure.trim() : ""} ${ingredient.trim()}`.trim());
    }
  }

    const addToBasket = () => {
    if (!price || Number(price) <= 0) {
      setMessage("Please enter a valid price.");
      return;
    }

    const savedBasket = JSON.parse(
      localStorage.getItem("mealBasket") || "[]"
    );

    const existingMeal = savedBasket.find(
      (item) => item.id === meal.idMeal
    );

    let updatedBasket;

    if (existingMeal) {
      updatedBasket = savedBasket.map((item) =>
        item.id === meal.idMeal
          ? {
              ...item,
              quantity: item.quantity + 1,
              price: Number(price),
            }
          : item
      );
    } else {
      updatedBasket = [
        ...savedBasket,
        {
          id: meal.idMeal,
          name: meal.strMeal,
          image: meal.strMealThumb,
          price: Number(price),
          quantity: 1,
        },
      ];
    }

    localStorage.setItem(
      "mealBasket",
      JSON.stringify(updatedBasket)
    );

    setMessage(`${meal.strMeal} added to basket.`);
  };


    return (
    <main>
      <Link to="/search">← Back to Search</Link>

      <h1>{meal.strMeal}</h1>

      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
        width="400"
      />

      <h2>Meal Information</h2>

      <p>
        <strong>Category:</strong> {meal.strCategory}
      </p>

      <p>
        <strong>Cuisine:</strong> {meal.strArea}
      </p>

      {meal.strTags && (
        <p>
          <strong>Tags:</strong> {meal.strTags}
        </p>
      )}

      <h2>Ingredients</h2>

      <ul>
        {ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>

      <h2>Instructions</h2>

      <p>{meal.strInstructions}</p>
      
      <h2>Add to Basket</h2>

      <label>
        Price (Ksh):{" "}
        <input
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter price"
        />
      </label>

      <br />
      <br />

      <button onClick={addToBasket}>
        Add to Basket
      </button>

      {message && <p>{message}</p>}

      {meal.strYoutube && (
        <p>
          <a
            href={meal.strYoutube}
            target="_blank"
            rel="noreferrer"
          >
            Watch preparation video
          </a>
        </p>
      )}
    </main>
  );
}

export default MealDetails;

