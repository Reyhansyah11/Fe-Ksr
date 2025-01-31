import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import Swal from 'sweetalert2';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    harga_jual: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/products/toko", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil data produk',
      });
    } finally {
      setIsLoading(false);
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
    if (!editingProduct) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3001/api/products/toko/${editingProduct.product_id}/price`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Harga jual berhasil diperbarui',
        showConfirmButton: false,
        timer: 1500
      });
      
      setEditingProduct(null);
      setFormData({ harga_jual: "" });
      fetchProducts();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      harga_jual: product.harga_jual,
    });
  };

  const filteredProducts = products.filter((product) =>
    product.product?.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Manajemen Produk Toko</h2>

        {/* Form Edit Harga */}
        {editingProduct && (
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Update Harga Jual
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Nama Produk</label>
                  <input
                    type="text"
                    value={editingProduct.product?.product_name}
                    className="border border-gray-300 p-2 rounded-lg w-full bg-gray-50"
                    disabled
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Harga Jual</label>
                  <input
                    type="number"
                    name="harga_jual"
                    value={formData.harga_jual}
                    onChange={handleInputChange}
                    className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({ harga_jual: "" });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Update Harga"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search dan Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Nama Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Satuan</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Stok</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Harga Jual</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((tokoProduct) => (
                  <tr key={tokoProduct.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{tokoProduct.product?.product_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{tokoProduct.product?.category?.category_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{tokoProduct.product?.satuan?.satuan_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{tokoProduct.stok}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tokoProduct.harga_jual)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(tokoProduct)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
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
              Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
}

export default ProductManagement; 

