import { useState } from "react";
import { usePlanner } from "../context/usePlanner";

function Planner() {
  const { planner, addMeal, removeMeal } = usePlanner();

  const [mealName, setMealName] = useState("");
  const [selectedDay, setSelectedDay] = useState("monday");

  const days = Object.keys(planner);

  function handleAddMeal(e) {
    e.preventDefault();

    if (!mealName.trim()) {
      return;
    }

    const meal = {
      idMeal: Date.now().toString(),
      strMeal: mealName.trim(),
      strMealThumb: "",
   };

    addMeal(selectedDay, meal);
    setMealName("");
  }

  return (
    <main>
      <h1>Weekly Meal Planner</h1>
      <p>Plan your meals for the week.</p>

      <form onSubmit={handleAddMeal}>
        <input
          type="text"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          placeholder="Enter a meal"
        />

        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          {days.map((day) => (
            <option key={day} value={day}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </option>
          ))}
        </select>

        <button type="submit">Add Meal</button>
      </form>

      <section>
        {days.map((day) => (
          <div key={day}>
            <h2>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </h2>

            {planner[day].length === 0 ? (
              <p>No meals planned.</p>
            ) : (
              <ul>
                {planner[day].map((meal) => (
                  <li key={meal.idMeal}>
                    {meal.strMeal}

                    <button
                    type="button"
                    onClick={() => removeMeal(day, meal.idMeal)}
                  >
                  Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

export default Planner;