import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NearbyNGO from './pages/NearbyNGO';
import RecipeSuggestion from './pages/RecipeSuggestion';
import FoodDetection from './pages/FoodDetection';
import RecipeDetails from './pages/RecipeDetails';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const location = useLocation();

  // List of routes where Navbar and Footer should be hidden
  const hideLayoutRoutes = ['/login'];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      <ToastContainer />
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
         <Route element={<ProtectedRoute />}>
         <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/food-detection" element={<FoodDetection />} />
        <Route path="/nearbyngo" element={<NearbyNGO />} />
        <Route path="/recipe-suggestion" element={<RecipeSuggestion />} />
        <Route path="/recipes/:id" element={<RecipeDetails />} />
        </Route>
      </Routes>
      {!hideLayout && <Footer />}
    </>
  );
};

export default App;
