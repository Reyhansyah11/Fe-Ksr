import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import InvoiceModal from "./components/InvoiceModal";

const SaleTransaction = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customer, setCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [payment, setPayment] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [change, setChange] = useState(0);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchSalesHistory();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [cart, customer]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/products/toko",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("kasir_token")}`,
          },
        }
      );
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error("Gagal mengambil data produk");
      setProducts([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/pelanggan", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("kasir_token")}`,
        },
      });
      setCustomers(response.data.data || []);
    } catch (error) {
      toast.error("Gagal mengambil data pelanggan");
      setCustomers([]);
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/penjualan/kasir/history",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("kasir_token")}`,
          },
        }
      );
      setSalesHistory(response.data.data || []);
    } catch (error) {
      toast.error("Gagal mengambil riwayat penjualan");
      setSalesHistory([]);
    }
  };

  const calculateTotals = () => {
    const newSubtotal = cart.reduce(
      (sum, item) => sum + item.qty * item.harga_jual,
      0
    );
    setSubtotal(newSubtotal);

    let discountRate = 0;
    if (customer?.is_member) {
      if (newSubtotal >= 1000000) discountRate = 0.1;
      else if (newSubtotal >= 300000) discountRate = 0.05;
      else if (newSubtotal >= 150000) discountRate = 0.02;
    }
    setDiscount(discountRate);

    const newTotal = newSubtotal * (1 - discountRate);
    setTotal(newTotal);
    setChange(Math.max(0, payment - newTotal));
  };

  const handlePaymentChange = (value) => {
    setPayment(value);
    setChange(Math.max(0, value - total));
  };

  const addToCart = (product) => {
    if (product.stok === 0) {
      toast.error("Stok habis!");
      return;
    }

    const existingItem = cart.find(
      (item) => item.product_id === product.product_id
    );
    if (existingItem) {
      if (existingItem.qty >= product.stok) {
        toast.error("Stok tidak mencukupi!");
        return;
      }
      setCart(
        cart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1, product: product.product }]);
    }
  };

  const updateQuantity = (productId, qty) => {
    const product = products.find((p) => p.product_id === productId);
    if (qty > product.stok) {
      toast.error("Stok tidak mencukupi!");
      return;
    }
    if (qty < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.product_id === productId ? { ...item, qty: parseInt(qty) } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const handleSubmit = async () => {
    if (!cart.length) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Keranjang kosong!",
      });
      return;
    }
    if (payment < total) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Pembayaran kurang!",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:3001/api/penjualan",
        {
          pelanggan_id: customer?.pelanggan_id,
          products: cart.map((item) => ({
            product_id: item.product_id,
            qty: item.qty,
          })),
          bayar: parseInt(payment),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("kasir_token")}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Transaksi Berhasil",
        text: "Penjualan telah berhasil dicatat",
        showConfirmButton: false,
        timer: 1500,
      });

      setCart([]);
      setCustomer(null);
      setPayment(0);
      fetchProducts();
      fetchSalesHistory();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Gagal memproses transaksi",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mengelompokkan data penjualan berdasarkan no_faktur
  const groupedSales = salesHistory.map((sale) => ({
    ...sale,
    total_amount: sale.details.reduce(
      (sum, detail) => sum + detail.qty * detail.harga_jual,
      0
    ),
  }));

  // Pagination untuk data yang dikelompokkan
  const totalPages = Math.ceil(groupedSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = groupedSales.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Fungsi untuk mencari member berdasarkan ID
  const searchMember = (searchTerm) => {
    setMemberSearchTerm(searchTerm);
    if (!searchTerm) {
      setFilteredCustomers([]);
      return;
    }
    const filtered = customers.filter(
      (c) =>
        c.is_member &&
        (c.member_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.nama_pelanggan.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCustomers(filtered);
  };

  // Fungsi untuk memilih member
  const selectMember = (selectedCustomer) => {
    setCustomer(selectedCustomer);
    setMemberSearchTerm("");
    setFilteredCustomers([]);
  };

  // Fungsi untuk membersihkan pilihan member
  const clearMemberSelection = () => {
    setCustomer(null);
    setMemberSearchTerm("");
    setFilteredCustomers([]);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="p-4 grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-white rounded-lg shadow">
          <div className="p-4">
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full p-2 border rounded mb-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div
              className="grid grid-cols-3 gap-4"
              style={{
                maxHeight: "350px", // Tinggi untuk sekitar 9 produk
                overflowY: "auto", // Tambahkan scroll vertikal
                paddingRight: "10px", // Sedikit padding agar scrollbar tidak menutupi konten
              }}
            >
              {products
                .filter((p) =>
                  p?.product?.product_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <h3 className="font-bold truncate">
                      {product.product?.product_name}
                    </h3>
                    <div className="text-sm mt-1">
                      <p>
                        Stok:{" "}
                        <span
                          className={product.stok === 0 ? "text-red-500" : ""}
                        >
                          {product.stok}
                        </span>
                      </p>
                      <p>Harga: Rp{product.harga_jual.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-2 sticky top-0 bg-white z-10">
              Detail Transaksi
            </h2>

            <div
              className="mb-4"
              style={{
                maxHeight: "180px", // Sesuaikan tinggi sesuai kebutuhan
                overflowY: "auto",
                paddingRight: "10px",
              }}
            >
              {/* Member Search Section */}
              <div className="mb-4">
                {!customer ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={memberSearchTerm}
                        onChange={(e) => searchMember(e.target.value)}
                        placeholder="Cari ID Member"
                        className="w-full p-2 border rounded text-sm"
                      />
                      {memberSearchTerm && (
                        <button
                          onClick={() => setMemberSearchTerm("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {filteredCustomers.length > 0 && (
                      <div className="border rounded max-h-40 overflow-y-auto">
                        {filteredCustomers.map((c) => (
                          <div
                            key={c.pelanggan_id}
                            onClick={() => selectMember(c)}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          >
                            <div className="text-sm font-medium">
                              {c.nama_pelanggan}
                            </div>
                            <div className="text-xs text-gray-600">
                              ID: {c.member_id}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {memberSearchTerm && filteredCustomers.length === 0 && (
                      <div className="text-sm text-red-500 text-center p-2">
                        Member tidak ditemukan
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border rounded p-2 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">
                          {customer.nama_pelanggan}
                        </div>
                        <div className="text-xs text-gray-600">
                          ID: {customer.member_id}
                        </div>
                      </div>
                      <button
                        onClick={clearMemberSelection}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {(cart || []).map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between p-1 border rounded"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.product?.product_name}
                      </h4>
                      <p className="text-xs">
                        @Rp{item.harga_jual.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          updateQuantity(item.product_id, e.target.value)
                        }
                        className="w-12 p-1 border rounded text-center text-sm"
                        min="1"
                      />
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>Rp{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Diskon Member:</span>
                  <span>{discount * 100}%</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm">
                <span>Total:</span>
                <span>Rp{total.toLocaleString()}</span>
              </div>
              <input
                type="number"
                value={payment}
                onChange={(e) =>
                  handlePaymentChange(parseFloat(e.target.value))
                }
                placeholder="Jumlah Bayar"
                className="w-full p-1 border rounded text-sm"
              />
              <div className="flex justify-between text-green-600 text-sm">
                <span>Kembalian:</span>
                <span>Rp{change.toLocaleString()}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !cart.length || payment < total}
                className={`w-full p-2 rounded text-white text-sm ${
                  loading || !cart.length || payment < total
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Memproses..." : "Proses Transaksi"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Riwayat Penjualan</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No. Faktur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSales.map((sale, index) => (
                <tr key={sale.no_faktur}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.no_faktur}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.pelanggan ? sale.pelanggan.nama_pelanggan : "Umum"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.tanggal_penjualan).toLocaleDateString(
                      "id-ID"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => {
                        setSelectedSale(sale);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {startIndex + 1} -{" "}
            {Math.min(startIndex + itemsPerPage, groupedSales.length)} dari{" "}
            {groupedSales.length} penjualan
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Penjualan */}
      {showDetailModal && selectedSale && (
        <InvoiceModal
          showDetailModal={showDetailModal}
          selectedSale={selectedSale}
          setSelectedSale={setSelectedSale}
          setShowDetailModal={setShowDetailModal}
        />
      )}
    </div>
  );
};

export default SaleTransaction;
