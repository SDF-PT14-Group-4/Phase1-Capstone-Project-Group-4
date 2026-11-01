import { Link, useLocation } from "react-router-dom";
import "../../styles/components/account.css";

// Shown to guests wherever an account is needed (favorites, planner, basket,
// and the save/add buttons). The current page is passed along as router state
// so the login flow can send people back to where they were.
export default function SignInPrompt({ title, message, inline = false }) {
  const location = useLocation();
  const state = { from: location };

  if (inline) {
    return (
      <p className="signin-prompt signin-prompt-inline" role="status">
        <span>{message}</span>{" "}
        <Link to="/login" state={state}>
          Log in
        </Link>
        {" · "}
        <Link to="/register" state={state}>
          Register
        </Link>
      </p>
    );
  }

  return (
    <section className="signin-prompt" aria-label={title}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="signin-prompt-actions">
        <Link className="signin-prompt-primary" to="/login" state={state}>
          Log in
        </Link>
        <Link className="signin-prompt-secondary" to="/register" state={state}>
          Create an account
        </Link>
      </div>
    </section>
  );
}
