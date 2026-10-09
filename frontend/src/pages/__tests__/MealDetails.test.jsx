import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MealDetails from "../MealDetails";
import { useFavorites } from "../../hooks/useFavorites";
import { useBasket } from "../../hooks/useBasket";

vi.mock("../../hooks/useFavorites", () => ({
  useFavorites: vi.fn(),
}));

vi.mock("../../hooks/useBasket", () => ({
  useBasket: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useFavorites).mockReturnValue({
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
  });

  vi.mocked(useBasket).mockReturnValue({
    addToBasket: vi.fn(),
  });
});

describe("MealDetails", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the meal returned for the route id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          meals: [
            {
              idMeal: "52772",
              strMeal: "Teriyaki Chicken Casserole",
              strMealThumb: "https://example.com/meal.jpg",
              strCategory: "Chicken",
              strArea: "Japanese",
              strInstructions: "Bake until ready.",
              strIngredient1: "Chicken",
              strMeasure1: "1 lb",
            },
          ],
        }),
      })
    );

    render(
      <MemoryRouter initialEntries={["/meal/52772"]}>
        <Routes>
          <Route path="/meal/:id" element={<MealDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /teriyaki chicken casserole/i })
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
  "https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772",
  expect.objectContaining({
    signal: expect.any(AbortSignal),
  }),
);
  });

  it("handles a missing meal id gracefully", () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/meal"]}>
        <Routes>
          <Route path="/meal" element={<MealDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /meal details/i })).toBeInTheDocument();
    expect(screen.getByText(/meal id not provided/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
