import useLocalStorage from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";
import { PlannerContext } from "./plannerContext.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const emptyPlan = Object.fromEntries(DAYS.map((day) => [day, null]));
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

  const value = { days: DAYS, plan, assignMeal, removeMeal, clearPlan };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}
