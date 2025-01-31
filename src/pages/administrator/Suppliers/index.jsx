import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronLeft, ChevronRight, Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";
// import Select from "react-select";

function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    supplier_name: "",
    supplier_phone: "",
    supplier_address: "",
    password: "", // Tambahkan field password karena dibutuhkan di backend
  });
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(response.data.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengambil data supplier",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Di dalam component:
  // const productOptions = products.map((product) => ({
  //   value: product.product_id,
  //   label: `${product.product_name} - ${product.category_name} (${product.satuan_name})`,
  // }));

  // Update handleInputChange
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (editingSupplier) {
        await axios.put(
          `http://localhost:3001/api/suppliers/${editingSupplier.supplier_id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Supplier berhasil diperbarui",
          showConfirmButton: false,
          timer: 1500,
        });
        setEditingSupplier(null);
      } else {
        await axios.post("http://localhost:3001/api/suppliers", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Supplier berhasil ditambahkan",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      setFormData({
        supplier_name: "",
        supplier_phone: "",
        supplier_address: "",
        product_ids: [],
      });
      fetchSuppliers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3001/api/suppliers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Supplier berhasil dihapus",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchSuppliers();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal menghapus supplier",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Manajemen Supplier
        </h2>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            {editingSupplier ? "Edit Supplier" : "Tambah Supplier Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Nama Supplier
                </label>
                <input
                  type="text"
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  No. Telepon
                </label>
                <input
                  type="text"
                  name="supplier_phone"
                  value={formData.supplier_phone}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Alamat
                </label>
                <input
                  type="text"
                  name="supplier_address"
                  value={formData.supplier_address}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingSupplier} // Password hanya required saat create baru
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading
                  ? "Menyimpan..."
                  : "Tambah Supplier"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Nama Supplier
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    No. Telepon
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Alamat
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedSuppliers.map((supplier) => (
                  <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {supplier.supplier_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {supplier.supplier_phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {supplier.supplier_address}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(supplier.supplier_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-700">
              Menampilkan {startIndex + 1} -{" "}
              {Math.min(startIndex + itemsPerPage, filteredSuppliers.length)}{" "}
              dari {filteredSuppliers.length} supplier
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
    </div>
  );
}

export default SupplierManagement;
