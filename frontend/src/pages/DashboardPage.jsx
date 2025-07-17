import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaMobileAlt } from 'react-icons/fa';
import { getDashboardHistory } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getDashboardHistory();
        setHistory(response.data);
      } catch (error) {
        console.error("Gagal memuat riwayat:", error);
        alert("Gagal memuat data riwayat dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Selamat datang! Berikut adalah ringkasan aktivitas terbaru Anda.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
          <FaCheckCircle className="mr-3 text-green-500" />
          Riwayat Pengiriman Terakhir
        </h3>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Nama HP</th>
                  <th scope="col" className="px-6 py-3">Waktu Pengiriman</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((item) => (
                    <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap flex items-center">
                        <FaMobileAlt className="mr-2 text-gray-400" />
                        {item.kontak?.nama || 'Kontak Dihapus'}
                      </th>
                      <td className="px-6 py-4">
                        {formatDate(item.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center py-4 text-gray-500">
                      Belum ada riwayat pengiriman.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
