import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/index";

import KasirDashboard from "./pages/Kasir/index";
import KasirDashboardHome from "./pages/Kasir/Dashboard/index";
import SaleTransaction from "./pages/Kasir/Transaction/index";
import ProductView from "./pages/Kasir/Products/index";
import MemberManagements from "./pages/Kasir/Member/index";
import KasirSalesReport from "./pages/Kasir/Sales/index"

import AdminDashboard from "./pages/administrator/index";
import Dashboard from "./pages/administrator/Dashboard/index";
import UserManagement from "./pages/administrator/Users/index";
import ProductManagement from "./pages/administrator/Products/index";
import SupplierManagement from "./pages/administrator/Suppliers";
import MemberManagement from "./pages/administrator/Member/index";
import PurchaseManagement from "./pages/administrator/Purchase";
import ExpenseReport from "./pages/administrator/ExpenseReport/index";
import TransactionManagement from "./pages/administrator/Transaction/index";
import SalesManagement from "./pages/administrator/Sales/index";

import SupplierLogin from "./pages/Supplier/index"; // Login Supplier
import SupplierLayout from "./pages/Supplier/Layout/index"; // Layout Supplier
import DashboardSupplier from "./pages/Supplier/Dashboard/index"; // Dashboard Supplier
import ProductSupplier from "./pages/Supplier/Products/index"; // Produk Supplier
import CategoryManagementSupplier from "./pages/Supplier/Category/index";
import SatuanManagementSupplier from "./pages/Supplier/Satuan/index";
import ChangePassword from './pages/Supplier/ChangePassword/index'

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
              <KasirDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<KasirDashboardHome />} />
          <Route path="transaction" element={<SaleTransaction />} />
          <Route path="members" element={<MemberManagements />} />
          <Route path="products" element={<ProductView />} />
          <Route path="sales-report" element={<KasirSalesReport />} />
        </Route>

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
          <Route path="change-password" element={<ChangePassword />} />
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
          <Route path="transaction" element={<TransactionManagement />} />
          <Route path="sales" element={<SalesManagement />} />
          <Route path="members" element={<MemberManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
