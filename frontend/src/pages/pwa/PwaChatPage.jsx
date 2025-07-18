import React, { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { FaTrash, FaCopy } from 'react-icons/fa';

const PwaChatPage = () => {
    const location = useLocation();
    const { namaHp = 'HP Dummy (Develop)' } = location.state || {};

    // Data awal pesan
    const initialMessages = [
        { id: 1, text: 'Halo! Ini adalah pesan pertama.', sender: 'other' },
        { id: 2, text: 'Hai juga! Ini balasan dari saya.', sender: 'me' },
        { id: 3, text: 'https://shopee.co.id/product/12345/67890', sender: 'other' },
        { id: 4, text: 'Ok, terima kasih linknya!', sender: 'me' },
    ];

    const [messages, setMessages] = useState(initialMessages);
    // State untuk melacak bubble mana yang sedang aktif (untuk menampilkan tombol)
    const [activeMessageId, setActiveMessageId] = useState(null);

    // Jika tidak ada namaHp (akses langsung), redirect ke halaman login PWA
    if (!location.state?.namaHp) {
        // Kita tetap berikan nilai default agar bisa diakses saat develop
        // return <Navigate to="/pwa" replace />; 
    }

    const handleCopyMessage = (textToCopy) => {
        navigator.clipboard.writeText(textToCopy)
            .then(() => alert('Pesan berhasil disalin!'))
            .catch(err => alert('Gagal menyalin pesan.'));
        setActiveMessageId(null); // Sembunyikan tombol setelah aksi
    };
    
    const handleDeleteMessage = (idToDelete) => {
        setMessages(currentMessages => currentMessages.filter(msg => msg.id !== idToDelete));
        setActiveMessageId(null); // Sembunyikan tombol setelah aksi
    };

    // Komponen kecil untuk tombol aksi agar tidak duplikasi kode
    const ActionButtons = ({ message }) => (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <button onClick={() => handleCopyMessage(message.text)} className="p-1 hover:text-blue-500">
                <FaCopy />
            </button>
            <button onClick={() => handleDeleteMessage(message.id)} className="p-1 hover:text-red-500">
                <FaTrash />
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 z-10 flex-shrink-0">
                <h1 className="text-lg font-semibold text-center text-gray-900 dark:text-white">{namaHp}</h1>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    return (
                        <div 
                            key={msg.id} 
                            className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            {/* Tampilkan tombol di kiri untuk pesan orang lain */}
                            {!isMe && activeMessageId === msg.id && <ActionButtons message={msg} />}

                            <div 
                                className="max-w-xs lg:max-w-md cursor-pointer"
                                onClick={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
                            >
                                <div className={`px-4 py-2 rounded-lg shadow ${
                                    isMe
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                }`}>
                                    <p className="text-sm break-words">{msg.text}</p>
                                </div>
                            </div>
                            
                            {/* Tampilkan tombol di kanan untuk pesan sendiri */}
                            {isMe && activeMessageId === msg.id && <ActionButtons message={msg} />}
                        </div>
                    );
                })}
            </main>

            {/* Footer dikosongkan karena tombol pindah ke bubble */}
            <footer className="bg-white dark:bg-gray-800 p-2 shadow-up flex-shrink-0">
                {/* Area ini bisa digunakan untuk input pesan di masa depan */}
            </footer>
        </div>
    );
};

export default PwaChatPage;
