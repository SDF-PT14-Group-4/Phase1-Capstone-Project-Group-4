import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext.js";
import { PlannerContext } from "./plannerContext";
import {
  AccountMealApiError,
  addPlannedMeal,
  clearPlannedDay,
  getPlanner,
  removePlannedMeal,
} from "../services/accountMealService.js";
import { readStorage, writeStorage } from "../utils/storage.js";

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function emptyPlanner() {
  return Object.fromEntries(WEEKDAYS.map((day) => [day, []]));
}

function PlannerStateProvider({ children, accessToken }) {
  const [planner, setPlanner] = useState(() =>
    accessToken ? emptyPlanner() : readStorage("weeklyPlanner", emptyPlanner())
  );
  const [loading, setLoading] = useState(Boolean(accessToken));
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!accessToken) return undefined;

    let active = true;
    getPlanner(accessToken)
      .then((accountPlanner) => {
        if (active) {
          setPlanner({ ...emptyPlanner(), ...accountPlanner });
          setLoadError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setLoadError(
            requestError instanceof AccountMealApiError
              ? requestError.message
              : "Unable to load your weekly plan."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) writeStorage("weeklyPlanner", planner);
  }, [accessToken, planner]);

  async function addMeal(day, meal) {
    if (!WEEKDAYS.includes(day)) return false;
    setError("");
    if (planner[day].some((plannedMeal) => plannedMeal.idMeal === meal.idMeal)) {
      return true;
    }

    if (accessToken) {
      try {
        const saved = await addPlannedMeal(accessToken, day, meal);
        setPlanner((current) => ({
          ...current,
          [day]: current[day].some(
            (plannedMeal) => plannedMeal.idMeal === saved.meal.idMeal
          )
            ? current[day]
            : [...current[day], saved.meal],
        }));
        return true;
      } catch (requestError) {
        setError(
          requestError instanceof AccountMealApiError
            ? requestError.message
            : "Unable to add this meal to your plan."
        );
        return false;
      }
    }

    setPlanner((current) => ({
      ...current,
      [day]: [...current[day], meal],
    }));
    return true;
  }

  async function removeMeal(day, mealId) {
    if (!WEEKDAYS.includes(day)) return false;
    setError("");
    if (accessToken) {
      try {
        await removePlannedMeal(accessToken, day, mealId);
      } catch (requestError) {
        setError(
          requestError instanceof AccountMealApiError
            ? requestError.message
            : "Unable to remove this meal from your plan."
        );
        return false;
      }
    }
    setPlanner((current) => ({
      ...current,
      [day]: current[day].filter((meal) => meal.idMeal !== mealId),
    }));
    return true;
  }

  async function clearDay(day) {
    if (!WEEKDAYS.includes(day)) return false;
    setError("");
    if (accessToken) {
      try {
        await clearPlannedDay(accessToken, day);
      } catch (requestError) {
        setError(
          requestError instanceof AccountMealApiError
            ? requestError.message
            : "Unable to clear this day from your plan."
        );
        return false;
      }
    }
    setPlanner((current) => ({ ...current, [day]: [] }));
    return true;
  }

  return (
    <PlannerContext.Provider
      value={{ planner, loading, error, loadError, addMeal, removeMeal, clearDay }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function PlannerProvider({ children }) {
  const auth = useContext(AuthContext);
  const accessToken = auth?.accessToken ?? null;

  return (
    <PlannerStateProvider key={accessToken || "guest"} accessToken={accessToken}>
      {children}
    </PlannerStateProvider>
  );
}
