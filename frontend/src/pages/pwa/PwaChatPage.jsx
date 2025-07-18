import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { FaTrash, FaCopy, FaSync, FaLink, FaCheckCircle } from 'react-icons/fa';
import { getBatchesForDevice } from '../../api';

const PwaChatPage = () => {
    const location = useLocation();
    const { namaHp = 'HP Dummy (Develop)' } = location.state || {};

    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeMessageId, setActiveMessageId] = useState(null);

    // Fungsi untuk memuat batch dari server
    const loadBatches = async () => {
        setIsLoading(true);
        try {
            const response = await getBatchesForDevice(namaHp);
            setBatches(response.data.batches || []);
        } catch (error) {
            console.error('Gagal memuat batch:', error);
            // Untuk demo, kita akan menggunakan data dummy jika gagal
            setBatches([
                {
                    id: 1,
                    nama: 'Batch #1',
                    assigned_contact: { nama: namaHp },
                    links: [
                        { id: 1, product_link: 'https://shopee.co.id/product/12345/67890' },
                        { id: 2, product_link: 'https://tokopedia.com/product/abcde/fghij' },
                        { id: 3, product_link: 'https://lazada.co.id/product/klmno/pqrst' }
                    ]
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBatches();
    }, [namaHp]);

    const handleCopyLink = (linkToCopy) => {
        navigator.clipboard.writeText(linkToCopy)
            .then(() => alert('Link berhasil disalin!'))
            .catch(err => alert('Gagal menyalin link.'));
        setActiveMessageId(null);
    };
    
    const handleDeleteLink = (batchId, linkId) => {
        setBatches(currentBatches => 
            currentBatches.map(batch => 
                batch.id === batchId 
                    ? { ...batch, links: batch.links.filter(link => link.id !== linkId) }
                    : batch
            )
        );
        setActiveMessageId(null);
    };

    const handleMarkBatchComplete = (batchId) => {
        setBatches(currentBatches => 
            currentBatches.filter(batch => batch.id !== batchId)
        );
        alert('Batch berhasil ditandai sebagai selesai!');
    };

    const ActionButtons = ({ link, batchId }) => (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <button onClick={() => handleCopyLink(link.product_link)} className="p-1 hover:text-blue-500">
                <FaCopy />
            </button>
            <button onClick={() => handleDeleteLink(batchId, link.id)} className="p-1 hover:text-red-500">
                <FaTrash />
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 z-10 flex-shrink-0 flex justify-between items-center">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{namaHp}</h1>
                <button 
                    onClick={loadBatches}
                    disabled={isLoading}
                    className="p-2 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                >
                    <FaSync className={isLoading ? 'animate-spin' : ''} />
                </button>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="text-center py-8">
                        <FaSync className="animate-spin text-2xl text-blue-500 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">Memuat batch...</p>
                    </div>
                ) : batches.length === 0 ? (
                    <div className="text-center py-8">
                        <FaLink className="text-4xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Tidak ada batch yang tersedia</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Refresh untuk memeriksa batch baru</p>
                    </div>
                ) : (
                    batches.map((batch) => (
                        <div key={batch.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {batch.nama}
                                </h2>
                                <button
                                    onClick={() => handleMarkBatchComplete(batch.id)}
                                    className="flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                                >
                                    <FaCheckCircle className="mr-1" />
                                    Selesai
                                </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {batch.links.length} link tersedia
                            </p>

                            <div className="space-y-2">
                                {batch.links.map((link) => (
                                    <div 
                                        key={link.id} 
                                        className="flex items-center gap-2 justify-between"
                                    >
                                        <div 
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setActiveMessageId(activeMessageId === link.id ? null : link.id)}
                                        >
                                            <div className="bg-blue-500 text-white px-3 py-2 rounded-lg rounded-br-none shadow">
                                                <p className="text-sm break-all">{link.product_link}</p>
                                            </div>
                                        </div>
                                        
                                        {activeMessageId === link.id && (
                                            <ActionButtons link={link} batchId={batch.id} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 p-2 shadow-up flex-shrink-0 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tap pada link untuk melihat opsi • Refresh untuk memuat batch baru
                </p>
            </footer>
        </div>
    );
};

export default PwaChatPage;