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

  return (
    <PlannerContext.Provider value={{ planner, setPlanner }}>
      {children}
    </PlannerContext.Provider>
  );
}