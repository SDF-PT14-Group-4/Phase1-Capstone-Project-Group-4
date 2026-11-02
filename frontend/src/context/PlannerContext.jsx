
import { useCallback, useEffect, useState } from "react";
import { PlannerContext } from "./planner-context.js";
import { useAuth } from "../hooks/useAuth.js";
import {
  getPlanner,
  savePlannedMeal,
  deletePlannedMeal,
} from "../services/plannerService.js";

const createEmptyPlanner = () => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
});

const createPlannerState = (ownerToken = null) => ({
  ownerToken,
  planner: createEmptyPlanner(),
  loading: false,
  error: "",
});

export function PlannerProvider({ children }) {
  const { accessToken } = useAuth();
  const [plannerState, setPlannerState] = useState(createPlannerState);

  useEffect(() => {
    let cancelled = false;

    if (!accessToken) {
      return undefined;
    }

    async function loadPlanner() {
      setPlannerState({
        ...createPlannerState(accessToken),
        loading: true,
      });

      try {
        const savedPlanner = await getPlanner(accessToken);

        if (!cancelled) {
          setPlannerState((current) =>
            current.ownerToken === accessToken
              ? {
                  ownerToken: accessToken,
                  planner: savedPlanner,
                  loading: false,
                  error: "",
                }
              : current
          );
        }
      } catch (error) {
        if (!cancelled) {
          setPlannerState((current) =>
            current.ownerToken === accessToken
              ? {
                  ...current,
                  loading: false,
                  error: error.message,
                }
              : current
          );
        }
      }
    }

    loadPlanner();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const ownsCurrentPlanner =
    Boolean(accessToken) &&
    plannerState.ownerToken === accessToken;

  const planner = ownsCurrentPlanner
    ? plannerState.planner
    : createEmptyPlanner();

  const plannerLoading = Boolean(accessToken) &&
    (!ownsCurrentPlanner || plannerState.loading);

  const plannerError = ownsCurrentPlanner
    ? plannerState.error
    : "";

  const addMeal = useCallback(
    async (day, meal) => {
      if (!accessToken) {
        setPlannerState((current) => ({
          ...current,
          error: "Please sign in to manage your weekly planner.",
        }));
        return;
      }

      if (!meal?.idMeal || !plannerState.planner[day]) {
        return;
      }

      if (
        !ownsCurrentPlanner ||
        plannerState.loading
      ) {
        return;
      }

      const alreadyPlanned = plannerState.planner[day].some(
        (plannedMeal) => plannedMeal.idMeal === String(meal.idMeal)
      );

      if (alreadyPlanned) {
        return;
      }

      setPlannerState((current) =>
        current.ownerToken === accessToken
          ? { ...current, error: "" }
          : current
      );

      try {
        const savedMeal = await savePlannedMeal(
          day,
          meal,
          accessToken
        );

        setPlannerState((current) => {
          if (current.ownerToken !== accessToken) {
            return current;
          }

          const dayMeals = current.planner[day];

          if (
            dayMeals.some(
              (item) => item.idMeal === savedMeal.idMeal
            )
          ) {
            return current;
          }

          return {
            ...current,
            planner: {
              ...current.planner,
              [day]: [...dayMeals, savedMeal],
            },
          };
        });
      } catch (error) {
        setPlannerState((current) =>
          current.ownerToken === accessToken
            ? { ...current, error: error.message }
            : current
        );
      }
    },
    [accessToken, ownsCurrentPlanner, plannerState]
  );

  const removeMeal = useCallback(
    async (day, mealId) => {
      if (!accessToken || !ownsCurrentPlanner) {
        return;
      }

      if (!plannerState.planner[day] || plannerState.loading) {
        return;
      }

      setPlannerState((current) => ({
        ...current,
        error: "",
      }));

      try {
        await deletePlannedMeal(day, mealId, accessToken);

        setPlannerState((current) => {
          if (current.ownerToken !== accessToken) {
            return current;
          }

          return {
            ...current,
            planner: {
              ...current.planner,
              [day]: current.planner[day].filter(
                (meal) => meal.idMeal !== String(mealId)
              ),
            },
          };
        });
      } catch (error) {
        setPlannerState((current) =>
          current.ownerToken === accessToken
            ? { ...current, error: error.message }
            : current
        );
      }
    },
    [accessToken, ownsCurrentPlanner, plannerState]
  );

  const clearDay = useCallback(
    async (day) => {
      if (!accessToken || !ownsCurrentPlanner) {
        return;
      }

      if (!plannerState.planner[day] || plannerState.loading) {
        return;
      }

      const meals = [...plannerState.planner[day]];

      setPlannerState((current) => ({
        ...current,
        error: "",
      }));

      for (const meal of meals) {
        try {
          await deletePlannedMeal(day, meal.idMeal, accessToken);

          setPlannerState((current) => {
            if (current.ownerToken !== accessToken) {
              return current;
            }

            return {
              ...current,
              planner: {
                ...current.planner,
                [day]: current.planner[day].filter(
                  (item) => item.idMeal !== meal.idMeal
                ),
              },
            };
          });
        } catch (error) {
          setPlannerState((current) =>
            current.ownerToken === accessToken
              ? { ...current, error: error.message }
              : current
          );
          return;
        }
      }
    },
    [accessToken, ownsCurrentPlanner, plannerState]
  );

  return (
    <PlannerContext.Provider
      value={{
        isGuest: !accessToken,
        planner,
        addMeal,
        removeMeal,
        clearDay,
        plannerLoading,
        plannerError,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}
