import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { getSupplierProducts } from "../../../../services/purchaseService";
import { getSuppliers } from "../../../../services/supplierService";
import Swal from "sweetalert2";

const PurchaseForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    tanggal_pembelian: new Date().toISOString().split("T")[0],
    supplier_id: "",
    products: [],
    bayar: 0,
  });

  const [suppliers, setSuppliers] = useState([]);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [change, setChange] = useState(0);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await getSuppliers();
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchSupplierProducts = async (supplierId) => {
    try {
      const response = await getSupplierProducts(supplierId);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching supplier products:", error);
    }
  };

  const handleSupplierChange = (supplierId) => {
    setFormData((prev) => ({
      ...prev,
      supplier_id: parseInt(supplierId),
      products: [],
    }));
    setCart([]);
    if (supplierId) {
      fetchSupplierProducts(supplierId);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(
      (item) => item.product_id === product.product_id
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, jumlah_product: item.jumlah_product + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.product_id,
          product_name: product.product_name,
          jumlah_product: 1,
          isi: product.isi,
          satuan_name: product.satuan?.satuan_name,
          harga_beli: product.harga_beli,
        },
      ]);
    }
  };

  const updateQuantity = (productId, qty) => {
    if (qty < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.product_id === productId
          ? { ...item, jumlah_product: parseInt(qty) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  useEffect(() => {
    calculateTotals();
  }, [cart, formData.bayar]);

  const calculateTotals = () => {
    const newTotal = cart.reduce(
      (sum, item) => sum + item.harga_beli * item.jumlah_product,
      0
    );
    setTotal(newTotal);
    setChange(Math.max(0, formData.bayar - newTotal));
  };

  const handlePaymentChange = (value) => {
    setFormData((prev) => ({ ...prev, bayar: parseInt(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cart.length) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Keranjang kosong!",
      });
      return;
    }

    if (formData.bayar < total) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Pembayaran kurang!",
      });
      return;
    }

    const submissionData = {
      ...formData,
      products: cart.map((item) => ({
        product_id: item.product_id,
        jumlah_product: item.jumlah_product,
      })),
    };

    try {
      const response = await onSubmit(submissionData);
      if (response?.status === "success") {
        setCart([]);
        setFormData({
          tanggal_pembelian: new Date().toISOString().split("T")[0],
          supplier_id: "",
          products: [],
          bayar: 0,
        });
      }
    } catch (error) {
      console.error("Error submitting purchase:", error);
    }
  };

  return (
    <div className="p-4 grid grid-cols-12 gap-4">
      {/* Header Section */}
      <div className="col-span-12 bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Tanggal Pembelian
          </label>
          <input
            type="date"
            value={formData.tanggal_pembelian}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                tanggal_pembelian: e.target.value,
              }))
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Supplier</label>
          <select
            value={formData.supplier_id}
            onChange={(e) => handleSupplierChange(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Pilih Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.supplier_id} value={supplier.supplier_id}>
                {supplier.supplier_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="col-span-8 bg-white rounded-lg shadow">
        <div className="p-4">
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded"
            />
          </div>

          <div
            className="grid grid-cols-3 gap-4"
            style={{
              maxHeight: "350px", // Tinggi untuk sekitar 9 produk
              overflowY: "auto", // Tambahkan scroll vertikal
              paddingRight: "10px", // Sedikit padding agar scrollbar tidak menutupi konten
            }}
          >
            {products
              .filter((product) =>
                product.product_name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((product) => (
                <div
                  key={product.product_id}
                  onClick={() => addToCart(product)}
                  className="p-4 border rounded cursor-pointer hover:bg-gray-50"
                >
                  <h3 className="font-bold truncate">{product.product_name}</h3>
                  <p className="text-sm">
                    Harga: Rp{product.harga_beli.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Isi: {product.isi} {product.satuan?.satuan_name}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="col-span-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Detail Pembelian</h2>

          <div
            className="mb-4"
            style={{
              maxHeight: "180px", // Sesuaikan tinggi sesuai kebutuhan
              overflowY: "auto",
              paddingRight: "10px",
            }}
          >
            {cart.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{item.product_name}</h4>
                  <p className="text-sm">
                    @Rp{item.harga_beli.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.jumlah_product}
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
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>Rp{total.toLocaleString()}</span>
            </div>

            <input
              type="number"
              value={formData.bayar}
              onChange={(e) => handlePaymentChange(e.target.value)}
              placeholder="Jumlah Bayar"
              className="w-full p-2 border rounded"
              min={total}
            />

            <div className="flex justify-between text-green-600">
              <span>Kembalian:</span>
              <span>Rp{change.toLocaleString()}</span>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !cart.length || formData.bayar < total}
                className={`px-6 py-2 rounded text-white ${
                  loading || !cart.length || formData.bayar < total
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
    </div>
  );
};

export default PurchaseForm;
