import { useContext } from "react";
import { PlannerContext } from "./PlannerContext";

export function usePlanner() {
  return useContext(PlannerContext);
}