import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const adminKasirToken = localStorage.getItem("token");
  const supplierToken = localStorage.getItem("supplier_token");
  const accessLevel = localStorage.getItem("access_level");

   // Pilih token yang sesuai
   const token = allowedRole === "supplier" ? supplierToken : adminKasirToken;

  // Periksa apakah token ada (user sudah login)
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Periksa apakah user memiliki akses ke role tertentu
  if (allowedRole && accessLevel !== allowedRole && allowedRole !== "supplier") {
    return <Navigate to="/forbidden" replace />;
  }

  // Jika semua validasi lolos, tampilkan children atau Outlet
  return children || <Outlet />;
};

export default ProtectedRoute;
