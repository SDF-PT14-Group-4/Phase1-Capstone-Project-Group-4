import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context.js";
import { authenticate, AUTH_STORAGE_KEY, endSession } from "../services/authService";
import {
  AUTH_EXPIRED_EVENT,
  SESSION_EXPIRED_MESSAGE,
} from "../services/apiClient.js";
import { STORAGE_KEYS } from "../utils/storage.js";
import { getTokenExpiry, isTokenExpired } from "../utils/token.js";

// setTimeout cannot wait longer than this (about 24.8 days).
const MAX_TIMER_MS = 2 ** 31 - 1;

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
    if (session === null || isTokenExpired(session.accessToken)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
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

// Removes the session and any account-related data kept in this browser.
function hasStoredSession() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Unable to clear the saved account session:", error);
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [sessionNotice, setSessionNotice] = useState("");

  const expireSession = useCallback((message = SESSION_EXPIRED_MESSAGE) => {
    // Several requests can fail together; only the first one announces it,
    // and only when someone was actually signed in.
    if (hasStoredSession()) setSessionNotice(message);
    clearStoredSession();
    setAuth(null);
  }, []);

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

  // The server rejected our token (expired, revoked, password changed...).
  useEffect(() => {
    const handleExpired = () => expireSession();
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [expireSession]);

  // End the session on time instead of waiting for the next failed request.
  const accessToken = auth?.accessToken ?? null;
  useEffect(() => {
    const expiry = accessToken ? getTokenExpiry(accessToken) : null;
    if (expiry === null) return undefined;
    const timer = setTimeout(
      () => expireSession(),
      Math.min(Math.max(expiry - Date.now(), 0), MAX_TIMER_MS)
    );
    return () => clearTimeout(timer);
  }, [accessToken, expireSession]);

  async function login(credentials) {
    const session = await authenticate("login", credentials);
    persistSession(session);
    setSessionNotice("");
    setAuth(session);
  }

  async function register(credentials) {
    const session = await authenticate("register", credentials);
    persistSession(session);
    setSessionNotice("");
    setAuth(session);
  }

  function logout() {
    if (auth?.accessToken) {
      // Revoke the token on the server; do not make the user wait for it.
      void endSession(auth.accessToken);
    }
    clearStoredSession();
    setSessionNotice("");
    setAuth(null);
  }

  // Used by the profile page after a password change (new token) or a
  // display-name edit (same token, new details).
  const updateSession = useCallback(
    (changes) => {
      if (!auth) return;
      const next = {
        accessToken: changes.accessToken ?? auth.accessToken,
        user: { ...auth.user, ...(changes.user ?? {}) },
      };
      if (!next.user.displayName) delete next.user.displayName;
      persistSession(next);
      setAuth(next);
    },
    [auth]
  );

  const clearSessionNotice = useCallback(() => setSessionNotice(""), []);

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      accessToken: auth?.accessToken ?? null,
      isAuthenticated: Boolean(auth?.accessToken),
      sessionNotice,
      clearSessionNotice,
      updateSession,
      login,
      register,
      logout,
    }),
    // login, register and logout only close over `auth`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [auth, sessionNotice, clearSessionNotice, updateSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
