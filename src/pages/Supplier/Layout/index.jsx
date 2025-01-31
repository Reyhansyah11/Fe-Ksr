import React from "react";
import { Outlet } from "react-router-dom";
import SidebarSupplier from "../../../components/SidebarSupplier";

const SupplierLayout = ({ onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("supplier_name");
    localStorage.removeItem("supplier_id");
    window.location.href = "/supplier";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarSupplier onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-6 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default SupplierLayout;
