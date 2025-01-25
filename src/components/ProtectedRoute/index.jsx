import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const accessLevel = localStorage.getItem("access_level");

  // Periksa apakah user memiliki akses
  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && accessLevel !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
