import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const PurchaseList = ({ purchaseDetails, loading }) => {
  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produk
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Qty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Harga Beli
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Harga Jual
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {purchaseDetails.map((detail, index) => (
            <tr key={detail.pembelian_detail_id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {detail.product?.product_name || 'Produk tidak ditemukan'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {detail.qty}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {detail.harga_beli.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {detail.harga_jual.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(detail.created_at), 'dd MMMM yyyy', { locale: id })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseList;
