import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const adminToken = localStorage.getItem("admin_token");
  const kasirToken = localStorage.getItem("kasir_token");
  const supplierToken = localStorage.getItem("supplier_token");
  
  const adminAccessLevel = localStorage.getItem("admin_access_level");
  const kasirAccessLevel = localStorage.getItem("kasir_access_level");

  // Pilih token dan access level yang sesuai berdasarkan role
  let token, accessLevel;
  
  if (allowedRole === "administrator") {
    token = adminToken;
    accessLevel = adminAccessLevel;
  } else if (allowedRole === "kasir") {
    token = kasirToken;
    accessLevel = kasirAccessLevel;
  } else if (allowedRole === "supplier") {
    token = supplierToken;
  }

  // Periksa apakah token ada (user sudah login)
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Periksa apakah user memiliki akses ke role tertentu
  if (allowedRole === "supplier") {
    if (!supplierToken) {
      return <Navigate to="/" replace />;
    }
  } else {
    if (accessLevel !== allowedRole) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return children || <Outlet />;
};

export default ProtectedRoute;