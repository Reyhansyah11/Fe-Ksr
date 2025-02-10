import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PurchaseForm from "./components/PurchaseForm";
import PurchaseList from "./components/PurchaseList";
import { getPurchases, createPurchase } from "../../../services/purchaseService";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const PurchaseManagement = () => {
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchPurchaseDetails();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, purchaseDetails]);

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPurchases();
      setPurchaseDetails(response.data);
      setFilteredDetails(response.data);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil data");
      setPurchaseDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePurchase = async (purchaseData) => {
    try {
      setLoading(true);
      const response = await createPurchase(purchaseData);

      if (response && response.status === "success") {
        Swal.fire({
          title: "Transaksi Berhasil!",
          text: `Sisa uang Anda: Rp ${response.data.sisa.toLocaleString()}`,
          icon: "success",
          confirmButtonText: "OK",
        });
        setIsFormOpen(false);
        fetchPurchaseDetails();
      } else {
        throw new Error(response?.message || "Terjadi kesalahan");
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: `Terjadi kesalahan saat memproses transaksi: ${err.message}`,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredDetails(purchaseDetails);
      return;
    }
    const filtered = purchaseDetails.filter((detail) =>
      detail.supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) //pakai detail.no_faktur untuk search by no faktur
    );
    setFilteredDetails(filtered);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredDetails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDetails = filteredDetails.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Detail Pembelian</h1>
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tambah Pembelian
            </button>
          )}
        </div>

        {isFormOpen && (
          <PurchaseForm
            onSubmit={handleCreatePurchase}
            onCancel={() => setIsFormOpen(false)}
            loading={loading}
          />
        )}

        <div className="bg-white rounded-xl shadow-sm my-5">
          <div className="p-6 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari Transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <PurchaseList purchaseDetails={paginatedDetails} loading={loading} />
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-700">
              Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredDetails.length)} dari {filteredDetails.length} pembelian
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseManagement;
