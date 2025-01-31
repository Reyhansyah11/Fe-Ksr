import React, { useState, useEffect } from 'react';
import { getSupplierProducts, createPurchase } from '../../../../services/purchaseService';
import { getSuppliers } from '../../../../services/supplierService';
import Swal from 'sweetalert2';

const PurchaseForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    tanggal_pembelian: new Date().toISOString().split('T')[0],
    supplier_id: '',
    products: [],
    bayar: 0
  });

  const [suppliers, setSuppliers] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]); // Array produk yang dipilih
  const [supplierProducts, setSupplierProducts] = useState([]); // Produk dari supplier yang dipilih
  const [total, setTotal] = useState(0); // Perhitungan sementara total

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await getSuppliers();
        setSuppliers(response.data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSuppliers();
  }, []);

  const fetchSupplierProducts = async (supplierId) => {
    try {
      const products = await getSupplierProducts(supplierId);
      setSupplierProducts(products.data);
    } catch (error) {
      console.error('Error fetching supplier products:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal_pembelian: new Date().toISOString().split('T')[0],
      supplier_id: '',
      products: [],
      bayar: 0,
    });
    setSelectedProducts([]);
    setTotal(0);
  };

  const handleSupplierChange = (supplierId) => {
    setFormData({
      ...formData,
      supplier_id: parseInt(supplierId),
      products: []
    });
    setSelectedProducts([]);
    if (supplierId) {
      fetchSupplierProducts(supplierId);
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...selectedProducts];
    newProducts[index][field] = value;
    setSelectedProducts(newProducts);
    updateFormProducts(newProducts);
    calculateTotal(newProducts); // Update total sementara
  };

  const updateFormProducts = (products) => {
    const formattedProducts = products.map(product => ({
      product_id: parseInt(product.product_id),
      jumlah_product: parseInt(product.jumlah_product)
    }));

    setFormData(prev => ({
      ...prev,
      products: formattedProducts
    }));
  };

  const calculateTotal = (products) => {
    let totalAmount = 0;
    products.forEach(item => {
      const product = supplierProducts.find(p => p.product_id === parseInt(item.product_id));
      if (product) {
        totalAmount += product.harga_beli * parseInt(item.jumlah_product);
      }
    });
    setTotal(totalAmount);
  };

  

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { product_id: '', jumlah_product: 1 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const submissionData = {
      ...formData,
      supplier_id: parseInt(formData.supplier_id),
      bayar: parseInt(formData.bayar),
      products: formData.products.map(product => ({
        product_id: parseInt(product.product_id),
        jumlah_product: parseInt(product.jumlah_product),
      })),
    };
  
    try {
      console.log('Data yang dikirim ke backend:', submissionData);
  
      const response = await createPurchase(submissionData); // Panggil createPurchase
      console.log('Response dari backend:', response); // Debugging
  
      if (response && response.status === 'success') {
        const { sisa } = response.data;
  
        Swal.fire({
          title: 'Transaksi Berhasil!',
          text: `Sisa uang Anda: Rp ${sisa.toLocaleString()}`,
          icon: 'success',
          confirmButtonText: 'OK',
        });
        resetForm(); // Reset form
        onCancel(); // Tutup form
      } else {
        console.error('Response tidak sesuai format:', response);
        throw new Error(response?.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Error saat transaksi:', err);
  
      Swal.fire({
        title: 'Error!',
        text: `Terjadi kesalahan saat memproses transaksi: ${err.message}`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };  

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal Pembelian</label>
          <input
            type="date"
            value={formData.tanggal_pembelian}
            onChange={(e) => setFormData({ ...formData, tanggal_pembelian: e.target.value })}
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
            {suppliers.map(supplier => (
              <option key={supplier.supplier_id} value={supplier.supplier_id}>
                {supplier.supplier_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Produk</h3>
          <button
            type="button"
            onClick={handleAddProduct}
            className={`px-3 py-1 rounded text-sm ${formData.supplier_id ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!formData.supplier_id}
            title={!formData.supplier_id ? 'Harap pilih supplier' : ''}
          >
            Tambah Produk
          </button>
        </div>

        {selectedProducts.map((product, index) => {
          const productDetails = supplierProducts.find(p => p.product_id === parseInt(product.product_id));
          return (
            <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <div className="col-span-5">
                <select
                  value={product.product_id}
                  onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Pilih Produk</option>
                  {supplierProducts.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  value={product.jumlah_product}
                  onChange={(e) => handleProductChange(index, 'jumlah_product', e.target.value)}
                  className="w-full p-2 border rounded"
                  min="1"
                  required
                  placeholder="Jumlah"
                />
              </div>

              <div className="col-span-2 text-sm">
                {productDetails && (
                  <span>
                    × {productDetails.isi} {productDetails.satuan?.satuan_name || 'pcs'}
                  </span>
                )}
              </div>

              <div className="col-span-3">
                {productDetails && (
                  <span className="text-sm">
                    = {(product.jumlah_product * productDetails.isi)} {productDetails.satuan?.satuan_name || 'pcs'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Total</label>
          <input
            type="text"
            value={`Rp ${total.toLocaleString()}`}
            className="w-full p-2 border rounded bg-gray-100"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bayar</label>
          <input
            type="number"
            value={formData.bayar}
            onChange={(e) => setFormData({ ...formData, bayar: parseInt(e.target.value) })}
            className="w-full p-2 border rounded"
            min={total}
            required
          />
        </div>
      </div>

      

      <div className="flex justify-end">
      {/* Tombol */}
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
        >
          Batal
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          disabled={loading || selectedProducts.length === 0}
        >
          {loading ? 'Menyimpan...' : 'Simpan Pembelian'}
        </button>
      </div>
    </form>
  );
};

export default PurchaseForm;
