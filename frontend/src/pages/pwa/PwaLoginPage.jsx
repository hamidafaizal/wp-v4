import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaImage, FaSignInAlt } from 'react-icons/fa';
import QrScanner from '../../components/pwa/QrScanner.jsx'; 

const PwaLoginPage = () => {
    const [namaHp, setNamaHp] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const navigate = useNavigate();
    // Tambahkan ref untuk input file yang tersembunyi
    const fileInputRef = useRef(null);

    const handleLogin = () => {
        if (namaHp.trim() === '') {
            alert('Nama HP tidak boleh kosong.');
            return;
        }
        navigate('/chat', { state: { namaHp } });
    };

    const handleScanSuccess = (decodedText) => {
        setNamaHp(decodedText);
        setIsScanning(false);
    };

    const handleScannerClose = () => {
        setIsScanning(false);
    };

    // Fungsi untuk memicu klik pada input file
    const handleScanImageClick = () => {
        fileInputRef.current.click();
    };

    // Fungsi untuk memproses file gambar yang dipilih
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (!window.Html5Qrcode) {
            alert("Gagal memuat komponen pemindai QR.");
            return;
        }
        
        // Inisialisasi pemindai hanya untuk pemindaian file
        const html5QrCode = new window.Html5Qrcode( "qr-reader-file-container" );

        try {
            const decodedText = await html5QrCode.scanFile(file, false);
            setNamaHp(decodedText);
            alert(`QR Code berhasil dipindai: ${decodedText}`);
        } catch (err) {
            console.error("Gagal memindai QR code dari gambar.", err);
            alert("Tidak dapat menemukan QR code pada gambar yang dipilih.");
        } finally {
            // Reset input file agar bisa memilih file yang sama lagi
            event.target.value = '';
        }
    };

    return (
        <>
            {isScanning && (
                <QrScanner
                    onScanSuccess={handleScanSuccess}
                    onClose={handleScannerClose}
                />
            )}

            {/* Tambahkan div tersembunyi untuk proses scan dari file */}
            <div id="qr-reader-file-container" style={{ display: 'none' }}></div>

            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
                <div className="w-full max-w-sm mx-auto">
                    <div className="flex justify-center mb-6">
                        <img src="/logo-pwa-192x192.png" alt="Logo" className="h-24 w-24" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/192x192/000000/FFFFFF?text=Logo' }} />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full">
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                            Login PWA
                        </h2>
                        
                        <div className="mb-4">
                            <label htmlFor="nama-hp" className="sr-only">Nama HP</label>
                            <input
                                type="text"
                                id="nama-hp"
                                value={namaHp}
                                onChange={(e) => setNamaHp(e.target.value)}
                                placeholder="Masukkan nama HP"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="flex gap-4 mb-6">
                            <button 
                                onClick={() => setIsScanning(true)}
                                className="flex-1 inline-flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <FaCamera className="mr-2" />
                                Scan Kamera
                            </button>
                            <button 
                                onClick={handleScanImageClick}
                                className="flex-1 inline-flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <FaImage className="mr-2" />
                                Scan Gambar
                            </button>
                            {/* Input file yang tersembunyi */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FaSignInAlt className="mr-2" />
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PwaLoginPage;
