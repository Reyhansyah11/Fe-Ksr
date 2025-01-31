import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Link } from "react-router-dom"; // Tambahkan import ini di bagian atas

// Fungsi untuk memformat angka ke format Rupiah
const formatToRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

// Fungsi untuk memformat tanggal
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
  });
};

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSales: "$0",
    activeProducts: 0,
    monthlyRevenue: "$0",
  });
  const [weeklyExpenses, setWeeklyExpenses] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const [usersRes, productsRes, suppliersRes, expensesRes] =
          await Promise.all([
            axios.get("http://localhost:3001/api/auth/kasirUsers", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:3001/api/products/toko", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:3001/api/suppliers", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:3001/api/pembelian/weekly-expenses", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setStats((prev) => ({
          ...prev,
          totalUsers: usersRes.data.users.length,
          activeProducts: productsRes.data.data.length,
          totalSuppliers: suppliersRes.data.data.length,
        }));

        // Format data pengeluaran
        const formattedExpenses = expensesRes.data.data.map((item) => ({
          ...item,
          tanggal: formatDate(item.tanggal),
          total_pengeluaran_formatted: formatToRupiah(item.total_pengeluaran),
        }));

        setWeeklyExpenses(formattedExpenses);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      bgColor: "bg-blue-500",
      icon: "👥",
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      bgColor: "bg-purple-500",
      icon: "📦",
    },
    {
      title: "Total Suppliers",
      value: stats.totalSuppliers,
      bgColor: "bg-green-500",
      icon: "🏭",
    },
  ];

  const quickActions = [
    {
      title: "Add New User",
      description: "Create a new cashier account",
      link: "/administrator/users",
    },
    {
      title: "Manage Suppliers",
      description: "Add or update suppliers",
      link: "/administrator/suppliers",
    },
    {
      title: "Manage Products",
      description: "Update product inventory",
      link: "/administrator/products",
    },
  ];

  // Custom Tooltip Component untuk grafik
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-sm text-gray-600">
            Total: {formatToRupiah(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Dashboard Overview
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statItems.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className={`p-4 ${stat.bgColor} text-white`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="p-4">
              <h3 className="text-gray-500 text-sm font-medium">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart and Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Pengeluaran Minggu Ini
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyExpenses}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 65,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="tanggal"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis tickFormatter={formatToRupiah} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_pengeluaran"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Total Pengeluaran"
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Quick Actions
          </h3>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Link
                to={action.link}
                key={index}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-semibold text-gray-800">{action.title}</h4>
                <p className="text-gray-500 text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
