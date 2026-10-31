import { Link } from "react-router-dom";
import "./GuestSignInPrompt.css";

export default function GuestSignInPrompt({ feature }) {
  return (
    <section className="guest-sign-in-prompt" role="status">
      <div>
        <p className="guest-sign-in-eyebrow">ACCOUNT REQUIRED</p>
        <h2>Sign in to use {feature}</h2>
        <p>Create an account or sign in to save and manage {feature} across sessions.</p>
      </div>
      <div className="guest-sign-in-actions">
        <Link className="guest-sign-in-primary" to="/login">Sign in</Link>
        <Link className="guest-sign-in-secondary" to="/register">Create account</Link>
      </div>
    </section>
  );
}
