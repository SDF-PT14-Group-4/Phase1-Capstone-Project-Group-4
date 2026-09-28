import { createContext, useContext, useState } from "react";

const PlannerContext = createContext();

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

export function usePlanner() {
  return useContext(PlannerContext);
}