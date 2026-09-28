import { NavLink, Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div>
      <header>
        <nav>
          <NavLink to="/">GlobalTaste</NavLink>

          <div>
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

      <main>
        <Outlet />
      </main>

      <footer>
        <p>© 2026 GlobalTaste</p>
      </footer>
    </div>
  );
}

export default MainLayout;