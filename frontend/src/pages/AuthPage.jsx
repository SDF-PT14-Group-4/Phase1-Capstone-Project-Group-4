import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from "../services/authService";
import "./Auth.css";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { isAuthenticated, login, register } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    // Send people back to the page that asked them to sign in.
    const from = location.state?.from;
    const destination =
      from && typeof from.pathname === "string" && from.pathname.startsWith("/")
        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
        : "/";
    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const credentials = { email: email.trim(), password };
      if (isRegister) {
        await register(credentials);
      } else {
        await login(credentials);
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">{isRegister ? "JOIN GLOBALTASTE" : "WELCOME BACK"}</p>
        <h1 id="auth-title">{isRegister ? "Create your account" : "Log in"}</h1>
        <p className="auth-intro">
          {isRegister
            ? "Save your favorite recipes and make meal planning yours."
            : "Log in to continue to your GlobalTaste account."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? PASSWORD_MIN_LENGTH : undefined}
            maxLength={128}
            required
            aria-describedby={isRegister ? "auth-password-hint" : undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {isRegister && (
            <>
              <p id="auth-password-hint" className="auth-hint">
                {PASSWORD_HINT}
              </p>

              <label htmlFor="auth-confirm-password">Confirm password</label>
              <input
                id="auth-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={128}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to GlobalTaste?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
