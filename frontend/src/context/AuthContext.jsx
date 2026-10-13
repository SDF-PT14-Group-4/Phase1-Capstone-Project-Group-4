import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context.js";
import { authenticate, AUTH_STORAGE_KEY } from "../services/authService";

function isValidSession(value) {
  return (
    typeof value?.accessToken === "string" &&
    value.accessToken.length > 0 &&
    typeof value?.user?.id === "number" &&
    typeof value.user?.email === "string"
  );
}

function parseSession(stored) {
  try {
    const auth = JSON.parse(stored);
    return isValidSession(auth) ? auth : null;
  } catch {
    return null;
  }
}

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === null) return null;
    const session = parseSession(stored);
    if (session === null) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return session;
  } catch (error) {
    console.error("Unable to load the saved account session:", error);
    return null;
  }
}

function persistSession(session) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Unable to save the account session:", error);
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear the saved account session:", error);
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  // Keeps every open tab in sync: another tab signing in or out fires a
  // "storage" event here, so the restored session is applied or dropped app-wide.
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key !== AUTH_STORAGE_KEY) return;
      setAuth(event.newValue === null ? null : parseSession(event.newValue));
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  async function login(credentials) {
    const session = await authenticate("login", credentials);
    persistSession(session);
    setAuth(session);
  }

  async function register(credentials) {
    const session = await authenticate("register", credentials);
    persistSession(session);
    setAuth(session);
  }

  function logout() {
    clearStoredSession();
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
