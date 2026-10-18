import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FavoritesProvider } from "../context/FavoritesContext.jsx";
import { AuthContext } from "../context/authContext.js";
import { PlannerProvider } from "../context/PlannerContext.jsx";
import { useFavorites } from "../hooks/useFavorites.js";
import { usePlanner } from "../hooks/usePlanner.js";

const api = vi.hoisted(() => ({
  addFavorite: vi.fn(),
  addPlannedMeal: vi.fn(),
  clearPlannedDay: vi.fn(),
  getFavorites: vi.fn(),
  getPlanner: vi.fn(),
  removeFavorite: vi.fn(),
  removePlannedMeal: vi.fn(),
}));

vi.mock("../services/accountMealService.js", () => ({
  AccountMealApiError: class AccountMealApiError extends Error {},
  ...api,
}));

const MEAL = {
  idMeal: "52772",
  strMeal: "Teriyaki Chicken",
  strMealThumb: "https://example.com/meal.jpg",
};

function AccountDataProbe() {
  const favorites = useFavorites();
  const planner = usePlanner();

  return (
    <>
      <output data-testid="favorites">
        {favorites.favorites.map((meal) => meal.strMeal).join(",")}
      </output>
      <output data-testid="monday">
        {planner.planner.monday.map((meal) => meal.strMeal).join(",")}
      </output>
      {favorites.error && <p role="alert">{favorites.error}</p>}
      {planner.error && <p role="alert">{planner.error}</p>}
      <button type="button" onClick={() => favorites.addFavorite(MEAL)}>
        Save favorite
      </button>
      <button type="button" onClick={() => favorites.removeFavorite(MEAL.idMeal)}>
        Remove favorite
      </button>
      <button type="button" onClick={() => planner.addMeal("monday", MEAL)}>
        Plan meal
      </button>
      <button type="button" onClick={() => planner.removeMeal("monday", MEAL.idMeal)}>
        Remove planned meal
      </button>
      <button type="button" onClick={() => planner.clearDay("monday")}>
        Clear Monday
      </button>
    </>
  );
}

function renderAccountData() {
  return render(
    <AuthContext.Provider value={{ accessToken: "account-token" }}>
      <FavoritesProvider>
        <PlannerProvider>
          <AccountDataProbe />
        </PlannerProvider>
      </FavoritesProvider>
    </AuthContext.Provider>
  );
}

describe("account favorites and planner", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    api.getFavorites.mockResolvedValue([]);
    api.getPlanner.mockResolvedValue({ monday: [] });
    api.addFavorite.mockResolvedValue(MEAL);
    api.addPlannedMeal.mockResolvedValue({ day: "monday", meal: MEAL });
    api.removeFavorite.mockResolvedValue(null);
    api.removePlannedMeal.mockResolvedValue(null);
    api.clearPlannedDay.mockResolvedValue(null);
  });

  it("loads, adds, and removes account favorites through the API", async () => {
    renderAccountData();

    await waitFor(() => expect(api.getFavorites).toHaveBeenCalledWith("account-token"));
    fireEvent.click(screen.getByRole("button", { name: "Save favorite" }));
    expect(await screen.findByTestId("favorites")).toHaveTextContent(MEAL.strMeal);
    expect(api.addFavorite).toHaveBeenCalledWith("account-token", MEAL);

    fireEvent.click(screen.getByRole("button", { name: "Remove favorite" }));
    await waitFor(() => expect(screen.getByTestId("favorites")).toBeEmptyDOMElement());
    expect(api.removeFavorite).toHaveBeenCalledWith("account-token", MEAL.idMeal);
    expect(localStorage.getItem("favorites")).toBeNull();
  });

  it("loads, adds, removes, and clears account planner data through the API", async () => {
    renderAccountData();

    await waitFor(() => expect(api.getPlanner).toHaveBeenCalledWith("account-token"));
    fireEvent.click(screen.getByRole("button", { name: "Plan meal" }));
    expect(await screen.findByTestId("monday")).toHaveTextContent(MEAL.strMeal);
    expect(api.addPlannedMeal).toHaveBeenCalledWith("account-token", "monday", MEAL);

    fireEvent.click(screen.getByRole("button", { name: "Remove planned meal" }));
    await waitFor(() => expect(screen.getByTestId("monday")).toBeEmptyDOMElement());
    expect(api.removePlannedMeal).toHaveBeenCalledWith(
      "account-token",
      "monday",
      MEAL.idMeal
    );

    fireEvent.click(screen.getByRole("button", { name: "Plan meal" }));
    expect(await screen.findByTestId("monday")).toHaveTextContent(MEAL.strMeal);
    fireEvent.click(screen.getByRole("button", { name: "Clear Monday" }));
    await waitFor(() => expect(screen.getByTestId("monday")).toBeEmptyDOMElement());
    expect(api.clearPlannedDay).toHaveBeenCalledWith("account-token", "monday");
    expect(localStorage.getItem("weeklyPlanner")).toBeNull();
  });

  it("shows server failures instead of silently claiming account data was saved", async () => {
    api.addFavorite.mockRejectedValue(new Error("Unable to save this favorite."));
    renderAccountData();

    fireEvent.click(screen.getByRole("button", { name: "Save favorite" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to save this favorite."
    );
    expect(screen.getByTestId("favorites")).toBeEmptyDOMElement();
  });
});
