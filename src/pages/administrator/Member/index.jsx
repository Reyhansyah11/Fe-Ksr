import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:3001/api";

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    nama_pelanggan: "",
    alamat: "",
    no_hp: "",
    is_member: true,
  });

  const membersPerPage = 5;
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(
    indexOfFirstMember,
    indexOfLastMember
  );
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  // Tambahkan fungsi untuk mengecek status member
  const checkMemberStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/pelanggan/member/status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.status === "success") {
        const { nearExpiryMembers } = response.data.data;

        if (nearExpiryMembers && nearExpiryMembers.length > 0) {
          // Tampilkan Sweet Alert jika ada member yang akan expired
          Swal.fire({
            icon: "warning",
            title: "Peringatan Member",
            html: `
              <p>Ada ${
                nearExpiryMembers.length
              } member yang akan expired dalam 7 hari:</p>
              <ul style="text-align: left; margin-top: 10px;">
                ${nearExpiryMembers
                  .map(
                    (member) => `
                  <li>- ${member.nama_pelanggan} (${member.member_id})</li>
                `
                  )
                  .join("")}
              </ul>
            `,
            confirmButtonText: "Mengerti",
          });
        }
      }
    } catch (error) {
      console.error("Error checking member status:", error);
    }
  };

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers();
    checkMemberStatus();
  }, []);

  useEffect(() => {
    const filtered = members.filter(
      (member) =>
        member.nama_pelanggan
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        member.member_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
    setCurrentPage(1); // Reset ke halaman pertama saat melakukan pencarian
  }, [searchTerm, members]);

  // Tambahkan fungsi untuk mengaktifkan kembali member
  const handleReactivateMember = async (memberId) => {
    try {
      const result = await Swal.fire({
        title: "Aktifkan Kembali Member?",
        text: "Member akan diaktifkan dengan ID baru",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Aktifkan!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const response = await axios.post(
          `${API_URL}/pelanggan/reactivate/${memberId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.status === "success") {
          Swal.fire(
            "Berhasil!",
            "Member berhasil diaktifkan kembali.",
            "success"
          );
          fetchMembers();
        }
      }
    } catch (error) {
      console.error("Error reactivating member:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengaktifkan member",
      });
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/pelanggan`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const memberData = response.data.data;
      setMembers(memberData);
      setFilteredMembers(memberData);
    } catch (error) {
      console.error("Error fetching members:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengambil data member",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingMember
        ? `${API_URL}/pelanggan/${editingMember.pelanggan_id}`
        : `${API_URL}/pelanggan`;

      const method = editingMember ? "put" : "post";

      const response = await axios[method](
        url,
        { ...formData, is_member: true },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: editingMember
            ? "Member berhasil diupdate"
            : "Member baru berhasil ditambahkan",
        });
        fetchMembers();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving member:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menyimpan data member",
      });
    }
  };

  const handleDelete = async (memberId) => {
    try {
      const result = await Swal.fire({
        title: "Anda yakin?",
        text: "Member yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        await axios.delete(`${API_URL}/pelanggan/${memberId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        Swal.fire("Terhapus!", "Member berhasil dihapus.", "success");
        fetchMembers();
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menghapus member",
      });
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      nama_pelanggan: member.nama_pelanggan,
      alamat: member.alamat || "",
      no_hp: member.no_hp || "",
      is_member: true,
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nama_pelanggan: "",
      alamat: "",
      no_hp: "",
      is_member: true,
    });
    setEditingMember(null);
    setIsFormOpen(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manajemen Member</h1>
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Tambah Member
            </button>
          )}
        </div>

        {isFormOpen && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingMember ? "Edit Member" : "Tambah Member Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Member
                  </label>
                  <input
                    type="text"
                    value={formData.nama_pelanggan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama_pelanggan: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    No. HP
                  </label>
                  <input
                    type="text"
                    value={formData.no_hp}
                    onChange={(e) =>
                      setFormData({ ...formData, no_hp: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Alamat
                  </label>
                  <textarea
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingMember ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. HP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaksi Terakhir
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMembers.map((member) => (
                  <tr
                    key={member.pelanggan_id}
                    className={!member.is_member ? "bg-gray-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${
                          member.is_member
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {member.is_member ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.member_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.nama_pelanggan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.no_hp || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.alamat || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.last_transaction_date || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {member.is_member ? (
                        <>
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(member.pelanggan_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            handleReactivateMember(member.pelanggan_id)
                          }
                          className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-600 rounded-md text-sm"
                        >
                          Aktifkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-700">
              Menampilkan {indexOfFirstMember + 1} -{" "}
              {Math.min(indexOfLastMember, filteredMembers.length)} dari{" "}
              {filteredMembers.length} member
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
};

export default MemberManagement;
