import { NavLink, Outlet } from "react-router-dom";
import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="site-nav">
          <NavLink to="/" className="brand">
            GlobalTaste
          </NavLink>

          <div className="nav-links">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/search">Search</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/favorites">Favorites</NavLink>
            <NavLink to="/planner">Planner</NavLink>
            <NavLink to="/basket">Basket</NavLink>
            <NavLink to="/surprise">Surprise Me</NavLink>
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
