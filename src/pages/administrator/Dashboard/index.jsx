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
import { Link } from "react-router-dom";
import usersIcon from "../../../../public/icons/team-management.png";
import ProductIcon from "../../../../public/icons/features.png"
import supplierIcon from "../../../../public/icons/market-penetration.png"
import memberIcon from "../../../../public/icons/membership.png"

const formatToRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
  });
};

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMembers: 0,
    activeProducts: 0,
    totalSuppliers: 0,
  });
  const [weeklyExpenses, setWeeklyExpenses] = useState([]);
  const [weeklySales, setWeeklySales] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminToken = localStorage.getItem("admin_token");
        const [
          usersRes,
          productsRes,
          suppliersRes,
          expensesRes,
          salesRes,
          membersRes,
        ] = await Promise.all([
          axios.get("http://localhost:3001/api/auth/kasirUsers", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
          axios.get("http://localhost:3001/api/products/toko", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
          axios.get("http://localhost:3001/api/suppliers", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
          axios.get("http://localhost:3001/api/pembelian/weekly-expenses", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
          axios.get("http://localhost:3001/api/penjualan/daily-sales", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
          axios.get("http://localhost:3001/api/pelanggan", {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
        ]);

        const members = membersRes.data.data.filter(
          (pelanggan) => pelanggan.is_member
        );
        const recentMembersList = members
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);

        setStats({
          totalUsers: usersRes.data.users.length,
          activeProducts: productsRes.data.data.length,
          totalSuppliers: suppliersRes.data.data.length,
          totalMembers: members.length,
        });

        setRecentMembers(recentMembersList);

        // Format expenses data
        const formattedExpenses = expensesRes.data.data.map((item) => ({
          ...item,
          tanggal: formatDate(item.tanggal),
          total_pengeluaran_formatted: formatToRupiah(item.total_pengeluaran),
        }));

        setWeeklyExpenses(formattedExpenses);

        // Format sales data
        if (salesRes.data.data.sales) {
          const salesData = salesRes.data.data.sales.map((sale) => ({
            tanggal: formatDate(sale.tanggal_penjualan),
            total_penjualan: sale.total_akhir,
            total_laba: sale.details.reduce((acc, detail) => {
              const hargaBeliPerUnit = detail.harga_beli / detail.product.isi;
              const hpp = hargaBeliPerUnit * detail.qty;
              const penjualan = detail.harga_jual * detail.qty;
              return acc + (penjualan - hpp);
            }, 0),
            total_penjualan_formatted: formatToRupiah(sale.total_akhir),
          }));

          setWeeklySales(salesData);
        }
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
      icon: <img src={usersIcon} alt="users" className="w-[45px] h-auto" />,
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      bgColor: "bg-[#fbbf24]",
      icon: <img src={ProductIcon} alt="products" className="w-[45px] h-auto" />,
    },
    {
      title: "Total Suppliers",
      value: stats.totalSuppliers,
      bgColor: "bg-green-500",
      icon: <img src={supplierIcon} alt="supplier" className="w-[45px] h-auto" />,
    },
    {
      title: "Total Members",
      value: stats.totalMembers,
      bgColor: "bg-pink-500",
      icon: <img src={memberIcon} alt="member" className="w-[45px] h-auto" />,
    },
  ];

  const quickActions = [
    {
      title: "Add New User",
      description: "Create a new cashier account",
      link: "/administrator/users",
    },
    {
      title: "Manage Members",
      description: "Manage member accounts",
      link: "/administrator/members",
    },
    {
      title: "Manage Products",
      description: "Update product inventory",
      link: "/administrator/products",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="text-sm font-semibold">{label}</p>
          {payload.map((pld, index) => (
            <p key={index} className="text-sm text-gray-600">
              {pld.name}: {formatToRupiah(pld.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Dashboard Overview
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statItems.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div
              className={`flex items-center justify-between p-4 ${stat.bgColor} text-white`}
            >
              <span className="text-3xl">{stat.icon}</span>
              <div className="text-right">
                <h3 className="text-sm font-medium">{stat.title}</h3>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Penjualan Hari Ini
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklySales}
                  margin={{ top: 5, right: 30, left: 20, bottom: 65 }}
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
                    dataKey="total_penjualan"
                    stroke="#4CAF50"
                    name="Total Penjualan"
                  />
                  <Line
                    type="monotone"
                    dataKey="total_laba"
                    stroke="#2196F3"
                    name="Total Laba"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expenses Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Pengeluaran Minggu Ini
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyExpenses}
                  margin={{ top: 5, right: 30, left: 20, bottom: 65 }}
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
                    name="Total Pengeluaran"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Members and Quick Actions */}
        <div>
          {/* Recent Members */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Member Terbaru
            </h3>
            <div className="space-y-4">
              {recentMembers.map((member) => (
                <div
                  key={member.pelanggan_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {member.nama_pelanggan}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ID: {member.member_id}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/administrator/members"
              className="block mt-4 text-center text-blue-600 hover:text-blue-800"
            >
              Lihat Semua Member
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Quick Actions
            </h3>
            <div className="grid gap-4">
              {quickActions.map((action, index) => (
                <Link
                  to={action.link}
                  key={index}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-semibold text-gray-800">
                    {action.title}
                  </h4>
                  <p className="text-gray-500 text-sm">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
