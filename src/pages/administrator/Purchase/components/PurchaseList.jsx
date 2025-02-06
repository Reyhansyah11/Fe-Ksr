// PurchaseList.jsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {Eye} from "lucide-react";

const PurchaseList = ({ purchaseDetails = [], loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!purchaseDetails || purchaseDetails.length === 0) {
    return <div className="text-center py-4 text-gray-500">Tidak ada data pembelian</div>;
  }

  const handleShowDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Faktur</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bayar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sisa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {purchaseDetails.map((purchase, index) => (
            <tr key={purchase.pembelian_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.no_faktur}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.supplier.supplier_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(purchase.tanggal_pembelian), 'dd MMMM yyyy', { locale: id })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(purchase.total)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(purchase.bayar)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(purchase.sisa)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <button
                  onClick={() => handleShowDetails(purchase)}
                  className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={20} />
                    </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Detail */}
      {isModalOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Detail Pembelian - {selectedPurchase.no_faktur}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="mb-2"><span className="font-semibold">Tanggal:</span> {format(new Date(selectedPurchase.tanggal_pembelian), 'dd MMMM yyyy', { locale: id })}</p>
                <p className="mb-2"><span className="font-semibold">Supplier:</span>{selectedPurchase.supplier?.supplier_name}</p>
                <p className="mb-2"><span className="font-semibold">User:</span> {selectedPurchase.user?.username}</p>
              </div>
              <div>
                <p className="mb-2"><span className="font-semibold">Total:</span> {formatCurrency(selectedPurchase.total)}</p>
                <p className="mb-2"><span className="font-semibold">Bayar:</span> {formatCurrency(selectedPurchase.bayar)}</p>
                <p className="mb-2"><span className="font-semibold">Sisa:</span> {formatCurrency(selectedPurchase.sisa)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Beli</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Jual</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedPurchase.details.map((detail, index) => (
                    <tr key={detail.pembelian_detail_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.product.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.qty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(detail.harga_beli)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(detail.harga_jual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseList;