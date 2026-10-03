import { usePlanner } from "../context/usePlanner";

function Planner() {
  const { planner } = usePlanner();

  const days = Object.keys(planner);

  return (
    <main>
      <h1>Weekly Meal Planner</h1>
      <p>Plan your meals for the week.</p>

      <section>
        {days.map((day) => (
          <div key={day}>
            <h2>{day.charAt(0).toUpperCase() + day.slice(1)}</h2>

            {planner[day].length === 0 ? (
              <p>No meals planned.</p>
            ) : (
              <ul>
                {planner[day].map((meal) => (
                  <li key={meal.idMeal}>{meal.strMeal}</li>
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