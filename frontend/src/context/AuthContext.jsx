import { useMemo, useState } from "react";
import { AuthContext } from "./authContext.js";
import { authenticate, AUTH_STORAGE_KEY } from "../services/authService";

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const auth = JSON.parse(stored);
    if (
      typeof auth?.accessToken === "string" &&
      auth.accessToken &&
      typeof auth.user?.id === "number" &&
      typeof auth.user?.email === "string"
    ) {
      return auth;
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Unable to load the saved account session:", error);
  }
  return null;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  async function login(credentials) {
    const session = await authenticate("login", credentials);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setAuth(session);
  }

  async function register(credentials) {
    const session = await authenticate("register", credentials);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setAuth(session);
  }

  function logout() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Unable to clear the saved account session:", error);
    }
    setAuth(null);
  }

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      accessToken: auth?.accessToken ?? null,
      isAuthenticated: Boolean(auth?.accessToken),
      login,
      register,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
