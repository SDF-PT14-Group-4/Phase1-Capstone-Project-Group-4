import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MealDetails from "./pages/MealDetails";
import Categories from "./pages/Categories";
import CategoryMeals from "./pages/CategoryMeals";
import Cuisines from "./pages/Cuisine";
import CuisineMeals from "./pages/CuisineMeals";
import Favorites from "./pages/Favorites";
import Planner from "./pages/Planner";
import Basket from "./pages/Basket";
import Surprise from "./pages/Surprise";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/meal" element={<MealDetails />} />
            <Route path="/meal/:id" element={<MealDetails />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:category" element={<CategoryMeals />} />
            <Route path="/cuisines" element={<Cuisines />} />
            <Route path="/cuisines/:cuisine" element={<CuisineMeals />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/basket" element={<Basket />} />
            <Route path="/surprise" element={<Surprise />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
