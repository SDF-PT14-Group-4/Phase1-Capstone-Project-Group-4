import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { PlannerProvider } from "./context/PlannerContext.jsx";
import { BasketProvider } from "./context/BasketContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FavoritesProvider>
      <PlannerProvider>
        <BasketProvider>
          <App />
        </BasketProvider>
      </PlannerProvider>
    </FavoritesProvider>
  </StrictMode>
);
