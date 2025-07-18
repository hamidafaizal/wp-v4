import React, { useState, useEffect } from 'react';
import { getDevices, generateDeviceToken, registerDevice, deleteDevice } from '../api';
import { FaPlus, FaTrash, FaQrcode, FaSpinner } from 'react-icons/fa';
import QRCode from 'react-qr-code';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [generatingToken, setGeneratingToken] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await getDevices();
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToken = async () => {
    setGeneratingToken(true);
    try {
      const response = await generateDeviceToken();
      setQrToken(response.data.token);
      setShowModal(true);
    } catch (error) {
      console.error('Error generating token:', error);
      alert('Gagal membuat token');
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (confirm('Yakin ingin menghapus perangkat ini?')) {
      try {
        await deleteDevice(deviceId);
        fetchDevices();
      } catch (error) {
        console.error('Error deleting device:', error);
        alert('Gagal menghapus perangkat');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perangkat PWA</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola perangkat PWA yang terdaftar</p>
        </div>
        <button
          onClick={handleGenerateToken}
          disabled={generatingToken}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {generatingToken ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          <span>Tambah Perangkat</span>
        </button>
      </div>

      {/* Devices List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {devices.length === 0 ? (
          <div className="p-8 text-center">
            <FaQrcode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada perangkat</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Tambahkan perangkat PWA pertama Anda</p>
            <button
              onClick={handleGenerateToken}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Tambah Perangkat
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {devices.map((device) => (
              <div key={device.id} className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{device.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Terdaftar: {new Date(device.created_at).toLocaleDateString('id-ID')}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    device.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {device.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteDevice(device.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Scan QR Code</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Scan QR code ini dengan PWA di perangkat target untuk mendaftarkan perangkat.
            </p>
            <div className="flex justify-center mb-4 p-4 bg-white rounded-lg">
              <QRCode value={qrToken} size={200} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
              Token: {qrToken}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;