import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./MainLayout.css";

function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, sessionNotice, clearSessionNotice } =
    useAuth();
  const navigate = useNavigate();

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="site-nav">
          <NavLink to="/" className="brand" onClick={closeMenu}>
            GlobalTaste
          </NavLink>

          <button
            type="button"
            className={`menu-toggle ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            <span />
            <span />
            <span />
          </button>

          <div
            id="main-navigation"
            className={`nav-links ${menuOpen ? "menu-open" : ""}`}
          >
            <NavLink to="/" onClick={closeMenu}>
              Home
            </NavLink>

            <NavLink to="/search" onClick={closeMenu}>
              Search
            </NavLink>

            <NavLink to="/categories" onClick={closeMenu}>
              Categories
            </NavLink>

            <NavLink to="/cuisines" onClick={closeMenu}>
              Cuisines
            </NavLink>

            <NavLink to="/favorites" onClick={closeMenu}>
              Favorites
            </NavLink>

            <NavLink to="/planner" onClick={closeMenu}>
              Planner
            </NavLink>

            <NavLink to="/basket" onClick={closeMenu}>
              Basket
            </NavLink>

            <NavLink to="/surprise" onClick={closeMenu}>
              Surprise Me
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/my-meals" onClick={closeMenu}>
                  My Meals
                </NavLink>
                <NavLink
                  to="/account"
                  className="nav-account"
                  onClick={closeMenu}
                  title={user.email}
                >
                  {user.displayName || user.email}
                </NavLink>
                <button
                  type="button"
                  className="nav-auth-button"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMenu}>
                  Log in
                </NavLink>
                <NavLink to="/register" onClick={closeMenu}>
                  Register
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      {sessionNotice && !isAuthenticated && (
        <div className="session-notice" role="alert">
          <span>{sessionNotice}</span>
          <Link to="/login" onClick={clearSessionNotice}>
            Log in again
          </Link>
          <button
            type="button"
            onClick={clearSessionNotice}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>© 2026 GlobalTaste</p>
      </footer>
    </div>
  );
}

export default MainLayout;