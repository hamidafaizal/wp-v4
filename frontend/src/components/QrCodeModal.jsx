import React from 'react';
// Impor library baru
import QRCode from "react-qr-code";
import { FaTimes, FaSpinner } from 'react-icons/fa';

const QrCodeModal = ({ isOpen, onClose, token, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm text-center relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Pindai untuk Mendaftar</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">Gunakan PWA di HP Anda untuk memindai QR code ini.</p>
        
        <div className="flex justify-center items-center h-64 w-64 mx-auto bg-white p-4 rounded-lg">
          {isLoading ? (
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          ) : token ? (
            // Gunakan komponen dari library baru
            <QRCode
              value={token}
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          ) : (
            <p className="text-red-500">Gagal memuat token.</p>
          )}
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">QR Code ini hanya berlaku selama 5 menit.</p>
      </div>
    </div>
  );
};

export default QrCodeModal;
