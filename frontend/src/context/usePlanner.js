import { useContext } from "react";
import { PlannerContext } from "./planner-context.js";

export function usePlanner() {
  return useContext(PlannerContext);
}