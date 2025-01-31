import React, { useState, useEffect } from "react";

const SupplierDashboard = () => {
  const [supplierName, setSupplierName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("supplier_name");
    if (name) {
      setSupplierName(name);
    }
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Selamat Datang, {supplierName}
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Anda telah login sebagai supplier. Gunakan menu di sebelah kiri untuk mengelola produk atau melihat informasi lain.
        </p>
      </div>
    </div>
  );
};

export default SupplierDashboard;
