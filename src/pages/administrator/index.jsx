import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import categoryIcon from "../../../public/icons/shapes.png";
import productIcon from "../../../public/icons/quality-product.png";
import userIcon from "../../../public/icons/group.png";
import dashboardIcon from "../../../public/icons/data-analysis.png";
import supplierIcon from "../../../public/icons/supplier.png";
import purchaseIcon from "../../../public/icons/shopping-basket.png";
import ExpenseReportIcon from "../../../public/icons/documents.png";
import TransactionIcon from "../../../public/icons/transaction.png";
import SalesIcon from "../../../public/icons/business-growth.png";
import MemberIcon from "../../../public/icons/member-card.png";
import logoutIcon from "../../../public/icons/logout.png";
import reportSales from "../../../public/icons/forecast.png";
import CombineReportIcon from '../../../public/icons/data-analysis (1).png';
import CashierLogo from "../../../public/icons/Smart Casier Rev.png"
import CashierLogoClose from "../../../public/icons/Smart rev.png"

function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const dashboardMenu = [
    {
      label: "Dashboard",
      path: "/administrator",
      icon: (
        <img src={dashboardIcon} alt="dashboard" className="w-auto h-[20px]" />
      ),
    },
  ];

  const masterMenu = [
    {
      label: "Suppliers",
      path: "/administrator/suppliers",
      icon: (
        <img src={supplierIcon} alt="supplier" className="w-auto h-[20px]" />
      ),
    },
    {
      label: "Users",
      path: "/administrator/users",
      icon: <img src={userIcon} alt="user" className="w-auto h-[20px]" />,
    },
    {
      label: "Products",
      path: "/administrator/products",
      icon: <img src={productIcon} alt="product" className="w-auto h-[20px]" />,
    },
    {
      label: "Members",
      path: "/administrator/members",
      icon: <img src={MemberIcon} alt="member" className="w-auto h-[20px]" />,
    },
  ];

  const transactionMenu = [
    {
      label: "Purchaser",
      path: "/administrator/purchase",
      icon: (
        <img src={purchaseIcon} alt="purchase" className="w-auto h-[20px]" />
      ),
    },
    {
      label: "Sale",
      path: "/administrator/transaction",
      icon: (
        <img
          src={TransactionIcon}
          alt="transaction"
          className="w-auto h-[20px]"
        />
      ),
    },
    {
      label: "Purchase Report",
      path: "/administrator/expense-report",
      icon: (
        <img
          src={ExpenseReportIcon}
          alt="expense-report"
          className="w-auto h-[20px]"
        />
      ),
    },
    {
      label: "Sales Report",
      path: "/administrator/sales",
      icon: <img src={SalesIcon} alt="sales" className="w-auto h-[20px]" />,
    },
    // {
    //   label: "Report Sales",
    //   path: "/administrator/profit-loss-report",
    //   icon: (
    //     <img src={reportSales} alt="profit-loss-report" className="w-auto h-[20px]" />
    //   ),
    // },
    {
      label: "Financial Report",
      path: "/administrator/combined-report",
      icon: (
        <img src={CombineReportIcon} alt="combined-report" className="w-auto h-[20px]" />
      ),
    },
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Apakah anda yakin?",
      text: "Anda akan keluar dari sistem!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Logout!",
      cancelButtonText: "Batal",
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch("http://localhost:3001/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) {
          // Hapus hanya data admin
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_access_level");
          localStorage.removeItem("admin_toko_id");
          localStorage.removeItem("admin_user_id");
          localStorage.removeItem("admin_user_name");
  
          Swal.fire(
            "Berhasil!",
            "Anda telah keluar dari sistem.",
            "success"
          ).then(() => {
            navigate("/");
          });
        } else {
          Swal.fire("Gagal!", "Terjadi kesalahan saat logout.", "error");
        }
      } catch (error) {
        Swal.fire("Error!", "Terjadi kesalahan pada sistem.", "error");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white text-gray-700 border-r shadow-lg transition-all duration-300 flex flex-col ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex lg:items-center items-start lg:justify-between lg:p-4 border-b">
          {/* Sidebar Logo */}
          <img
            src={isSidebarOpen ? CashierLogo : CashierLogoClose}
            alt="sales"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`w-[auto] h-[13px] lg:w-auto lg:h-[43px] cursor-pointer ${
              isSidebarOpen ? "" : "mx-auto"
            }`}
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <style jsx>{`
            ::-webkit-scrollbar {
              width: 3px;
            }
            ::-webkit-scrollbar-track {
              background: transparent;
            }
            ::-webkit-scrollbar-thumb {
              background-color: #e5e7eb;
              border-radius: 20px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background-color: #d1d5db;
            }
          `}</style>

          {/* Dashboard Section */}
          <nav className="mt-6 px-2">
            <p
              className={`text-xs font-semibold text-gray-400 ml-4 uppercase ${
                isSidebarOpen ? "block" : "hidden"
              }`}
            >
              Dashboard
            </p>
            {dashboardMenu.map((item, index) => {
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
                  <span
                    className={`${
                      isSidebarOpen ? "block" : "hidden"
                    } font-medium`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <hr className="border-t border-gray-300 my-4 mx-4" />

          {/* Master Section */}
          <nav className="px-2">
            <p
              className={`text-xs font-semibold text-gray-400 ml-4 uppercase ${
                isSidebarOpen ? "block" : "hidden"
              }`}
            >
              Master Data
            </p>
            {masterMenu.map((item, index) => {
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
                  <span
                    className={`${
                      isSidebarOpen ? "block" : "hidden"
                    } font-medium`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <hr className="border-t border-gray-300 my-4 mx-4" />

          {/* Transaction Section */}
          <nav className="px-2">
            <p
              className={`text-xs font-semibold text-gray-400 ml-4 uppercase ${
                isSidebarOpen ? "block" : "hidden"
              }`}
            >
              Transaksi
            </p>
            {transactionMenu.map((item, index) => {
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
                  <span
                    className={`${
                      isSidebarOpen ? "block" : "hidden"
                    } font-medium`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info */}
        <div
          className={`p-6 border-t bg-white ${
            isSidebarOpen ? "block" : "flex justify-center items-center"
          }`}
        >
          {isSidebarOpen ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  👤
                </div>
                <div>
                  <p className="font-medium text-gray-800">Admin</p>
                  <p className="text-sm text-gray-500">administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <img src={logoutIcon} alt="logout" className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img src={logoutIcon} alt="logout" className="w-auto h-[25px]" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboard;
