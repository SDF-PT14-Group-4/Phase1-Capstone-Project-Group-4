import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from "react";
import ReactDOM from "react-dom/client";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { PlannerProvider } from './context/PlannerContext.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FavoritesProvider>
      <PlannerProvider>
      <App />
      </PlannerProvider>
    </FavoritesProvider>
  </React.StrictMode>
);
