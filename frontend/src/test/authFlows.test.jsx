import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { AuthProvider } from "../context/AuthContext";
import { AUTH_STORAGE_KEY } from "../services/authService";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const API_BASE_URL = "http://127.0.0.1:5000/api";
const PASSWORD = "correct horse battery";

function response(data, ok = true, status = ok ? 200 : 400) {
  return {
    ok,
    status,
    json: async () => data,
  };
}

// App no longer mounts its own providers, so every render needs them.
function renderApp(path = "/") {
  window.history.replaceState({}, "", path);

  return render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function saveSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function fillLoginForm({ email = "person@example.com", password = PASSWORD } = {}) {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
}

function fillRegisterForm({
  email = "person@example.com",
  password = PASSWORD,
  confirmPassword = PASSWORD,
} = {}) {
  fillLoginForm({ email, password });
  fireEvent.change(screen.getByLabelText("Confirm password"), {
    target: { value: confirmPassword },
  });
}

function dispatchStorageEvent({ oldValue = null, newValue = null }) {
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: AUTH_STORAGE_KEY,
        oldValue,
        newValue,
      })
    );
  });
}

function resetEnvironment() {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                      */
/* -------------------------------------------------------------------------- */

describe("session restore and logout behavior", () => {
  resetEnvironment();

  it("restores a session started in another tab", () => {
    renderApp("/");
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();

    dispatchStorageEvent({
      newValue: JSON.stringify({
        accessToken: "shared-token",
        user: { id: 3, email: "shared@example.com" },
      }),
    });

    expect(screen.getByText("shared@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });

  it("logs out when another tab ends the session", () => {
    saveSession({
      accessToken: "tab-token",
      user: { id: 4, email: "tab@example.com" },
    });
    renderApp("/");
    expect(screen.getByText("tab@example.com")).toBeInTheDocument();

    dispatchStorageEvent({
      oldValue: localStorage.getItem(AUTH_STORAGE_KEY),
      newValue: null,
    });

    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.queryByText("tab@example.com")).not.toBeInTheDocument();
  });

  it("discards a corrupted saved session instead of restoring it", () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "{not-valid-json");
    renderApp("/");

    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("discards a saved session with an unexpected shape", () => {
    saveSession({ accessToken: "", user: null });
    renderApp("/");

    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("redirects a restored session away from the login page", () => {
    saveSession({
      accessToken: "restored-token",
      user: { id: 5, email: "restored@example.com" },
    });
    renderApp("/login");

    expect(
      screen.getByRole("heading", { name: /a world of flavor is waiting/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Log in" })
    ).not.toBeInTheDocument();
  });

  it("logs out and returns the visitor to the home page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          accessToken: "login-token",
          user: { id: 12, email: "person@example.com" },
        })
      )
    );
    renderApp("/login");

    fillLoginForm();
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByRole("button", { name: "Log out" })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByLabelText("Email")).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("link", { name: "Search" }));
    expect(window.location.pathname).toBe("/search");

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(
      await screen.findByRole("heading", {
        name: /a world of flavor is waiting/i,
      })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});

describe("account registration and login", () => {
  resetEnvironment();

  it("registers, persists the returned session, and supports logout", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response(
        {
          accessToken: "registration-token",
          user: { id: 7, email: "person@example.com" },
        },
        true,
        201
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { unmount } = renderApp("/register");

    fillRegisterForm({ email: " person@example.com " });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByRole("button", { name: "Log out" })
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/register`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "person@example.com",
          password: PASSWORD,
        }),
      })
    );
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))).toEqual({
      accessToken: "registration-token",
      user: { id: 7, email: "person@example.com" },
    });
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toContain("battery");

    // The saved session survives a fresh mount.
    unmount();
    renderApp("/");
    expect(screen.getByText("person@example.com")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(
      await screen.findByRole("link", { name: "Log in" })
    ).toBeInTheDocument();
  });

  it("shows backend login errors without persisting a session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response(
          {
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Email or password is incorrect.",
            },
          },
          false,
          401
        )
      )
    );
    renderApp("/login");

    fillLoginForm({ password: "incorrect password" });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email or password is incorrect."
    );
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("logs in and updates the navigation with the authenticated account", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          accessToken: "login-token",
          user: { id: 12, email: "person@example.com" },
        })
      )
    );
    renderApp("/login");

    fillLoginForm();
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByRole("button", { name: "Log out" })
    ).toBeInTheDocument();
    expect(screen.getByText("person@example.com")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))).toEqual({
      accessToken: "login-token",
      user: { id: 12, email: "person@example.com" },
    });
  });

  it("blocks registration when password confirmation does not match", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderApp("/register");

    fillRegisterForm({ confirmPassword: "different password" });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match."
    );
    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled());
  });
});