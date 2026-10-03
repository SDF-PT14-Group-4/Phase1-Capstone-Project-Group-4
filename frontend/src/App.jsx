import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MealDetails from "./pages/MealDetails";
import Categories from "./pages/Categories";
import Favorites from "./pages/Favorites";
import Planner from "./pages/Planner";
import Basket from "./pages/Basket";
import Surprise from "./pages/Surprise";

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