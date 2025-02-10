import React from 'react';
import { X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const InvoiceModal = ({ 
  showDetailModal, 
  selectedSale, 
  setSelectedSale, 
  setShowDetailModal 
}) => {
  const invoiceRef = React.useRef(null);

  // Fungsi untuk mengekspor sebagai gambar
  const exportAsImage = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = image;
      link.download = `Invoice_${selectedSale.no_faktur}.png`;
      link.click();
    } catch (error) {
      console.error('Gagal mengekspor gambar:', error);
      alert('Gagal mengekspor invoice. Silakan coba lagi.');
    }
  };

  // Hitung total diskon
  const calculateTotalDiscount = () => {
    const subtotal = selectedSale.details.reduce(
      (sum, detail) => sum + (detail.qty * detail.harga_jual), 
      0
    );

    let discountRate = 0;
    if (selectedSale.pelanggan?.is_member) {
      if (subtotal >= 1000000) discountRate = 0.1;
      else if (subtotal >= 300000) discountRate = 0.05;
      else if (subtotal >= 150000) discountRate = 0.02;
    }

    return {
      rate: discountRate,
      amount: subtotal * discountRate
    };
  };

  const { rate: discountRate, amount: totalDiscount } = calculateTotalDiscount();

  if (!showDetailModal || !selectedSale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4 top-[-20px] left-0 right-0 bottom-0">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl overflow-hidden relative">
        {/* Tombol export dan close */}
        <div className="absolute top-2 right-2 flex items-center space-x-2 z-10">
          <button 
            onClick={exportAsImage}
            className="text-white rounded-full p-1"
            title="Unduh Gambar"
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => {
              setSelectedSale(null);
              setShowDetailModal(false);
            }}
            className="text-white bg-purple-600 hover:bg-purple-700 rounded-full p-1"
            title="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Konten Invoice */}
        <div 
          ref={invoiceRef} 
          className="bg-white"
        >
          <div className="bg-purple-600 text-white p-4 pb-6 relative">
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-t-full"></div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold">Invoice</h2>
              <p className="text-sm">No. {selectedSale.no_faktur}</p>
            </div>
          </div>

          <div className="p-4 pt-6">
            <div className="mb-4 border-b pb-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pelanggan</span>
                <span className="font-medium">
                  {selectedSale.pelanggan
                    ? selectedSale.pelanggan.nama_pelanggan
                    : "Non-Member"}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Tanggal</span>
                <span className="font-medium">
                  {new Date(selectedSale.tanggal_penjualan).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {selectedSale.details.map((detail) => (
                <div
                  key={detail.penjualan_detail_id}
                  className="flex justify-between text-sm"
                >
                  <div>
                    <span className="font-medium mr-2">
                      {detail.product.product_name}
                    </span>
                    <span className="text-gray-500">
                      {detail.qty} x Rp{detail.harga_jual.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-medium">
                    Rp{(detail.qty * detail.harga_jual).toLocaleString()}
                  </span>
                </div>
              ))}
              
              {discountRate > 0 && (
                <div className="flex justify-between text-sm text-green-600 mt-2">
                  <div>
                    <span className="font-medium">Diskon Member</span>
                    <span className="text-gray-500 ml-2">({(discountRate * 100).toFixed(0)}%)</span>
                  </div>
                  <span className="font-medium">
                    -Rp{totalDiscount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">
                  Rp{selectedSale.total_akhir.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bayar</span>
                <span className="font-medium">
                  Rp{selectedSale.bayar.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-green-600">
                <span>Kembali</span>
                <span>
                  Rp{(selectedSale.bayar - selectedSale.total_akhir).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 text-center text-xs text-gray-500">
            Terima kasih atas pembelian Anda
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;