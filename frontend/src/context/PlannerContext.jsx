import { useEffect, useState } from "react";
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
  const [planner, setPlanner] = useState(() => {
    const savedPlanner = localStorage.getItem("weeklyPlanner");

    return savedPlanner ? JSON.parse(savedPlanner) : initialPlanner;
  });

  useEffect(() => {
    localStorage.setItem("weeklyPlanner", JSON.stringify(planner));
  }, [planner]);

  function addMeal(day, meal) {
    setPlanner((currentPlanner) => {
      const alreadyPlanned = currentPlanner[day].some(
        (plannedMeal) => plannedMeal.idMeal === meal.idMeal
      );

      if (alreadyPlanned) {
        return currentPlanner;
      }

      return {
        ...currentPlanner,
        [day]: [...currentPlanner[day], meal],
      };
    });
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
