// components/ImportDatabase/index.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const ImportDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("admin_token");
      
      if (!adminToken) {
        setError('Token tidak ditemukan. Silakan login ulang.');
        return;
      }

      const response = await fetch('http://localhost:3001/api/backups', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data backup');
      }

      const data = await response.json();
      setBackups(data.backups || []); // Pastikan backups selalu array
    } catch (err) {
      setError('Gagal mengambil daftar backup: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (filename) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: "Database akan diimport dari file backup ini. Data saat ini akan ditimpa!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Import!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        setLoading(true);
        const adminToken = localStorage.getItem("admin_token");

        if (!adminToken) {
          throw new Error('Token tidak ditemukan. Silakan login ulang.');
        }

        const response = await fetch(`http://localhost:3001/api/import/${filename}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal mengimport database');
        }
        
        await Swal.fire(
          'Berhasil!',
          'Database telah berhasil diimport.',
          'success'
        );
        
        fetchBackups();
      }
    } catch (err) {
      Swal.fire(
        'Error!',
        'Gagal mengimport database: ' + err.message,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Memuat daftar backup...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (!backups || backups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Tidak ada file backup tersedia
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {backups.map((backup) => (
        <div 
          key={backup.filename} 
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div>
            <p className="font-medium text-gray-800">{backup.filename}</p>
            <p className="text-sm text-gray-500">
              Ukuran: {formatFileSize(backup.size)}
            </p>
          </div>
          <button 
            onClick={() => handleImport(backup.filename)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImportDatabase;