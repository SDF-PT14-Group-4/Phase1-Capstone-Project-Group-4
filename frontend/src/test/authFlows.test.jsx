import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { AUTH_STORAGE_KEY } from "../services/authService";

function response(data, ok = true, status = ok ? 200 : 400) {
  return {
    ok,
    status,
    json: async () => data,
  };
}

describe("account registration and login", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("registers, persists the returned session, and supports logout", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        accessToken: "registration-token",
        user: { id: 7, email: "person@example.com" },
      }, true, 201)
    );
    vi.stubGlobal("fetch", fetchMock);

    window.history.replaceState({}, "", "/register");
    const { unmount } = render(<App />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: " person@example.com " },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct horse battery" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "correct horse battery" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "person@example.com",
          password: "correct horse battery",
        }),
      })
    );
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))).toEqual({
      accessToken: "registration-token",
      user: { id: 7, email: "person@example.com" },
    });
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toContain("battery");

    unmount();
    window.history.replaceState({}, "", "/");
    render(<App />);
    expect(screen.getByText("person@example.com")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(await screen.findByRole("link", { name: "Log in" })).toBeInTheDocument();
  });

  it("shows backend login errors without persisting a session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response(
          { error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } },
          false,
          401
        )
      )
    );
    window.history.replaceState({}, "", "/login");
    render(<App />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "person@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "incorrect password" },
    });
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
    window.history.replaceState({}, "", "/login");
    render(<App />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "person@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct horse battery" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.getByText("person@example.com")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))).toEqual({
      accessToken: "login-token",
      user: { id: 12, email: "person@example.com" },
    });
  });

  it("blocks registration when password confirmation does not match", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState({}, "", "/register");
    render(<App />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "person@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct horse battery" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Passwords do not match.");
    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled());
  });
});
