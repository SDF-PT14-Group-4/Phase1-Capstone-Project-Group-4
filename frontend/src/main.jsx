import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { PlannerProvider } from './context/PlannerContext.jsx';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FavoritesProvider>
      <PlannerProvider>
      <App />
      </PlannerProvider>
    </FavoritesProvider>
  </StrictMode>
);
