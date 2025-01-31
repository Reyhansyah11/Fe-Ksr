import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/index";
import Kasir from "./pages/Kasir/index";
import AdminDashboard from "./pages/administrator/index";
import Dashboard from "./pages/administrator/Dashboard/index";
import UserManagement from "./pages/administrator/Users/index";
import ProductManagement from "./pages/administrator/Products/index";
import SupplierManagement from "./pages/administrator/Suppliers";
import PurchaseManagement from "./pages/administrator/Purchase";
import ExpenseReport from "./pages/administrator/ExpenseReport/index";

import SupplierLogin from "./pages/Supplier/index"; // Login Supplier
import SupplierLayout from "./pages/Supplier/Layout/index"; // Layout Supplier
import DashboardSupplier from "./pages/Supplier/Dashboard/index"; // Dashboard Supplier
import ProductSupplier from "./pages/Supplier/Products/index"; // Produk Supplier
import CategoryManagementSupplier from "./pages/Supplier/Category/index";
import SatuanManagementSupplier from "./pages/Supplier/Satuan/index";

import ProtectedRoute from "./components/ProtectedRoute/index";
import Forbidden from "./pages/Forbidden";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* Kasir Routes */}
        <Route
          path="/kasir"
          element={
            <ProtectedRoute allowedRole="kasir">
              <Kasir />
            </ProtectedRoute>
          }
        />

        {/* Supplier Routes */}
        <Route path="/supplier" element={<SupplierLogin />} />
        <Route
          path="/supplier"
          element={
            <ProtectedRoute allowedRole="supplier">
              <SupplierLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardSupplier />} />
          <Route path="products" element={<ProductSupplier />} />
          <Route path="categories" element={<CategoryManagementSupplier />} />
          <Route path="satuan" element={<SatuanManagementSupplier />} />
        </Route>

        {/* Administrator Routes */}
        <Route
          path="/administrator"
          element={
            <ProtectedRoute allowedRole="administrator">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="purchase" element={<PurchaseManagement />} />
          <Route path="expense-report" element={<ExpenseReport />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
