import React, { useState, useEffect } from "react";
import {
  getProductsBySupplier,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../services/productService";
import Swal from "sweetalert2";
import { ChevronLeft, ChevronRight } from "lucide-react";
import deleteIcon from "../../../../public/icons/delete.png";
import editIcon from "../../../../public/icons/edit.png";

const ProductManagementSupplier = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [satuan, setSatuan] = useState([]);
  const [formData, setFormData] = useState({
    product_name: "",
    supplier_id: localStorage.getItem("supplier_id"),
    category_id: "",
    satuan_id: "",
    isi: "",
    harga_beli: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 5;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSatuan();
  }, []);

// Fetch Categories
const fetchCategories = async () => {
  try {
    const token = localStorage.getItem("supplier_token");
    if (!token) {
      throw new Error("Token tidak ditemukan. Silakan login.");
    }
    const response = await fetch("http://localhost:3001/api/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,  // Pastikan token ditambahkan ke header
      },
    });
    const data = await response.json();
    if (response.ok) {
      setCategories(data.data);
    } else {
      throw new Error(data.message || "Gagal memuat kategori");
    }
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
};

// Fetch Satuan
const fetchSatuan = async () => {
  try {
    const token = localStorage.getItem("supplier_token");
    if (!token) {
      throw new Error("Token tidak ditemukan. Silakan login.");
    }
    const response = await fetch("http://localhost:3001/api/satuan", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,  // Pastikan token ditambahkan ke header
      },
    });
    const data = await response.json();
    if (response.ok) {
      setSatuan(data.data);
    } else {
      throw new Error(data.message || "Gagal memuat satuan");
    }
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
};


  // Fetch Products
  const fetchProducts = async () => {
    try {
      const supplierId = localStorage.getItem("supplier_id");
      const response = await getProductsBySupplier(supplierId);
      setProducts(response.data);
    } catch (error) {
      Swal.fire("Error", "Gagal memuat produk", "error");
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
      if (editingProduct) {
        await updateProduct(editingProduct.product_id, formData);
        Swal.fire("Berhasil", "Produk berhasil diperbarui", "success");
      } else {
        await createProduct(formData);
        Swal.fire("Berhasil", "Produk berhasil ditambahkan", "success");
      }
      fetchProducts();
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan produk", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      Swal.fire("Berhasil", "Produk berhasil dihapus", "success");
      fetchProducts();
    } catch (error) {
      Swal.fire("Error", "Gagal menghapus produk", "error");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
  };

  const resetForm = () => {
    setFormData({
      product_name: "",
      supplier_id: localStorage.getItem("supplier_id"),
      category_id: "",
      satuan_id: "",
      isi: "",
      harga_beli: "",
    });
  };

  // Pagination
  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Manajemen Produk</h2>

      {/* Form Tambah Produk */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          {editingProduct ? "Edit Produk" : "Tambah Produk"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Nama Produk</label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Kategori</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Satuan</label>
              <select
                name="satuan_id"
                value={formData.satuan_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Pilih Satuan</option>
                {satuan.map((unit) => (
                  <option key={unit.satuan_id} value={unit.satuan_id}>
                    {unit.satuan_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Isi</label>
              <input
                type="number"
                name="isi"
                value={formData.isi}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Harga Beli</label>
              <input
                type="number"
                name="harga_beli"
                value={formData.harga_beli}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              {editingProduct ? "Update Produk" : "Tambah Produk"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Produk */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-700">Daftar Produk</h3>
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Nama Produk
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Isi
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Harga Beli
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentProducts.map((product) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-800">{product.product_name}</td>
                  <td className="px-6 py-4 text-gray-800">{product.category_name}</td>
                  <td className="px-6 py-4 text-gray-800">{product.isi}</td>
                  <td className="px-6 py-4 text-gray-800">{product.harga_beli}</td>
                  <td className="px-6 py-4 text-gray-800">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 mr-2"
                    >
                      <img src={editIcon} alt="edit" className="w-auto h-[30px]" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.product_id)}
                      className="text-red-600"
                    >
                      <img src={deleteIcon} alt="delete" className="w-auto h-[30px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <p className="text-sm text-gray-700">
            Menampilkan {indexOfFirstProduct + 1} -{" "}
            {Math.min(indexOfLastProduct, filteredProducts.length)} dari{" "}
            {filteredProducts.length} produk
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagementSupplier;
