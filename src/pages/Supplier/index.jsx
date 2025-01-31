import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const SupplierLogin = () => {
  const [formData, setFormData] = useState({ supplier_name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post("http://localhost:3001/api/auth/login/supplier", formData);
  
      if (response.data && response.data.token) {
        // Simpan token supplier
        localStorage.setItem("supplier_token", response.data.token);
        localStorage.setItem("supplier_id", response.data.supplier.id);
        localStorage.setItem("supplier_name", response.data.supplier.name);
  
        Swal.fire({
          title: "Login Berhasil",
          text: `Selamat datang, ${response.data.supplier.name}!`,
          icon: "success",
        });
  
        // Redirect ke dashboard supplier
        navigate("/supplier/dashboard");
      }
    } catch (error) {
      Swal.fire({
        title: "Login Gagal",
        text: error.response?.data?.error || "Terjadi kesalahan.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-xl font-bold mb-4 text-center">Login Supplier</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Supplier</label>
            <input
              type="text"
              name="supplier_name"
              value={formData.supplier_name}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupplierLogin;
