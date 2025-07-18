import React, { useState } from 'react';
import { FaPlus, FaMobileAlt, FaSpinner } from 'react-icons/fa';
import { generatePerangkatPwaToken } from '../api';
import QrCodeModal from '../components/QrCodeModal';

const ManajemenPerangkatPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrToken, setQrToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Data dummy untuk daftar perangkat
  const dummyDevices = [
    { id: 1, name: 'HP-01 (Asus Zenfone)' },
    { id: 2, name: 'HP-02 (Samsung Galaxy)' },
    { id: 3, name: 'HP-03 (Xiaomi Redmi)' },
  ];

  const handleAddDeviceClick = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    setQrToken(null);
    try {
      const response = await generatePerangkatPwaToken();
      setQrToken(response.data.token);
    } catch (error) {
      console.error("Gagal menghasilkan token QR:", error);
      alert("Gagal membuat token pendaftaran. Silakan coba lagi.");
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <QrCodeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={qrToken}
        isLoading={isLoading}
      />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Perangkat</h1>
          <button
            onClick={handleAddDeviceClick}
            disabled={isLoading}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-blue-400"
          >
            {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
            Tambah HP
          </button>
        </div>

        <div className="space-y-4">
          {dummyDevices.map((device) => (
            <div 
              key={device.id} 
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm"
            >
              <FaMobileAlt className="text-xl text-gray-500 dark:text-gray-400 mr-4" />
              <span className="font-medium text-gray-800 dark:text-gray-200">{device.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ManajemenPerangkatPage;
