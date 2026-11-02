import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { AuthProvider } from "../context/AuthContext";
import { BasketProvider } from "../context/BasketContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { PlannerProvider } from "../context/PlannerContext";
import { AUTH_STORAGE_KEY } from "../services/authService";
import { getTokenExpiry, isTokenExpired } from "../utils/token";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const PASSWORD = "correct horse battery";

function reply(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

function renderApp(path = "/") {
  window.history.replaceState({}, "", path);
  return render(
    <AuthProvider>
      <FavoritesProvider>
        <PlannerProvider>
          <BasketProvider>
            <App />
          </BasketProvider>
        </PlannerProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

function saveSession(extra = {}) {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      accessToken: "opaque-test-token",
      user: { id: 1, email: "person@example.com" },
      ...extra,
    })
  );
}

// Builds an unsigned JWT-shaped token; the client only reads its `exp` claim.
function tokenExpiringAt(seconds) {
  const encode = (value) =>
    btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${encode({ alg: "HS256" })}.${encode({ exp: seconds })}.signature`;
}

// A fetch stand-in that answers by "METHOD path" and falls back to empty data.
function mockApi(routes = {}) {
  const calls = [];
  const fetchMock = vi.fn(async (url, options = {}) => {
    // Services use an absolute or a relative base URL depending on the environment.
    const path = String(url).replace(/^.*?\/api(?=\/)/, "");
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({ method, path, body, headers: options.headers });

    const handler = routes[`${method} ${path}`];
    if (handler) return handler({ body, options });

    if (path === "/me/favorites") return reply({ favorites: [] });
    if (path === "/me/basket") return reply({ items: [], total: 0, currency: "KES" });
    if (path === "/me/planner") return reply({ planner: {} });
    return reply({ meals: [] });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, calls };
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/* -------------------------------------------------------------------------- */
/* Token helpers                                                              */
/* -------------------------------------------------------------------------- */

describe("token expiry helpers", () => {
  it("reads the expiry from a JWT payload", () => {
    expect(getTokenExpiry(tokenExpiringAt(2_000_000_000))).toBe(2_000_000_000_000);
  });

  it("treats opaque or malformed tokens as having no expiry", () => {
    expect(getTokenExpiry("opaque-test-token")).toBeNull();
    expect(getTokenExpiry("a.not-json.c")).toBeNull();
    expect(isTokenExpired("opaque-test-token")).toBe(false);
  });

  it("detects an expired token", () => {
    expect(isTokenExpired(tokenExpiringAt(1), Date.now())).toBe(true);
    expect(isTokenExpired(tokenExpiringAt(4_000_000_000), Date.now())).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Guest sign-in prompts                                                      */
/* -------------------------------------------------------------------------- */

describe("guest sign-in prompts", () => {
  it("explains why Favorites needs an account and links to login and register", () => {
    mockApi();
    renderApp("/favorites");

    const prompt = screen.getByRole("region", { name: "Sign in to view your favorites" });
    expect(within(prompt).getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(within(prompt).getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/register"
    );
  });

  it("explains why the Planner needs an account", () => {
    mockApi();
    renderApp("/planner");

    expect(
      screen.getByRole("region", { name: "Sign in to use your meal planner" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Your Weekly Plan" })).not.toBeInTheDocument();
  });

  it("explains that a guest basket only lives on this device", () => {
    mockApi();
    renderApp("/basket");

    expect(
      screen.getByRole("region", { name: "Sign in to keep your basket" })
    ).toBeInTheDocument();
  });

  it("does not show the prompts to a signed-in user", async () => {
    saveSession();
    mockApi();
    renderApp("/planner");

    expect(await screen.findByRole("heading", { name: "Your Weekly Plan" })).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Sign in to use your meal planner" })
    ).not.toBeInTheDocument();
  });

  it("returns the guest to the page they came from after logging in", async () => {
    mockApi({
      "POST /auth/login": () =>
        reply({ accessToken: "fresh-token", user: { id: 1, email: "person@example.com" } }),
    });
    renderApp("/favorites");

    const prompt = screen.getByRole("region", { name: "Sign in to view your favorites" });
    fireEvent.click(within(prompt).getByRole("link", { name: "Log in" }));

    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "person@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: PASSWORD } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(window.location.pathname).toBe("/favorites"));
    expect(
      screen.queryByRole("region", { name: "Sign in to view your favorites" })
    ).not.toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* Session handling                                                           */
/* -------------------------------------------------------------------------- */

describe("session security", () => {
  it("discards a saved session whose token has already expired", () => {
    saveSession({ accessToken: tokenExpiringAt(1) });
    mockApi();
    renderApp("/");

    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("logs out with a clear message when the server rejects the token", async () => {
    saveSession();
    mockApi({
      "GET /me/favorites": () =>
        reply({ error: { code: "TOKEN_EXPIRED", message: "Your session has expired." } }, 401),
    });
    renderApp("/favorites");

    expect(
      await screen.findByText("Your session has expired. Please log in again.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in again" })).toBeInTheDocument();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("revokes the token on the server and clears stored data when logging out", async () => {
    saveSession();
    localStorage.setItem("mealBasket", JSON.stringify([{ id: "1" }]));
    const { calls } = mockApi({ "POST /auth/logout": () => reply(null, 204) });
    renderApp("/");

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() =>
      expect(calls.some((call) => call.method === "POST" && call.path === "/auth/logout")).toBe(true)
    );
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    // The signed-in user's saved basket is gone (a guest basket starts out empty).
    expect(JSON.parse(localStorage.getItem("mealBasket") ?? "[]")).toEqual([]);
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
  });

  it("asks for a longer password when registering", () => {
    mockApi();
    renderApp("/register");

    expect(screen.getByLabelText("Password")).toHaveAttribute("minlength", "10");
    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* Account page                                                               */
/* -------------------------------------------------------------------------- */

const ACCOUNT = {
  id: 1,
  email: "person@example.com",
  createdAt: "2026-10-01T10:00:00+00:00",
  lastLoginAt: "2026-10-30T10:00:00+00:00",
  displayName: null,
  dietaryPreferences: ["vegan"],
  stats: { favorites: 3, plannedMeals: 5, basketItems: 2, customMeals: 1 },
};

describe("account page", () => {
  it("asks guests to sign in", () => {
    mockApi();
    renderApp("/account");

    expect(
      screen.getByRole("region", { name: "Sign in to manage your account" })
    ).toBeInTheDocument();
  });

  it("shows account details and per-user stats", async () => {
    saveSession();
    mockApi({ "GET /me": () => reply(ACCOUNT) });
    renderApp("/account");

    expect(await screen.findByRole("heading", { name: "Your account" })).toBeInTheDocument();
    const stats = screen.getByRole("list");
    expect(within(stats).getByText("Favorites").previousSibling).toHaveTextContent("3");
    expect(within(stats).getByText("Planned meals").previousSibling).toHaveTextContent("5");
    expect(screen.getByLabelText("vegan")).toBeChecked();
  });

  it("saves the display name and dietary preferences", async () => {
    saveSession();
    const { calls } = mockApi({
      "GET /me": () => reply(ACCOUNT),
      "PATCH /me": ({ body }) =>
        reply({ ...ACCOUNT, displayName: body.displayName, dietaryPreferences: body.dietaryPreferences }),
    });
    renderApp("/account");

    fireEvent.change(await screen.findByLabelText("Display name"), { target: { value: "Sam" } });
    fireEvent.click(screen.getByLabelText("halal"));
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByText("Your profile has been saved.")).toBeInTheDocument();
    const patch = calls.find((call) => call.method === "PATCH");
    expect(patch.body).toEqual({ displayName: "Sam", dietaryPreferences: ["vegan", "halal"] });
    // The name now shows in the navigation instead of the email.
    expect(screen.getByRole("link", { name: "Sam" })).toBeInTheDocument();
  });

  it("changes the password and keeps this device signed in with the new token", async () => {
    saveSession();
    mockApi({
      "GET /me": () => reply(ACCOUNT),
      "POST /me/password": () =>
        reply({ accessToken: "new-token", user: { id: 1, email: "person@example.com" } }),
    });
    renderApp("/account");

    fireEvent.change(await screen.findByLabelText("Current password"), { target: { value: PASSWORD } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "a brand new passphrase 9" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "a brand new passphrase 9" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Change password" }));

    expect(await screen.findByText(/Password changed/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)).accessToken).toBe("new-token");
  });

  it("does not send the request when the new passwords differ", async () => {
    saveSession();
    const { calls } = mockApi({ "GET /me": () => reply(ACCOUNT) });
    renderApp("/account");

    fireEvent.change(await screen.findByLabelText("Current password"), { target: { value: PASSWORD } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "a brand new passphrase 9" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "something else 123" } });
    fireEvent.click(screen.getByRole("button", { name: "Change password" }));

    expect(await screen.findByText("The new passwords do not match.")).toBeInTheDocument();
    expect(calls.some((call) => call.path === "/me/password")).toBe(false);
  });

  it("shows the server's message when the current password is wrong", async () => {
    saveSession();
    mockApi({
      "GET /me": () => reply(ACCOUNT),
      "POST /me/password": () =>
        reply({ error: { code: "INVALID_CURRENT_PASSWORD", message: "Your current password is incorrect." } }, 400),
    });
    renderApp("/account");

    fireEvent.change(await screen.findByLabelText("Current password"), { target: { value: "wrong password 1" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "a brand new passphrase 9" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "a brand new passphrase 9" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Change password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Your current password is incorrect.");
  });

  it("asks for the password before deleting the account, then signs out", async () => {
    saveSession();
    const { calls } = mockApi({
      "GET /me": () => reply(ACCOUNT),
      "DELETE /me": () => reply(null, 204),
    });
    renderApp("/account");

    fireEvent.click(await screen.findByRole("button", { name: "Delete my account" }));
    expect(calls.some((call) => call.method === "DELETE")).toBe(false);

    fireEvent.change(screen.getByLabelText("Enter your password to confirm"), {
      target: { value: PASSWORD },
    });
    fireEvent.click(screen.getByRole("button", { name: "Permanently delete" }));

    await waitFor(() => expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull());
    expect(calls.find((call) => call.method === "DELETE").body).toEqual({ password: PASSWORD });
    expect(await screen.findByRole("link", { name: "Log in" })).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* Custom meals                                                               */
/* -------------------------------------------------------------------------- */

const SALAD = {
  id: 7,
  mealId: "custom-7",
  name: "Guacamole salad",
  category: "Salad",
  cuisine: "Mexican",
  image: "",
  ingredients: [{ ingredient: "Avocado", measure: "2" }],
  instructions: "Mash and mix.",
  isPublic: false,
  mealData: { idMeal: "custom-7", strMeal: "Guacamole salad", strMealThumb: "" },
};

describe("my meals page", () => {
  it("asks guests to sign in", () => {
    mockApi();
    renderApp("/my-meals");

    expect(
      screen.getByRole("region", { name: "Sign in to create your own meals" })
    ).toBeInTheDocument();
  });

  it("lists the user's meals with their visibility", async () => {
    saveSession();
    mockApi({ "GET /me/custom-meals": () => reply({ meals: [SALAD] }) });
    renderApp("/my-meals");

    expect(await screen.findByRole("heading", { name: /Guacamole salad/ })).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("requires a name before creating a meal", async () => {
    saveSession();
    const { calls } = mockApi({ "GET /me/custom-meals": () => reply({ meals: [] }) });
    renderApp("/my-meals");

    fireEvent.click(await screen.findByRole("button", { name: "Add meal" }));

    expect(await screen.findByText("Give your meal a name.")).toBeInTheDocument();
    expect(calls.some((call) => call.method === "POST")).toBe(false);
  });

  it("creates a meal from the form, dropping blank ingredient rows", async () => {
    saveSession();
    const { calls } = mockApi({
      "GET /me/custom-meals": () => reply({ meals: [] }),
      "POST /me/custom-meals": ({ body }) => reply({ meal: { ...SALAD, ...body } }, 201),
    });
    renderApp("/my-meals");

    fireEvent.change(await screen.findByLabelText("Meal name"), { target: { value: "Guacamole salad" } });
    fireEvent.change(screen.getByLabelText("Ingredient 1"), { target: { value: "Avocado" } });
    fireEvent.change(screen.getByLabelText("Amount for ingredient 1"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Add ingredient" }));
    fireEvent.click(screen.getByLabelText(/Share publicly/));
    fireEvent.click(screen.getByRole("button", { name: "Add meal" }));

    expect(await screen.findByText(/"Guacamole salad" was added/)).toBeInTheDocument();
    const post = calls.find((call) => call.method === "POST" && call.path === "/me/custom-meals");
    expect(post.body).toMatchObject({
      name: "Guacamole salad",
      isPublic: true,
      ingredients: [{ ingredient: "Avocado", measure: "2" }],
    });
  });

  it("edits an existing meal with PUT", async () => {
    saveSession();
    const { calls } = mockApi({
      "GET /me/custom-meals": () => reply({ meals: [SALAD] }),
      "PUT /me/custom-meals/7": ({ body }) => reply({ meal: { ...SALAD, ...body } }),
    });
    renderApp("/my-meals");

    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Meal name")).toHaveValue("Guacamole salad");
    fireEvent.change(screen.getByLabelText("Meal name"), { target: { value: "Spicy guacamole salad" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText(/"Spicy guacamole salad" was updated/)).toBeInTheDocument();
    expect(calls.find((call) => call.method === "PUT").body.name).toBe("Spicy guacamole salad");
  });

  it("asks for confirmation before deleting a meal", async () => {
    saveSession();
    const { calls } = mockApi({
      "GET /me/custom-meals": () => reply({ meals: [SALAD] }),
      "DELETE /me/custom-meals/7": () => reply(null, 204),
    });
    renderApp("/my-meals");

    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
    expect(calls.some((call) => call.method === "DELETE")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Yes, delete" }));
    expect(await screen.findByText(/"Guacamole salad" was deleted/)).toBeInTheDocument();
    expect(calls.some((call) => call.method === "DELETE" && call.path === "/me/custom-meals/7")).toBe(true);
  });
});

describe("planner with custom meals", () => {
  it("offers the user's own meals next to the search", async () => {
    saveSession();
    mockApi({ "GET /me/custom-meals": () => reply({ meals: [SALAD] }) });
    renderApp("/planner");

    expect(await screen.findByRole("heading", { name: "Your Custom Meals" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to Monday" })).toBeInTheDocument();
  });

  it("ignores malformed custom meal data from the server", async () => {
    saveSession();
    mockApi({ "GET /me/custom-meals": () => reply({ meals: [{ idMeal: "1", strMeal: "Odd" }] }) });
    renderApp("/planner");

    expect(await screen.findByRole("heading", { name: "Your Weekly Plan" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Your Custom Meals" })).not.toBeInTheDocument();
  });
});
