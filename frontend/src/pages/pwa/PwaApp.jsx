import React, { useState, useEffect } from 'react';
import { getPwaBatches, updateLinkStatus, completeBatch } from '../../api';
import { FaSync, FaCheck, FaTimes, FaCopy } from 'react-icons/fa';

const PwaApp = () => {
  const [deviceToken, setDeviceToken] = useState(localStorage.getItem('pwa_device_token') || '');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('pwa_device_token'));

  useEffect(() => {
    if (isLoggedIn) {
      fetchBatches();
    }
  }, [isLoggedIn]);

  const fetchBatches = async () => {
    if (!deviceToken) return;
    
    setLoading(true);
    try {
      const response = await getPwaBatches(deviceToken);
      setBatches(response.data.batches);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!deviceToken.trim()) {
      alert('Masukkan token device');
      return;
    }
    localStorage.setItem('pwa_device_token', deviceToken);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('pwa_device_token');
    setDeviceToken('');
    setIsLoggedIn(false);
    setBatches([]);
  };

  const handleLinkAction = async (linkId, status) => {
    try {
      await updateLinkStatus({
        device_token: deviceToken,
        link_id: linkId,
        status: status
      });
      fetchBatches();
    } catch (error) {
      console.error('Error updating link status:', error);
      alert('Gagal memperbarui status link');
    }
  };

  const handleCompleteBatch = async (batchId) => {
    if (confirm('Tandai batch ini sebagai selesai?')) {
      try {
        await completeBatch({
          device_token: deviceToken,
          batch_id: batchId
        });
        fetchBatches();
      } catch (error) {
        console.error('Error completing batch:', error);
        alert('Gagal menyelesaikan batch');
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link berhasil disalin!');
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            PWA Login
          </h1>
          <div className="space-y-4">
            <input
              type="text"
              value={deviceToken}
              onChange={(e) => setDeviceToken(e.target.value)}
              placeholder="Masukkan token device"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">PWA Distribution</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchBatches}
            disabled={loading}
            className="p-2 text-blue-500 hover:text-blue-700 disabled:opacity-50"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4">
        {loading && batches.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Memuat batch...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Tidak ada batch tersedia</p>
            <button
              onClick={fetchBatches}
              className="mt-2 text-blue-500 hover:text-blue-700"
            >
              Refresh
            </button>
          </div>
        ) : (
          batches.map((batch) => (
            <div key={batch.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {batch.name}
                </h2>
                <button
                  onClick={() => handleCompleteBatch(batch.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Selesai
                </button>
              </div>

              <div className="space-y-3">
                {batch.links.map((link) => (
                  <div key={link.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        link.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                        link.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        link.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {link.status === 'pending' ? 'Pending' :
                         link.status === 'processing' ? 'Diproses' :
                         link.status === 'completed' ? 'Selesai' : 'Gagal'}
                      </span>
                      <button
                        onClick={() => copyToClipboard(link.url)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <FaCopy />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 break-all">
                      {link.url}
                    </p>

                    {link.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLinkAction(link.id, 'processing')}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded text-sm"
                        >
                          Mulai Proses
                        </button>
                      </div>
                    )}

                    {link.status === 'processing' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLinkAction(link.id, 'completed')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded text-sm flex items-center justify-center"
                        >
                          <FaCheck className="mr-1" /> Selesai
                        </button>
                        <button
                          onClick={() => handleLinkAction(link.id, 'failed')}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm flex items-center justify-center"
                        >
                          <FaTimes className="mr-1" /> Gagal
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default PwaApp;