import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const ProtectedRoute = () => {
  const { user, idToken } = useContext(AppContext);

  // You can customize the logic below
  const isAuthenticated = user && idToken;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
