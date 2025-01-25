// App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/index";
import Kasir from "./pages/Kasir/index";
import AdminDashboard from "./pages/administrator/index";
import Dashboard from "./pages/administrator/Dashboard/index";
import UserManagement from "./pages/administrator/Users/index";
import ProductManagement from "./pages/administrator/Products/index";
import CategoryManagement from "./pages/administrator/Category";
import ProtectedRoute from "./components/ProtectedRoute/index";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/kasir"
          element={
            <ProtectedRoute allowedRole="kasir">
              <Kasir />
            </ProtectedRoute>
          }
        />
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
          <Route path="category" element={<CategoryManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
