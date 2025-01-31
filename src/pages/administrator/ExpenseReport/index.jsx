import React, { useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function ExpenseReport() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const printComponentRef = useRef(null);

    // Fungsi untuk export PDF menggunakan jsPDF
    const exportToPDF = async () => {
        if (!printComponentRef.current) {
            alert('Komponen belum siap untuk dicetak');
            return;
        }

        try {
            setExportLoading(true);
            
            // Konfigurasi untuk html2canvas
            const opt = {
                scale: 2, // Meningkatkan kualitas render
                useCORS: true,
                logging: false,
                scrollY: -window.scrollY // Mengatasi masalah scrolling
            };

            // Mengambil elemen yang akan dicetak
            const element = printComponentRef.current;
            
            // Convert HTML ke Canvas
            const canvas = await html2canvas(element, opt);
            
            // Mendapatkan dimensi untuk PDF
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            // Membuat PDF dengan orientasi potrait
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Menambahkan gambar ke PDF
            pdf.addImage(
                canvas.toDataURL('image/png'), 
                'PNG', 
                0, 
                0, 
                imgWidth, 
                imgHeight
            );
            
            // Generate nama file
            const fileName = `Laporan_Pengeluaran_${startDate}_${endDate}.pdf`;
            
            // Simpan PDF
            pdf.save(fileName);
        } catch (error) {
            console.error('Gagal export PDF:', error);
            alert('Gagal mengexport PDF. Silakan coba lagi.');
        } finally {
            setExportLoading(false);
        }
    };

    const fetchReport = async () => {
        if (!startDate || !endDate) {
            alert('Mohon pilih tanggal mulai dan tanggal akhir');
            return;
        }

        try {
            setLoading(true);
            const startDateTime = new Date(startDate);
            startDateTime.setHours(0, 0, 0, 0);
            
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);

            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:3001/api/pembelian/report`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        startDate: startDateTime.toISOString(),
                        endDate: endDateTime.toISOString()
                    }
                }
            );
            setReportData(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil data laporan:", error);
            alert('Gagal mengambil data laporan');
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(number);
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Laporan Pengeluaran</h2>
                
                {/* Form Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-white p-4 rounded-lg shadow">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Mulai
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Akhir
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchReport}
                            disabled={loading}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                        >
                            {loading ? 'Loading...' : 'Generate Report'}
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                {reportData && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Hasil Laporan</h3>
                            {reportData.expenses.length > 0 && (
                                <button
                                    onClick={exportToPDF}
                                    disabled={exportLoading}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-green-300"
                                >
                                    {exportLoading ? 'Exporting...' : 'Export PDF'}
                                </button>
                            )}
                        </div>

                        {/* Konten yang akan dicetak */}
                        <div ref={printComponentRef} className="p-6">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold">Laporan Pengeluaran</h3>
                                <p className="text-gray-600">
                                    Periode: {new Date(startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })} - 
                                    {new Date(endDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                </p>
                            </div>

                            {reportData.expenses.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full mb-4">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left">Tanggal</th>
                                                <th className="px-4 py-2 text-left">No Faktur</th>
                                                <th className="px-4 py-2 text-left">Kasir</th>
                                                <th className="px-4 py-2 text-left">Supplier</th>
                                                <th className="px-4 py-2 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.expenses.map((expense) => (
                                                <tr key={expense.pembelian_id} className="border-b">
                                                    <td className="px-4 py-2">
                                                        {new Date(expense.tanggal_pembelian).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-2">{expense.no_faktur}</td>
                                                    <td className="px-4 py-2">{expense.user.nama_lengkap}</td>
                                                    <td className="px-4 py-2">{expense.supplier.supplier_name}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        {formatRupiah(expense.total)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="font-bold bg-gray-50">
                                                <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
                                                <td className="px-4 py-2 text-right">
                                                    {formatRupiah(reportData.totalExpense)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Tidak ada data pengeluaran untuk periode ini
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExpenseReport;