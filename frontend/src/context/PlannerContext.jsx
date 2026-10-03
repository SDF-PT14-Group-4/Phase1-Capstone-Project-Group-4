import { createContext, useContext, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const emptyPlan = Object.fromEntries(DAYS.map((day) => [day, null]));
const PlannerContext = createContext(null);

export function PlannerProvider({ children }) {
  const [plan, setPlan] = useLocalStorage(STORAGE_KEYS.planner, emptyPlan);

  function assignMeal(day, meal) {
    if (!DAYS.includes(day) || !meal?.id) return;
    setPlan((current) => ({ ...current, [day]: meal }));
  }

  function removeMeal(day) {
    if (!DAYS.includes(day)) return;
    setPlan((current) => ({ ...current, [day]: null }));
  }

  function clearPlan() {
    setPlan(emptyPlan);
  }

  const value = useMemo(
    () => ({ days: DAYS, plan, assignMeal, removeMeal, clearPlan }),
    [plan]
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error("usePlanner must be used inside PlannerProvider");
  return context;
}
