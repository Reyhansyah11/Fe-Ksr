import React, { useState } from "react";

const ProfitLossReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      const response = await fetch(
        `http://localhost:3001/api/penjualan/profit-loss-report?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      const data = await response.json();
      setReportData(data.data);
    } catch (error) {
      console.error("Error fetching report:", error);
    }
    setLoading(false);
  };

  const formatCurrency = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Card Utama */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Laporan Laba Rugi</h1>

        {/* Filter Tanggal */}
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Memuat..." : "Tampilkan Laporan"}
            </button>
          </div>
        </div>

        {reportData && (
          <>
            {/* Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm font-medium text-gray-600">
                  Total Qty Terjual
                </div>
                <div className="text-2xl font-bold mt-2">
                  {reportData.ringkasan.total_qty}
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm font-medium text-gray-600">
                  Total HPP
                </div>
                <div className="text-2xl font-bold mt-2">
                  {formatCurrency(reportData.ringkasan.total_hpp)}
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm font-medium text-gray-600">
                  Total Penjualan
                </div>
                <div className="text-2xl font-bold mt-2">
                  {formatCurrency(reportData.ringkasan.total_penjualan)}
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm font-medium text-gray-600">
                  Total Laba
                </div>
                <div className="text-2xl font-bold mt-2">
                  {formatCurrency(reportData.ringkasan.total_laba)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Margin: {reportData.ringkasan.margin_rata_rata}
                </div>
              </div>
            </div>

            {/* Tabel Detail */}
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Kategori
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Nama Produk
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                    >
                      Qty
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                    >
                      HPP
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                    >
                      Penjualan
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                    >
                      Laba
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                    >
                      Margin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.detail_produk.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.kategori}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.nama_produk}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.qty_terjual}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.total_hpp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.total_penjualan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.laba)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.margin}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfitLossReport;
