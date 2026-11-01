import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { AuthProvider } from "../context/AuthContext";
import { BasketProvider } from "../context/BasketContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { PlannerContext } from "../context/planner-context.js";
import { useFavorites } from "../hooks/useFavorites.js";
import { AUTH_STORAGE_KEY } from "../services/authService";

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

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

const ADD_FAVORITE_LABEL = `Add ${MEAL.strMeal} to favorites`;
const BASKET_API_URL = "http://127.0.0.1:5000/api/me/basket";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function createPlannerValue() {
  return {
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
  };
}

function renderApp(path = "/") {
  window.history.replaceState({}, "", path);

  return render(
    <AuthProvider>
      <FavoritesProvider>
        <BasketProvider>
          <PlannerContext.Provider value={createPlannerValue()}>
            <App />
          </PlannerContext.Provider>
        </BasketProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

function mockJsonResponse(data, ok = true) {
  return {
    ok,
    json: async () => data,
  };
}

function setAuthenticatedSession() {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      accessToken: "test-token",
      user: { id: 1, email: "person@example.com" },
    })
  );
}

function expectBasketTotal(amount) {
  expect(screen.getByText("Total").parentElement).toHaveTextContent(
    new RegExp(`KSh\\s*${amount}`)
  );
}

function mockFavoritesApi() {
  return vi.fn(async (url, options = {}) => {
    const path = String(url);
    const method = options.method || "GET";
    const isFavoritesEndpoint = path.endsWith("/me/favorites");

    if (isFavoritesEndpoint && method === "GET") {
      return mockJsonResponse({ favorites: [] });
    }

    if (isFavoritesEndpoint && method === "POST") {
      const meal = JSON.parse(options.body);

      return mockJsonResponse({
        mealId: meal.idMeal,
        name: meal.strMeal,
        image: meal.strMealThumb,
        category: meal.strCategory,
        cuisine: meal.strArea,
        mealData: meal,
      });
    }

    // Meal search, category discovery, and recipe details.
    return mockJsonResponse({ meals: [MEAL] });
  });
}

function mockBasketApi(initialItems) {
  let items = initialItems;

  return vi.fn(async (url, options = {}) => {
    const path = String(url);
    const method = options.method || "GET";

    if (path.endsWith("/me/basket") && method === "GET") {
      return mockJsonResponse({
        items,
        total: items.reduce((sum, item) => sum + item.subtotal, 0),
        currency: "KES",
      });
    }

    if (path.endsWith("/me/basket") && method === "POST") {
      const request = JSON.parse(options.body);
      const existing = items.find((item) => item.mealId === request.mealId);

      existing.quantity += 1;
      existing.subtotal = existing.price * existing.quantity;

      return mockJsonResponse(existing);
    }

    if (path.endsWith("/me/basket/52772") && method === "PATCH") {
      const { quantity } = JSON.parse(options.body);

      items[0].quantity = quantity;
      items[0].subtotal = items[0].price * quantity;

      return mockJsonResponse(items[0]);
    }

    if (path.endsWith("/me/basket") && method === "DELETE") {
      items = [];
      return { status: 204, ok: true };
    }

    throw new Error(`Unexpected basket request: ${method} ${path}`);
  });
}

function getFavoritePostCalls(fetchMock) {
  return fetchMock.mock.calls.filter(
    ([url, options = {}]) =>
      String(url).endsWith("/me/favorites") && options.method === "POST"
  );
}

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

/* -------------------------------------------------------------------------- */
/* Tests                                                                      */
/* -------------------------------------------------------------------------- */

