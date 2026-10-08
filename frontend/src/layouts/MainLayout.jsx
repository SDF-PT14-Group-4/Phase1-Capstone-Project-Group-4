import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./MainLayout.css";

function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
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
            <span></span>
            <span></span>
            <span></span>
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
          </div>
        </nav>
      </header>

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