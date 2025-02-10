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
import TransactionIcon from "../../../../public/icons/transaction.png";
import SalesIcon from "../../../../public/icons/documents.png";
import memberIcon from "../../../../public/icons/membership.png";
import ProductIcon from "../../../../public/icons/features.png";
import { Link } from "react-router-dom";

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

function KasirDashboardHome() {
  const [stats, setStats] = useState({
    totalTransaksi: 0,
    totalPenjualan: 0,
    totalProducts: 0,
    totalMembers: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const kasirToken = localStorage.getItem("kasir_token");
        const [productsRes, salesRes, membersRes] = await Promise.all([
          axios.get("http://localhost:3001/api/products/toko", {
            headers: { Authorization: `Bearer ${kasirToken}` },
          }),
          axios.get("http://localhost:3001/api/penjualan/kasir/daily-sales", {
            headers: { Authorization: `Bearer ${kasirToken}` },
          }),
          axios.get("http://localhost:3001/api/pelanggan", {
            headers: { Authorization: `Bearer ${kasirToken}` },
          }),
        ]);

        const members = membersRes.data.data.filter(
          (pelanggan) => pelanggan.is_member
        );
        const recentMembersList = members
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        setRecentMembers(recentMembersList);

        // Format sales data
        const sales = salesRes.data.data.sales || [];
        const summary = salesRes.data.data.summary || {};

        const formattedSales = sales.map((sale) => ({
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

        setStats({
          totalTransaksi: sales.length,
          totalPenjualan: summary.totalPenjualan || 0,
          totalProducts: productsRes.data.data.length,
          totalMembers: members.length,
        });

        setSalesData(formattedSales);
        setRecentTransactions(sales.slice(0, 2));
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      title: "Total Transaksi",
      value: stats.totalTransaksi,
      bgColor: "bg-blue-500",
      icon: (
        <img
          src={TransactionIcon}
          alt="transaction"
          className="w-[45px] h-auto"
        />
      ),
    },
    {
      title: "Total Pendapatan",
      value: formatToRupiah(stats.totalPenjualan),
      bgColor: "bg-green-500",
      icon: <img src={SalesIcon} alt="sales" className="w-[45px] h-auto" />,
    },
    {
      title: "Total Produk",
      value: stats.totalProducts,
      bgColor: "bg-yellow-300",
      icon: (
        <img src={ProductIcon} alt="products" className="w-[45px] h-auto" />
      ),
    },
    {
      title: "Total Member",
      value: stats.totalMembers,
      bgColor: "bg-pink-500",
      icon: <img src={memberIcon} alt="member" className="w-[45px] h-auto" />,
    },
  ];

  const quickActions = [
    {
      title: "Manage Members",
      description: "Manage member accounts",
      link: "/administrator/members",
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
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Kasir</h2>

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
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Grafik Penjualan Hari Ini
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
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
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl h-[450px] shadow-md p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Transaksi Terbaru
          </h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.penjualan_id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {transaction.no_faktur}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.pelanggan
                          ? `${transaction.pelanggan.nama_pelanggan} ${
                              transaction.pelanggan.is_member ? "(Member)" : ""
                            }`
                          : "Umum"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">
                        {formatToRupiah(transaction.total_akhir)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          transaction.tanggal_penjualan
                        ).toLocaleTimeString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Produk:</p>
                    <ul className="list-disc list-inside">
                      {transaction.details.map((detail, idx) => (
                        <li key={idx}>
                          {detail.product.product_name} ({detail.qty})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-gray-500 text-center">
                  Belum ada data transaksi hari ini
                </p>
              </div>
            )}
          </div>
          <Link
            to="/administrator/transactions"
            className="block mt-4 text-center text-blue-600 hover:text-blue-800"
          >
            Lihat Semua Transaksi
          </Link>
        </div>
      </div>
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
                <p className="text-sm text-gray-500">ID: {member.member_id}</p>
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
    </div>
  );
}

export default KasirDashboardHome;
