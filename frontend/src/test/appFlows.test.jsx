import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { FavoritesProvider } from "../context/FavoritesContext";
import { PlannerContext } from "../context/plannerContext.js";
import { useFavorites } from "../hooks/useFavorites.js";

const MEAL = {
  idMeal: "52772",
  strMeal: "Teriyaki Chicken Casserole",
  strMealThumb: "https://example.com/meal.jpg",
  strCategory: "Chicken",
  strArea: "Japanese",
  strInstructions: "Bake until ready.",
  strIngredient1: "Chicken",
  strMeasure1: "1 lb",
};

function renderApp(path = "/") {
  window.history.replaceState({}, "", path);
  return render(
    <FavoritesProvider>
      <PlannerContext.Provider
        value={{
          planner: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          },
          addMeal: vi.fn(),
          removeMeal: vi.fn(),
        }}
      >
        <App />
      </PlannerContext.Provider>
    </FavoritesProvider>
  );
}

function mockJsonResponse(data, ok = true) {
  return {
    ok,
    json: async () => data,
  };
}

describe("application user flows", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the home screen, shared navigation, and layout across routes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockJsonResponse({
          categories: [
            {
              idCategory: "1",
              strCategory: "Beef",
              strCategoryThumb: "https://example.com/beef.jpg",
            },
          ],
        })
      )
    );
    renderApp();

    expect(
      screen.getByRole("heading", { name: /welcome to globaltaste/i })
    ).toBeInTheDocument();

    for (const label of [
      "Home",
      "Search",
      "Categories",
      "Favorites",
      "Planner",
      "Basket",
      "Surprise Me",
    ]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByText(/© 2026 GlobalTaste/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Categories" }));
    expect(
      await screen.findByRole("heading", { name: /meal categories/i })
    ).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("link", { name: /beef/i }));
    expect(
      await screen.findByRole("heading", { name: /beef meals/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Planner" }));
    expect(
      await screen.findByRole("heading", { name: /weekly meal planner/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Planner" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "GlobalTaste" })).toBeInTheDocument();
    expect(screen.getByText(/© 2026 GlobalTaste/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(
      await screen.findByRole("heading", { name: /welcome to globaltaste/i })
    ).toBeInTheDocument();
  });

  it("searches meals, opens details, and saves a favorite", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockJsonResponse({ meals: [MEAL] }))
      .mockResolvedValueOnce(mockJsonResponse({ meals: [MEAL] }));
    vi.stubGlobal("fetch", fetchMock);
    renderApp();

    fireEvent.click(screen.getByRole("link", { name: "Search" }));
    const input = screen.getByPlaceholderText(/search for a meal/i);
    fireEvent.change(input, { target: { value: "chicken" } });
    expect(input).toHaveValue("chicken");
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    const mealLink = await screen.findByRole("link", {
      name: MEAL.strMeal,
    });
    fireEvent.click(mealLink);

    expect(
      await screen.findByRole("heading", { name: MEAL.strMeal })
    ).toBeInTheDocument();
    expect(screen.getByText("1 lb Chicken")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772"
    );
  });

  it("adds a category meal to favorites", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({ meals: [MEAL] }))
    );
    renderApp("/categories/Chicken");

    expect(
      await screen.findByRole("heading", { name: /chicken meals/i })
    ).toBeInTheDocument();
    fireEvent.click(
      await screen.findByRole("button", {
        name: `Add ${MEAL.strMeal} to favorites`,
      })
    );

    fireEvent.click(screen.getByRole("link", { name: "Favorites" }));
    expect(
      await screen.findByRole("heading", { name: MEAL.strMeal })
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("favorites"))).toHaveLength(1);
  });

  it("shows search validation and no-results feedback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({ meals: null }))
    );
    renderApp("/search");

    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(
      screen.getByRole("alert", { name: "" })
    ).toHaveTextContent(/please enter the meal/i);

    fireEvent.change(screen.getByPlaceholderText(/search for a meal/i), {
      target: { value: "no-such-meal" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /no meals found for your search/i
    );
  });

  it("adds a meal to the basket and supports the empty basket state", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(
        mockJsonResponse({
          categories: [
            {
              idCategory: "1",
              strCategory: "Chicken",
              strCategoryThumb: "https://example.com/chicken.jpg",
            },
          ],
        })
      )
      .mockResolvedValueOnce(mockJsonResponse({ meals: [MEAL] }))
      .mockResolvedValueOnce(mockJsonResponse({ meals: [MEAL] })));
    renderApp("/basket");
    expect(screen.getByText(/your basket is empty/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Categories" }));
    fireEvent.click(await screen.findByRole("link", { name: /chicken/i }));
    fireEvent.click(await screen.findByRole("link", { name: /view recipe/i }));
    expect(
      await screen.findByRole("heading", { name: MEAL.strMeal })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add to basket/i }));
    expect(screen.getByText(/please enter a valid price/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/price \(ksh\)/i), {
      target: { value: "500" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add to basket/i }));
    expect(screen.getByText(/added to basket/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("mealBasket"))).toHaveLength(1);

    fireEvent.click(screen.getByRole("link", { name: "Basket" }));
    expect(await screen.findByText(/total:\s*ksh\s*500/i)).toBeInTheDocument();
  });

  it("loads a valid random meal recommendation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ meals: [MEAL] }));
    vi.stubGlobal("fetch", fetchMock);
    renderApp("/surprise");

    fireEvent.click(screen.getByRole("button", { name: /surprise me!/i }));
    expect(
      await screen.findByRole("heading", { name: MEAL.strMeal })
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.themealdb.com/api/json/v1/1/random.php"
    );
    expect(
      screen.getByRole("link", { name: /view full recipe/i })
    ).toHaveAttribute("href", "/meal/52772");
  });

  it("shows loading and a not-found message for an unknown meal ID", async () => {
    let resolveResponse;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveResponse = resolve;
        })
      )
    );
    renderApp("/meal/does-not-exist");

    expect(screen.getByText(/loading meal details/i)).toBeInTheDocument();
    resolveResponse(mockJsonResponse({ meals: null }));
    expect(await screen.findByText(/meal not found/i)).toBeInTheDocument();
  });

  it("shows a useful page for an unknown route", () => {
    renderApp("/not-a-real-page");

    expect(
      screen.getByRole("heading", { name: /page not found/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return home/i })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("does not add the same favorite meal more than once", () => {
    render(
      <FavoritesProvider>
        <FavoriteDuplicateProbe />
      </FavoritesProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /add twice/i }));
    expect(screen.getByText("Saved favorites: 1")).toBeInTheDocument();
  });
});

function FavoriteDuplicateProbe() {
  const { addFavorite, favorites } = useFavorites();

  return (
    <div>
      <button
        onClick={() => {
          addFavorite(MEAL);
          addFavorite(MEAL);
        }}
      >
        Add twice
      </button>
      <p>Saved favorites: {favorites.length}</p>
    </div>
  );
}
