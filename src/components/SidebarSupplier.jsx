import React from "react";
import { Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import dashboardIcon from "../../public/icons/data-analysis.png";
import productIcon from "../../public/icons/quality-product.png";
import logoutIcon from "../../public/icons/log-out.png";
import categoryIcon from "../../public/icons/shapes.png";
import satuanIcon from "../../public/icons/box.png";

const SidebarSupplier = ({ onLogout }) => {
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/supplier/dashboard",
      icon: <img src={dashboardIcon} alt="dashboard" className="w-5 h-5" />,
    },
    {
      label: "Products",
      path: "/supplier/products",
      icon: <img src={productIcon} alt="products" className="w-5 h-5" />,
    },
    {
      label: "Categories",
      path: "/supplier/categories",
      icon: <img src={categoryIcon} alt="categories" className="w-5 h-5" />,
    },
    {
      label: "Satuan",
      path: "/supplier/satuan",
      icon: <img src={satuanIcon} alt="satuan" className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout(); // Jalankan fungsi logout jika dikonfirmasi
        Swal.fire({
          icon: "success",
          title: "Logout Berhasil!",
          text: "Anda telah keluar dari akun.",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  return (
    <div className="fixed left-0 top-0 h-full bg-white text-gray-700 border-r shadow-lg w-64">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Supplier Panel</h1>
      </div>

      <nav className="mt-6 px-2">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                isActive ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-6 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 text-red-600 hover:bg-gray-100 w-full rounded-lg"
        >
          <img src={logoutIcon} alt="logout" className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarSupplier;
