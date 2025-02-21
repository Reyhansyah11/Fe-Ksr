import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CombinedReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function untuk memvalidasi data
  const getSafeValue = (obj, path, defaultValue = 0) => {
    try {
      const value = path.split(".").reduce((acc, curr) => acc?.[curr], obj);
      return value ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const formatCurrency = (number) => {
    try {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(number || 0);
    } catch {
      return "Rp 0";
    }
  };

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError("Mohon isi tanggal mulai dan tanggal akhir");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      const response = await fetch(
        `http://localhost:3001/api/penjualan/combined-report?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat mengambil data");
      }

      const data = await response.json();

      if (!data?.data) {
        throw new Error("Format data tidak valid");
      }

      setReportData(data.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan data yang sudah dipaginasi
  const getPaginatedCategories = () => {
    if (!reportData?.detail_kategori)
      return { currentCategory: null, totalPages: 0 };

    const categories = Object.entries(reportData.detail_kategori);
    const totalPages = categories.length;
    const currentCategory = categories[currentPage - 1];

    return {
      currentCategory,
      totalPages,
    };
  };

  const RingkasanCard = ({ title, total, qty }) => (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="text-lg font-bold mt-2">{formatCurrency(total)}</div>
      {qty !== undefined && (
        <div className="text-sm text-gray-500 mt-1">Qty: {qty}</div>
      )}
    </div>
  );

  const renderRingkasan = () => {
    if (!reportData?.ringkasan) return null;

    const ringkasan = reportData.ringkasan;

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Ringkasan Total</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <RingkasanCard
            title="Total Pembelian"
            total={getSafeValue(ringkasan, "pembelian.total")}
            qty={getSafeValue(ringkasan, "pembelian.qty")}
          />
          <RingkasanCard
            title="Total Penjualan"
            total={getSafeValue(ringkasan, "penjualan.total")}
            qty={getSafeValue(ringkasan, "penjualan.qty")}
          />
          <RingkasanCard
            title="Persediaan Akhir"
            total={getSafeValue(ringkasan, "persediaan_akhir.total")}
            qty={getSafeValue(ringkasan, "persediaan_akhir.qty")}
          />
          <RingkasanCard
            title="Total HPP"
            total={getSafeValue(ringkasan, "hpp")}
          />
          <RingkasanCard
            title="Laba dari Penjualan"
            total={getSafeValue(ringkasan, "laba")}
          />
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-md font-semibold mb-3">
            Analisis Target Penjualan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-600">
                Selisih Pembelian-Penjualan
              </div>
              <div className="text-xl font-bold mt-1 text-red-600">
                {ringkasan.selisih_pembelian_penjualan === "-"
                  ? "Rp -"
                  : formatCurrency(
                      getSafeValue(ringkasan, "selisih_pembelian_penjualan")
                    )}
              </div>
              <div className="text-sm text-gray-500">
                Target penjualan yang perlu dicapai
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">
                Pencapaian Penjualan
              </div>
              <div className="text-xl font-bold mt-1">
                {getSafeValue(ringkasan, "persentase_pencapaian", 0)}%
              </div>
              <div className="text-sm text-gray-500">
                Dari total nilai pembelian
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Status</div>
              <div className="text-xl font-bold mt-1">
                {getSafeValue(ringkasan, "selisih_pembelian_penjualan", 0) > 0
                  ? "Belum Mencapai Target"
                  : "Target Tercapai"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductTable = (products = []) => {
    if (!Array.isArray(products) || products.length === 0) {
      return (
        <tr>
          <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
            Tidak ada data produk
          </td>
        </tr>
      );
    }

    return products.map((product, idx) => (
      <tr key={`${product.nama_produk}-${idx}`} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {product.nama_produk || "-"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
          {getSafeValue(product, "pembelian.qty")}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
          {formatCurrency(getSafeValue(product, "pembelian.total"))}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
          {formatCurrency(
            getSafeValue(product, "pembelian.harga_beli_per_dus")
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
          {getSafeValue(product, "penjualan.qty")}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
          {formatCurrency(getSafeValue(product, "penjualan.total"))}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
          {getSafeValue(product, "persediaan_akhir.qty")}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
          {formatCurrency(getSafeValue(product, "persediaan_akhir.total"))}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
          {formatCurrency(getSafeValue(product, "hpp"))}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
          {formatCurrency(getSafeValue(product, "laba"))}
        </td>
      </tr>
    ));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">
          Laporan Keuangan (HPP dan Laba/Rugi)
        </h1>

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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Report Content */}
        {reportData && (
          <>
            {renderRingkasan()}

            <div className="space-y-8">
              {(() => {
                const { currentCategory, totalPages } =
                  getPaginatedCategories();
                if (!currentCategory) return null;

                const [kategori, data] = currentCategory;

                return (
                  <div className="bg-white border rounded-lg">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold">{kategori}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-gray-600">
                            Total Pembelian:
                          </span>
                          <div className="font-semibold">
                            {formatCurrency(
                              getSafeValue(data, "pembelian.total")
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {getSafeValue(data, "pembelian.qty")}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Total Penjualan:
                          </span>
                          <div className="font-semibold">
                            {formatCurrency(
                              getSafeValue(data, "penjualan.total")
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {getSafeValue(data, "penjualan.qty")}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Total HPP:</span>
                          <div className="font-semibold">
                            {formatCurrency(getSafeValue(data, "hpp"))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Laba/Rugi:</span>
                          <div className="font-semibold">
                            {formatCurrency(getSafeValue(data, "laba"))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Produk
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Pembelian Qty
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Total Pembelian
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Harga
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Total Penjualan
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Sisa Stok
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Nilai Persediaan
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              HPP
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Laba/Rugi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {renderProductTable(data?.products)}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                      <p className="text-sm text-gray-700">
                        Menampilkan kategori {kategori}
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm text-gray-700">
                          Halaman {currentPage} dari {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !reportData && !error && (
          <div className="text-center py-8 text-gray-500">
            Pilih rentang tanggal dan klik "Tampilkan Laporan" untuk melihat
            data
          </div>
        )}
      </div>
    </div>
  );
};

export default CombinedReport;
