import { useContext } from "react";
import { PlannerContext } from "./plannerContext";

export function usePlanner() {
  return useContext(PlannerContext);
}