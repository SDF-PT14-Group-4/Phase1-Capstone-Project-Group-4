import { Routes, Route } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Home from "../pages/Home";
import Search from "../pages/Search";
import Categories from "../pages/Categories";
import CategoryMeals from "../pages/CategoryMeals";
import Cuisines from "../pages/Cuisines";
import CuisineMeals from "../pages/CuisineMeals";
import MealDetails from "../pages/MealDetails";
import Favorites from "../pages/Favorites";
import MealPlanner from "../pages/MealPlanner";
import Basket from "../pages/Basket";
import SurpriseMe from "../pages/SurpriseMe";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:category" element={<CategoryMeals />} />
        <Route path="/cuisines" element={<Cuisines />} />
        <Route path="/cuisines/:cuisine" element={<CuisineMeals />} />
        <Route path="/meal/:id" element={<MealDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/planner" element={<MealPlanner />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/surprise" element={<SurpriseMe />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
