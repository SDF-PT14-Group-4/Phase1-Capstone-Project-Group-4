import { useState } from "react";
import { PlannerContext } from "./plannerContext";

const initialPlanner = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

export function PlannerProvider({ children }) {
  const [planner, setPlanner] = useState(initialPlanner);

  function addMeal(day, meal) {
    setPlanner((currentPlanner) => ({
      ...currentPlanner,
      [day]: [...currentPlanner[day], meal],
    }));
  }

  function removeMeal(day, mealId) {
  setPlanner((currentPlanner) => ({
    ...currentPlanner,
    [day]: currentPlanner[day].filter(
      (meal) => meal.idMeal !== mealId
    ),
  }));
}

  return (
    <PlannerContext.Provider
      value={{
        planner,
        addMeal,
        removeMeal,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}