describe("application user flows", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it(
    "renders the home screen, shared navigation, and layout across routes",
    async () => {
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
        screen.getByRole("heading", { name: /a world of flavor is waiting/i })
      ).toBeInTheDocument();

      for (const label of [
        "Home",
        "Search",
        "Categories",
        "Cuisines",
        "Favorites",
        "Planner",
        "Basket",
      ]) {
        expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
      }

      expect(
        screen.getAllByRole("link", { name: "Surprise Me" }).length
      ).toBeGreaterThan(0);
      expect(screen.getByText(/© 2026 GlobalTaste/i)).toBeInTheDocument();

      // Categories -> category detail
      fireEvent.click(screen.getByRole("link", { name: "Categories" }));
      expect(
        await screen.findByRole("heading", { name: /meal categories/i })
      ).toBeInTheDocument();

      fireEvent.click(await screen.findByRole("link", { name: /beef/i }));
      expect(
        await screen.findByRole("heading", { name: /beef meals/i })
      ).toBeInTheDocument();

      // Planner
      fireEvent.click(screen.getByRole("link", { name: "Planner" }));
      expect(
        await screen.findByRole("heading", { name: /weekly meal planner/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Planner" })).toHaveAttribute(
        "aria-current",
        "page"
      );
      expect(
        screen.getByRole("link", { name: "GlobalTaste" })
      ).toBeInTheDocument();
      expect(screen.getByText(/© 2026 GlobalTaste/i)).toBeInTheDocument();

      // Back home
      fireEvent.click(screen.getByRole("link", { name: "Home" }));
      expect(
        await screen.findByRole("heading", {
          name: /a world of flavor is waiting/i,
        })
      ).toBeInTheDocument();
    },
    10000
  );

  it("searches meals, opens details, and saves a favorite", async () => {
    setAuthenticatedSession();
    const fetchMock = mockFavoritesApi();
    vi.stubGlobal("fetch", fetchMock);

    renderApp();

    // Search
    fireEvent.click(screen.getByRole("link", { name: "Search" }));
    const input = screen.getByRole("searchbox", { name: "Search meals" });
    fireEvent.change(input, { target: { value: "chicken" } });
    expect(input).toHaveValue("chicken");
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    // Save as favorite
    await screen.findByRole("heading", { name: MEAL.strMeal });
    fireEvent.click(screen.getByRole("button", { name: ADD_FAVORITE_LABEL }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/me/favorites",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    // Open details
    fireEvent.click(screen.getByRole("link", { name: "View Recipe" }));
    expect(
      await screen.findByRole("heading", { name: MEAL.strMeal })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chicken", { selector: ".ingredient-name" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("1 lb", { selector: ".ingredient-measure" })
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/meals/52772",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("adds a category meal to favorites", async () => {
    setAuthenticatedSession();
    const fetchMock = mockFavoritesApi();
    vi.stubGlobal("fetch", fetchMock);

    renderApp("/categories/Chicken");

    fireEvent.click(
      await screen.findByRole("button", { name: ADD_FAVORITE_LABEL })
    );
    fireEvent.click(screen.getByRole("link", { name: /favorites/i }));

    expect(
      await screen.findByRole("heading", { name: MEAL.strMeal })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getFavoritePostCalls(fetchMock)).toHaveLength(1);
    });
  });

  it("does not add the same favorite meal more than once", async () => {
    setAuthenticatedSession();
    const fetchMock = mockFavoritesApi();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AuthProvider>
        <FavoritesProvider>
          <FavoriteDuplicateProbe />
        </FavoritesProvider>
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /add twice/i }));

    await waitFor(() => {
      expect(getFavoritePostCalls(fetchMock)).toHaveLength(1);
    });
  });

  it("shows search validation and no-results feedback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({ meals: null }))
    );
    renderApp("/search");

    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      /enter a meal name to start searching/i
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search meals" }), {
      target: { value: "no-such-meal" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      /no meals found\. try another name/i
    );
  });

  it("adds a meal to the basket and supports the empty basket state", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        // Categories list
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
        // Meals in category
        .mockResolvedValueOnce(mockJsonResponse({ meals: [MEAL] }))
        // Meal details
        .mockResolvedValueOnce(mockJsonResponse({ meals: [MEAL] }))
    );
    renderApp("/basket");

    expect(
      screen.getByRole("heading", { name: /nothing here yet/i })
    ).toBeInTheDocument();

    // Navigate to the recipe
    fireEvent.click(screen.getByRole("link", { name: "Categories" }));
    fireEvent.click(await screen.findByRole("link", { name: /chicken/i }));
    fireEvent.click(await screen.findByRole("link", { name: /view recipe/i }));
    expect(
      await screen.findByRole("heading", { name: MEAL.strMeal })
    ).toBeInTheDocument();

    // Price validation
    fireEvent.click(screen.getByRole("button", { name: /add to basket/i }));
    expect(screen.getByText(/please enter a valid price/i)).toBeInTheDocument();

    // Add with a valid price
    fireEvent.change(screen.getByLabelText(/price \(ksh\)/i), {
      target: { value: "500" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add to basket/i }));
    expect(await screen.findByText(/added to basket/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("mealBasket"))).toHaveLength(1);

    // Basket total
    fireEvent.click(screen.getByRole("link", { name: "Basket" }));
    expectBasketTotal(500);
  });

  it("uses the account basket API for items, quantities, and totals", async () => {
    setAuthenticatedSession();
    const fetchMock = mockBasketApi([
      {
        mealId: "52772",
        name: MEAL.strMeal,
        image: MEAL.strMealThumb,
        price: 250,
        quantity: 2,
        subtotal: 500,
      },
    ]);
    vi.stubGlobal("fetch", fetchMock);

    renderApp("/basket");

    // Initial load
    expect(await screen.findByText("Total")).toBeInTheDocument();
    expectBasketTotal(500);
    expect(fetchMock).toHaveBeenCalledWith(
      BASKET_API_URL,
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
      })
    );

    // Increase quantity
    fireEvent.click(screen.getByRole("button", { name: /increase quantity/i }));
    await screen.findByText("3");
    expectBasketTotal(750);

    // Decrease quantity
    fireEvent.click(screen.getByRole("button", { name: /decrease quantity/i }));
    await screen.findByText("2");
    expectBasketTotal(500);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASKET_API_URL}/52772`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ quantity: 2 }),
      })
    );

    // Clear basket
    fireEvent.click(screen.getByRole("button", { name: /clear basket/i }));
    expect(
      await screen.findByRole("heading", { name: /nothing here yet/i })
    ).toBeInTheDocument();
  });

  it("loads a valid random meal recommendation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ meals: [MEAL] }));
    vi.stubGlobal("fetch", fetchMock);
    renderApp("/surprise");

    fireEvent.click(screen.getByRole("button", { name: /surprise me!/i }));

    expect(
      await screen.findByRole("heading", { name: MEAL.strMeal })
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/meals/random",
      expect.anything()
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
});