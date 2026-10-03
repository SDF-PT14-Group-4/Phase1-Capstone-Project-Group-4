import MealCard from "./MealCard";

export default function MealGrid({ meals }) {
  if (!Array.isArray(meals)) {
    return <p>Unable to display meals.</p>;
  }

  if (meals.length === 0) {
    return <p>No meals found.</p>;
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