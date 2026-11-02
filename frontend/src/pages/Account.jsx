import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import SignInPrompt from "../components/common/SignInPrompt.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import {
  DIETARY_OPTIONS,
  changePassword,
  deleteAccount,
  getAccount,
  updateProfile,
} from "../services/accountService.js";
import { PASSWORD_HINT } from "../services/authService.js";
import "../styles/components/account.css";

const STAT_LABELS = [
  ["favorites", "Favorites"],
  ["plannedMeals", "Planned meals"],
  ["basketItems", "Basket items"],
  ["customMeals", "Custom meals"],
];

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString(undefined, { dateStyle: "long" });
}

function AccountContent() {
  const { accessToken, updateSession, logout } = useAuth();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [dietary, setDietary] = useState([]);
  const [profileStatus, setProfileStatus] = useState({ type: "", text: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState({ type: "", text: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  const applyAccount = useCallback((data) => {
    setAccount(data);
    setDisplayName(data.displayName || "");
    setDietary(data.dietaryPreferences || []);
  }, []);

  useEffect(() => {
    let active = true;
    getAccount(accessToken)
      .then((data) => {
        if (active) applyAccount(data);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, [accessToken, applyAccount]);

  function toggleDietary(option) {
    setDietary((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileStatus({ type: "", text: "" });
    setSavingProfile(true);
    try {
      const data = await updateProfile(accessToken, {
        displayName,
        dietaryPreferences: dietary,
      });
      applyAccount(data);
      updateSession({ user: { displayName: data.displayName || "" } });
      setProfileStatus({ type: "success", text: "Your profile has been saved." });
    } catch (error) {
      setProfileStatus({ type: "error", text: error.message });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordStatus({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", text: "The new passwords do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      const session = await changePassword(accessToken, currentPassword, newPassword);
      // The old token no longer works; keep this device signed in with the new one.
      updateSession({ accessToken: session.accessToken, user: session.user });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({
        type: "success",
        text: "Password changed. You have been signed out of your other devices.",
      });
    } catch (error) {
      setPasswordStatus({ type: "error", text: error.message });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteSubmit(event) {
    event.preventDefault();
    setDeleteStatus("");
    setDeleteBusy(true);
    try {
      await deleteAccount(accessToken, deletePassword);
      logout();
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteStatus(error.message);
      setDeleteBusy(false);
    }
  }

  if (loadError) {
    return (
      <main className="account-page">
        <p className="account-error" role="alert">
          {loadError}
        </p>
      </main>
    );
  }

  if (!account) {
    return (
      <main className="account-page">
        <LoadingState label="Loading your account..." />
      </main>
    );
  }

  return (
    <main className="account-page">
      <header>
        <h1>Your account</h1>
        <p className="account-lead">
          Manage your details, password and saved information.
        </p>
      </header>

      <section className="account-card" aria-labelledby="account-details-title">
        <h2 id="account-details-title">Account details</h2>
        <dl className="account-details">
          <dt>Email</dt>
          <dd>{account.email}</dd>
          <dt>Member since</dt>
          <dd>{formatDate(account.createdAt)}</dd>
          <dt>Last login</dt>
          <dd>{formatDate(account.lastLoginAt)}</dd>
        </dl>
      </section>

      <section className="account-card" aria-labelledby="account-stats-title">
        <h2 id="account-stats-title">Your activity</h2>
        <ul className="account-stats">
          {STAT_LABELS.map(([key, label]) => (
            <li key={key}>
              <strong>{account.stats?.[key] ?? 0}</strong>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="account-card" aria-labelledby="account-profile-title">
        <h2 id="account-profile-title">Profile</h2>
        <form className="account-form" onSubmit={handleProfileSubmit}>
          <label htmlFor="account-display-name">Display name</label>
          <input
            id="account-display-name"
            type="text"
            maxLength={60}
            autoComplete="nickname"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <p className="account-hint">
            Shown on meals you share publicly. Optional.
          </p>

          <fieldset>
            <legend>Dietary preferences</legend>
            <div className="chip-group">
              {DIETARY_OPTIONS.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={dietary.includes(option)}
                    onChange={() => toggleDietary(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
          {profileStatus.text && (
            <p
              className={profileStatus.type === "error" ? "account-error" : "account-success"}
              role={profileStatus.type === "error" ? "alert" : "status"}
            >
              {profileStatus.text}
            </p>
          )}
        </form>
      </section>

      <section className="account-card" aria-labelledby="account-password-title">
        <h2 id="account-password-title">Change password</h2>
        <form className="account-form" onSubmit={handlePasswordSubmit}>
          <label htmlFor="account-current-password">Current password</label>
          <input
            id="account-current-password"
            type="password"
            autoComplete="current-password"
            maxLength={128}
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />

          <label htmlFor="account-new-password">New password</label>
          <input
            id="account-new-password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={128}
            required
            aria-describedby="account-password-hint"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <p id="account-password-hint" className="account-hint">
            {PASSWORD_HINT}
          </p>

          <label htmlFor="account-confirm-password">Confirm new password</label>
          <input
            id="account-confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={128}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          <button type="submit" disabled={savingPassword}>
            {savingPassword ? "Changing..." : "Change password"}
          </button>
          {passwordStatus.text && (
            <p
              className={passwordStatus.type === "error" ? "account-error" : "account-success"}
              role={passwordStatus.type === "error" ? "alert" : "status"}
            >
              {passwordStatus.text}
            </p>
          )}
        </form>
      </section>

      <section
        className="account-card account-card-danger"
        aria-labelledby="account-delete-title"
      >
        <h2 id="account-delete-title">Delete account</h2>
        <p>
          This permanently removes your account, favorites, planner, basket and
          custom meals. It cannot be undone.
        </p>
        {!deleting ? (
          <button
            type="button"
            className="account-button account-danger-button"
            onClick={() => setDeleting(true)}
          >
            Delete my account
          </button>
        ) : (
          <form className="account-form" onSubmit={handleDeleteSubmit}>
            <label htmlFor="account-delete-password">
              Enter your password to confirm
            </label>
            <input
              id="account-delete-password"
              type="password"
              autoComplete="current-password"
              maxLength={128}
              required
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
            />
            <div className="custom-meal-actions">
              <button
                type="submit"
                className="account-danger-button"
                disabled={deleteBusy}
              >
                {deleteBusy ? "Deleting..." : "Permanently delete"}
              </button>
              <button
                type="button"
                className="account-button"
                onClick={() => {
                  setDeleting(false);
                  setDeletePassword("");
                  setDeleteStatus("");
                }}
              >
                Cancel
              </button>
            </div>
            {deleteStatus && (
              <p className="account-error" role="alert">
                {deleteStatus}
              </p>
            )}
          </form>
        )}
      </section>
    </main>
  );
}

export default function Account() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <main className="account-page">
        <SignInPrompt
          title="Sign in to manage your account"
          message="Your profile, password and saved meals live in your account."
        />
      </main>
    );
  }

  return <AccountContent />;
}
