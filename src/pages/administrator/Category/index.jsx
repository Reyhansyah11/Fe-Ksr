// src/pages/administrator/Category/index.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CategoryManagement() {
 const [categories, setCategories] = useState([]);
 const [formData, setFormData] = useState({
   category_name: ''
 });
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 useEffect(() => {
   fetchCategories();
 }, []);

 const fetchCategories = async () => {
   try {
     const token = localStorage.getItem('token');
     const response = await axios.get('http://localhost:3000/api/categories', {
       headers: { Authorization: `Bearer ${token}` }
     });
     setCategories(response.data.data);
   } catch (error) {
     setError('Gagal mengambil data kategori');
   }
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     const token = localStorage.getItem('token');
     await axios.post('http://localhost:3000/api/categories', formData, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setSuccess('Kategori berhasil ditambahkan');
     setFormData({ category_name: '' });
     fetchCategories();
   } catch (error) {
     setError(error.response?.data?.message || 'Gagal menambahkan kategori');
   }
 };

 const handleDelete = async (id) => {
   if (window.confirm('Yakin ingin menghapus kategori ini?')) {
     try {
       const token = localStorage.getItem('token');
       await axios.delete(`http://localhost:3000/api/categories/${id}`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       fetchCategories();
     } catch (error) {
       setError('Gagal menghapus kategori');
     }
   }
 };

 return (
   <div className="p-6">
     <h2 className="text-2xl font-bold mb-6">Manajemen Kategori</h2>

     <div className="bg-white p-6 rounded-lg shadow mb-6">
       <h3 className="text-lg font-semibold mb-4">Tambah Kategori Baru</h3>
       <form onSubmit={handleSubmit} className="flex gap-4">
         <input
           type="text"
           name="category_name"
           placeholder="Nama Kategori"
           value={formData.category_name}
           onChange={(e) => setFormData({ category_name: e.target.value })}
           className="border p-2 rounded flex-1"
           required
         />
         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
           Tambah
         </button>
       </form>
       {error && <p className="text-red-500 mt-2">{error}</p>}
       {success && <p className="text-green-500 mt-2">{success}</p>}
     </div>

     <div className="bg-white rounded-lg shadow overflow-x-auto">
       <table className="w-full">
         <thead className="bg-gray-50">
           <tr>
             <th className="px-4 py-2 text-left">ID</th>
             <th className="px-4 py-2 text-left">Nama Kategori</th>
             <th className="px-4 py-2 text-left">Aksi</th>
           </tr>
         </thead>
         <tbody className="divide-y">
           {categories.map((category) => (
             <tr key={category.category_id}>
               <td className="px-4 py-2">{category.category_id}</td>
               <td className="px-4 py-2">{category.category_name}</td>
               <td className="px-4 py-2">
                 <button
                   onClick={() => handleDelete(category.category_id)}
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

export default CategoryManagement;