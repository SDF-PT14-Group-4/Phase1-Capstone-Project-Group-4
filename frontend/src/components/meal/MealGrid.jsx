
import MealCard from "./MealCard";

export default function MealGrid({ meals }) {
  if (!Array.isArray(meals)) {
    return (
      <p className="meal-grid-message">
        Unable to display meals.
      </p>
    );
  }

  if (meals.length === 0) {
    return (
      <p className="meal-grid-message">
        No meals found.
      </p>
    );
  }

  return (
    <div className="meal-grid">
      {meals.map((meal) => (
        <MealCard
          key={meal.idMeal}
          meal={meal}
        />
      ))}
    </div>
  );
}
