import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  // Tambahkan state baru untuk menyimpan riwayat penjualan
  const [salesHistory, setSalesHistory] = useState([]);

  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
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
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCustomers(response.data.data || []);
    } catch (error) {
      toast.error("Gagal mengambil data pelanggan");
      setCustomers([]);
    }
  };

  // Tambahkan fungsi untuk mengambil data riwayat penjualan
  const fetchSalesHistory = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/penjualan", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  // Pagination calculations
  // Flatten sales data dulu
  const flattenedSales = salesHistory.reduce((acc, sale) => {
    const details = sale.details.map((detail) => ({
      ...detail,
      pelanggan: sale.pelanggan,
      bayar: sale.bayar,
      tanggal_penjualan: sale.tanggal_penjualan,
    }));
    return [...acc, ...details];
  }, []);

  // Kemudian hitung pagination berdasarkan data yang sudah di-flatten
  const totalPages = Math.ceil(flattenedSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = flattenedSales.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
            <div className="grid grid-cols-3 gap-4">
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
            <h2 className="text-xl font-bold mb-4">Detail Transaksi</h2>

            <div className="mb-4">
              <select
                value={customer?.pelanggan_id || ""}
                onChange={(e) => {
                  const selected = customers.find(
                    (c) => c.pelanggan_id === parseInt(e.target.value)
                  );
                  setCustomer(selected);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Pilih Pelanggan</option>
                {(customers || []).map((c) => (
                  <option key={c.pelanggan_id} value={c.pelanggan_id}>
                    {c.nama_pelanggan} {c.is_member ? "(Member)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 mb-4">
              {(cart || []).map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {item.product?.product_name}
                    </h4>
                    <p className="text-sm">
                      @Rp{item.harga_jual.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        updateQuantity(item.product_id, e.target.value)
                      }
                      className="w-16 p-1 border rounded text-center"
                      min="1"
                    />
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon Member:</span>
                  <span>{discount * 100}%</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
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
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-between text-green-600">
                <span>Kembalian:</span>
                <span>Rp{change.toLocaleString()}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !cart.length || payment < total}
                className={`w-full p-2 rounded text-white ${
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
        <h2 className="text-xl font-bold mb-4">Detail Penjualan</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  NO
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  PELANGGAN
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  PRODUK
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  QTY
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  SUBTOTAL
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  BAYAR
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  TANGGAL
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((detail, index) => (
                <tr
                  key={`${detail.penjualan_id}-${detail.penjualan_detail_id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detail.pelanggan
                      ? detail.pelanggan.nama_pelanggan
                      : "Non-Member"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detail.product.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {detail.qty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    Rp {(detail.qty * detail.harga_jual).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    Rp {detail.bayar.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(detail.tanggal_penjualan).toLocaleDateString(
                      "id-ID"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {startIndex + 1} -{" "}
            {Math.min(startIndex + itemsPerPage, flattenedSales.length)} dari{" "}
            {flattenedSales.length} detail penjualan
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
    </div>
  );
};

export default SaleTransaction;
