import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const QrScanner = ({ onScanSuccess, onClose }) => {
    const readerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        if (!window.Html5Qrcode) {
            console.error("Library Html5Qrcode tidak ditemukan.");
            alert("Gagal memuat komponen pemindai QR.");
            onClose();
            return;
        }

        // Fungsi untuk menghentikan pemindai yang sedang berjalan
        const stopScanner = () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(err => {
                    console.error("Gagal menghentikan pemindai.", err);
                });
            }
        };

        // Inisialisasi pemindai
        if (!html5QrCodeRef.current && readerRef.current) {
            html5QrCodeRef.current = new window.Html5Qrcode(readerRef.current.id);
        }
        const html5QrCode = html5QrCodeRef.current;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            facingMode: "environment"
        };

        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            onScanSuccess(decodedText);
            stopScanner();
        };

        // Perbaikan: Jalankan pemindai setelah jeda singkat untuk menghindari race condition
        const startScannerWithDelay = () => {
            if (html5QrCode && !html5QrCode.isScanning) {
                html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
                    .catch(err => {
                        console.error("Tidak dapat memulai pemindaian.", err);
                        // Coba lagi tanpa facingMode jika kamera belakang gagal
                        html5QrCode.start({}, config, qrCodeSuccessCallback)
                            .catch(finalErr => {
                                console.error("Gagal total memulai pemindaian.", finalErr);
                                alert("Gagal memulai kamera. Pastikan Anda memberikan izin akses kamera.");
                                onClose();
                            });
                    });
            }
        };
        
        // Memberi jeda 100ms sebelum memulai kamera
        const timer = setTimeout(startScannerWithDelay, 100);

        // Fungsi cleanup
        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [onScanSuccess, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
            <div id="qr-reader" ref={readerRef} className="w-full max-w-md bg-black rounded-lg overflow-hidden"></div>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-3xl hover:opacity-75"
            >
                <FaTimes />
            </button>
            <p className="text-white mt-4">Posisikan QR Code di dalam kotak</p>
        </div>
    );
};

export default QrScanner;
