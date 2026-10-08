import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MealDetails from "./pages/MealDetails";
import Categories from "./pages/Categories";
import CategoryMeals from "./pages/CategoryMeals";
import Favorites from "./pages/Favorites";
import Planner from "./pages/Planner";
import Basket from "./pages/Basket";
import Surprise from "./pages/Surprise";
import Cuisines from "./pages/Cuisines";
import CuisineMeals from "./pages/CuisineMeals";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/meal" element={<MealDetails />} />
          <Route path="/meal/:id" element={<MealDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:category" element={<CategoryMeals />}/>
          <Route path="/cuisines" element={<Cuisines />} />
          <Route path="/cuisines/:cuisine" element={<CuisineMeals />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/basket" element={<Basket />} />
          <Route path="/surprise" element={<Surprise />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;