import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import deleteIcon from "../../../../public/icons/delete.png";
import editIcon from "../../../../public/icons/edit.png";

const CategoryManagementSupplier = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ category_name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editCategoryId, setEditCategoryId] = useState(null);  // Menyimpan ID kategori yang sedang diedit
  const categoriesPerPage = 5;

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Categories Data
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("supplier_token");
      const response = await axios.get("http://localhost:3001/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data);
    } catch (error) {
      Swal.fire("Error", "Gagal memuat kategori", "error");
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle add new category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("supplier_token");
      await axios.post("http://localhost:3001/api/categories", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Kategori berhasil ditambahkan", "success");
      setFormData({ category_name: "" });
      fetchCategories();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Gagal menambah kategori", "error");
    }
  };

  // Handle edit category
  const handleEdit = async () => {
    try {
      const token = localStorage.getItem("supplier_token");
      await axios.put(`http://localhost:3001/api/categories/${editCategoryId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Kategori berhasil diperbarui", "success");
      setFormData({ category_name: "" });
      setEditCategoryId(null);  // Reset the edit category state
      fetchCategories();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Gagal mengedit kategori", "error");
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId) => {
    const confirmDelete = await Swal.fire({
      title: "Anda yakin?",
      text: "Kategori ini akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const token = localStorage.getItem("supplier_token");
        await axios.delete(`http://localhost:3001/api/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Success", "Kategori berhasil dihapus", "success");
        fetchCategories();
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus kategori", "error");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Manajemen Kategori</h2>

      {/* Form Add Category */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Tambah Kategori</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-gray-600">Nama Kategori</label>
            <input
              type="text"
              name="category_name"
              value={formData.category_name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Tambah Kategori
            </button>
          </div>
        </form>
      </div>

      {/* Edit Category Form */}
      {editCategoryId && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Edit Kategori</h3>
          <form onSubmit={handleEdit}>
            <div>
              <label className="text-sm text-gray-600">Nama Kategori</label>
              <input
                type="text"
                name="category_name"
                value={formData.category_name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Update Kategori
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table of Categories */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-700">Daftar Kategori</h3>
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nama Kategori</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map((category) => (
                <tr key={category.category_id}>
                  <td className="px-6 py-4 text-gray-800">{category.category_name}</td>
                  <td className="px-6 py-4 text-gray-800">
                    <button
                      className="text-blue-600 mr-2"
                      onClick={() => {
                        setEditCategoryId(category.category_id);
                        setFormData({ category_name: category.category_name });
                      }}
                    >
                      <img src={editIcon} alt="edit" className="w-auto h-7" />
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(category.category_id)}
                    >
                      <img src={deleteIcon} alt="delete" className="w-auto h-7" />
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
            Menampilkan {indexOfFirstCategory + 1} - {Math.min(indexOfLastCategory, filteredCategories.length)} dari {filteredCategories.length} kategori
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-700">Halaman {currentPage} dari {totalPages}</span>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
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

export default CategoryManagementSupplier;
