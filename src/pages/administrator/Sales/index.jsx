import React, { useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function SalesReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const printComponentRef = useRef(null);

  const exportToPDF = async () => {
    if (!printComponentRef.current) return;
    try {
      setExportLoading(true);
      const canvas = await html2canvas(printComponentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: -window.scrollY,
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight
      );
      pdf.save(`Laporan_Penjualan_${startDate}_${endDate}.pdf`);
    } catch (error) {
      alert("Gagal mengexport PDF. Silakan coba lagi.");
    } finally {
      setExportLoading(false);
    }
  };

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      alert("Mohon pilih tanggal mulai dan tanggal akhir");
      return;
    }

    try {
      setLoading(true);
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      const response = await axios.get(
        `http://localhost:3001/api/penjualan/daily-sales`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: {
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
          },
        }
      );
      setReportData(response.data.data);
    } catch (error) {
      alert("Gagal mengambil data laporan");
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  const calculateDetailHPP = (details) => {
    return details.map((detail) => ({
      ...detail,
      total_hpp: detail.qty * detail.harga_beli,
      hpp_per_unit: detail.harga_beli / detail.product.isi,
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Laporan Penjualan</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-white p-4 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>
          </div>
        </div>

        {reportData && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Hasil Laporan</h3>
              {reportData.sales?.length > 0 && (
                <button
                  onClick={exportToPDF}
                  disabled={exportLoading}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-green-300"
                >
                  {exportLoading ? "Exporting..." : "Export PDF"}
                </button>
              )}
            </div>

            <div ref={printComponentRef} className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">Laporan Penjualan</h3>
                <p className="text-gray-600">
                  Periode:{" "}
                  {new Date(startDate).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })}{" "}
                  -
                  {new Date(endDate).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })}
                </p>
              </div>

              {reportData.sales?.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full mb-4">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Tanggal</th>
                          <th className="px-4 py-2 text-left">Kasir</th>
                          <th className="px-4 py-2 text-left">Pelanggan</th>
                          <th className="px-4 py-2 text-left">Produk</th>
                          <th className="px-4 py-2 text-left">Detail HPP</th>
                          <th className="px-4 py-2 text-right">Subtotal</th>
                          <th className="px-4 py-2 text-right">Diskon</th>
                          <th className="px-4 py-2 text-right">Total Akhir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.sales.map((sale) => (
                          <tr key={sale.penjualan_id} className="border-b">
                            <td className="px-4 py-2">
                              {new Date(
                                sale.tanggal_penjualan
                              ).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-4 py-2">
                              {sale.user.nama_lengkap}
                            </td>
                            <td className="px-4 py-2">
                              {sale.pelanggan
                                ? `${sale.pelanggan.nama_pelanggan} ${
                                    sale.pelanggan.is_member ? "(Member)" : ""
                                  }`
                                : "Umum"}
                            </td>
                            <td className="px-4 py-2">
                              <div className="space-y-1">
                                {sale.details.map((detail, idx) => (
                                  <div key={idx} className="text-sm">
                                    <div className="font-medium">
                                      {detail.product.product_name}
                                    </div>
                                    <div className="text-gray-600 ml-2">
                                      Qty: {detail.qty}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <div className="space-y-1">
                                {sale.details.map((detail, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-gray-500"
                                  >
                                    HPP/Unit:{" "}
                                    {formatRupiah(
                                      detail.harga_beli / detail.product.isi
                                    )}
                                    <div className="text-xs text-gray-500">
                                      (Harga Beli:{" "}
                                      {formatRupiah(detail.harga_beli)} / Isi:{" "}
                                      {detail.product.isi})
                                    </div>
                                  </div>
                                ))}
                                <div className="mt-1 pt-1 border-t text-sm font-semibold">
                                  Total:{" "}
                                  {formatRupiah(
                                    sale.details.reduce(
                                      (acc, detail) =>
                                        acc +
                                        detail.qty *
                                          (detail.harga_beli /
                                            detail.product.isi),
                                      0
                                    )
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right">
                              {formatRupiah(sale.total)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {sale.diskon * 100}%
                            </td>
                            <td className="px-4 py-2 text-right">
                              {formatRupiah(sale.total_akhir)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-bold bg-gray-50">
                          <td colSpan={7} className="px-4 py-2 text-right">
                            Total Penjualan:
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatRupiah(reportData.summary.totalPenjualan)}
                          </td>
                        </tr>
                        <tr className="font-bold bg-gray-50">
                          <td colSpan={7} className="px-4 py-2 text-right">
                            Total HPP:
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatRupiah(reportData.summary.totalHPP)}
                          </td>
                        </tr>
                        <tr className="font-bold bg-gray-50 text-green-600">
                          <td colSpan={7} className="px-4 py-2 text-right">
                            Total Laba:
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatRupiah(reportData.summary.totalLaba)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Total Transaksi: {reportData.sales.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Qty Terjual: {reportData.summary.totalQty}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data penjualan untuk periode ini
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesReport;
