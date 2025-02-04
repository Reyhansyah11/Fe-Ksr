import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import deleteIcon from "../../../../public/icons/delete.png";
import editIcon from "../../../../public/icons/edit.png";

const SatuanManagementSupplier = () => {
  const [satuan, setSatuan] = useState([]);
  const [formData, setFormData] = useState({ satuan_name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editSatuanId, setEditSatuanId] = useState(null);  // Menyimpan ID satuan yang sedang diedit
  const satuanPerPage = 5;

  useEffect(() => {
    fetchSatuan();
  }, []);

  // Fetch Satuan Data
  const fetchSatuan = async () => {
    try {
      const token = localStorage.getItem("supplier_token");
      const response = await axios.get("http://localhost:3001/api/satuan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSatuan(response.data.data);
    } catch (error) {
      Swal.fire("Error", "Gagal memuat satuan", "error");
    }
  };

  const filteredSatuan = satuan.filter((unit) =>
    unit.satuan_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastSatuan = currentPage * satuanPerPage;
  const indexOfFirstSatuan = indexOfLastSatuan - satuanPerPage;
  const currentSatuan = filteredSatuan.slice(indexOfFirstSatuan, indexOfLastSatuan);
  const totalPages = Math.ceil(filteredSatuan.length / satuanPerPage);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle add new satuan
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("supplier_token");
      await axios.post("http://localhost:3001/api/satuan", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Satuan berhasil ditambahkan", "success");
      setFormData({ satuan_name: "" });
      fetchSatuan();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Gagal menambah satuan", "error");
    }
  };

  // Handle edit satuan
  const handleEdit = async () => {
    try {
      const token = localStorage.getItem("supplier_token");
      await axios.put(`http://localhost:3001/api/satuan/${editSatuanId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Satuan berhasil diperbarui", "success");
      setFormData({ satuan_name: "" });
      setEditSatuanId(null);  // Reset after editing
      fetchSatuan();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Gagal mengedit satuan", "error");
    }
  };

  // Handle delete satuan
  const handleDelete = async (satuanId) => {
    const confirmDelete = await Swal.fire({
      title: "Anda yakin?",
      text: "Satuan ini akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const token = localStorage.getItem("supplier_token");
        await axios.delete(`http://localhost:3001/api/satuan/${satuanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Success", "Satuan berhasil dihapus", "success");
        fetchSatuan();
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus satuan", "error");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Manajemen Satuan</h2>

      {/* Form Add Satuan */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Tambah Satuan</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Nama Satuan</label>
              <input
                type="text"
                name="satuan_name"
                value={formData.satuan_name}
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
              Tambah Satuan
            </button>
          </div>
        </form>
      </div>

      {/* Edit Satuan Form */}
      {editSatuanId && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Edit Satuan</h3>
          <form onSubmit={handleEdit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nama Satuan</label>
                <input
                  type="text"
                  name="satuan_name"
                  value={formData.satuan_name}
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
                Update Satuan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table of Satuan */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-700">Daftar Satuan</h3>
            <input
              type="text"
              placeholder="Cari satuan..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nama Satuan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentSatuan.map((unit) => (
                <tr key={unit.satuan_id}>
                  <td className="px-6 py-4 text-gray-800">{unit.satuan_name}</td>
                  <td className="px-6 py-4 text-gray-800">
                    {/* Edit and Delete Buttons */}
                    <button
                      className="text-blue-600 mr-2"
                      onClick={() => {
                        setEditSatuanId(unit.satuan_id);
                        setFormData({ satuan_name: unit.satuan_name });
                      }}
                    >
                      <img src={editIcon} alt="edit" className="w-auto h-7" />
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(unit.satuan_id)}
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
            Menampilkan {indexOfFirstSatuan + 1} - {Math.min(indexOfLastSatuan, filteredSatuan.length)} dari {filteredSatuan.length} satuan
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

export default SatuanManagementSupplier;
