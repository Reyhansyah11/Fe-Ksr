// src/pages/administrator/Products/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [satuans, setSatuans] = useState([]);
  const [formData, setFormData] = useState({
    product_name: "",
    category_id: "",
    satuan_id: "",
    isi: 1,
    harga_beli: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [productsRes, satuanRes, categoryRes] = await Promise.all([
          axios.get("http://localhost:3000/api/products", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/satuan", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProducts(productsRes.data.data);
        setSatuans(satuanRes.data.data);
        setCategories(categoryRes.data.data);
      } catch (error) {
        setError("Gagal mengambil data");
      }
    };
    fetchData();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.data);
    } catch (error) {
      setError("Gagal mengambil data produk");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/products", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Produk berhasil ditambahkan");
      setFormData({
        product_name: "",
        category_id: "",
        satuan_id: "",
        isi: 1,
        harga_beli: "",
      });
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.message || "Gagal menambahkan produk");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
      } catch (error) {
        setError("Gagal menghapus produk");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manajemen Produk</h2>

      {/* Form Tambah Produk */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Tambah Produk Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="product_name"
              placeholder="Nama Produk"
              value={formData.product_name}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            />
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
            <select
              name="satuan_id"
              value={formData.satuan_id}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Pilih Satuan</option>
              {satuans.map((satuan) => (
                <option key={satuan.satuan_id} value={satuan.satuan_id}>
                  {satuan.satuan_name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="isi"
              placeholder="Isi"
              value={formData.isi}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
              min="1"
            />
            <input
              type="number"
              name="harga_beli"
              placeholder="Harga Beli"
              value={formData.harga_beli}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tambah Produk
          </button>
        </form>
      </div>

      {/* Tabel Produk */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Nama Produk</th>
              <th className="px-4 py-2 text-left">Kategori</th>
              <th className="px-4 py-2 text-left">Satuan</th>
              <th className="px-4 py-2 text-left">Isi</th>
              <th className="px-4 py-2 text-left">Harga Beli</th>
              <th className="px-4 py-2 text-left">Harga Jual</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.product_id}>
                <td className="px-4 py-2">{product.product_name}</td>
                <td className="px-4 py-2">{product.category_name}</td>
                <td className="px-4 py-2">{product.satuan_name}</td>
                <td className="px-4 py-2">{product.isi}</td>
                <td className="px-4 py-2">{product.harga_beli}</td>
                <td className="px-4 py-2">{product.harga_jual}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(product.product_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductManagement;
