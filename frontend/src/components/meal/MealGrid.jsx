import MealCard from "./MealCard";

function MealGrid({ meals }) {
  if (!meals || meals.length === 0) {
    return (
      <p>No meals found.</p>
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
export default MealGrid;