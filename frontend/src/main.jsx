import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { FavoritesProvider } from "./context/FavoritesContext";
import { PlannerProvider } from "./context/PlannerContext";
import { BasketProvider } from "./context/BasketContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <FavoritesProvider>
        <PlannerProvider>
          <BasketProvider>
            <App />
          </BasketProvider>
        </PlannerProvider>
      </FavoritesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
