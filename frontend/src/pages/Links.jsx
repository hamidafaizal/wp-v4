import React, { useState, useEffect } from 'react';
import { getLinks, createLinks, uploadLinks, deleteLink } from '../api';
import { FaPlus, FaUpload, FaTrash, FaLink } from 'react-icons/fa';

const Links = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrls, setNewUrls] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await getLinks();
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLinks = async () => {
    const urls = newUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) return;

    try {
      await createLinks({ urls });
      setNewUrls('');
      setShowAddModal(false);
      fetchLinks();
    } catch (error) {
      console.error('Error adding links:', error);
      alert('Gagal menambahkan link');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadLinks(formData);
      alert(response.data.message);
      fetchLinks();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Gagal mengupload file');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (confirm('Yakin ingin menghapus link ini?')) {
      try {
        await deleteLink(linkId);
        fetchLinks();
      } catch (error) {
        console.error('Error deleting link:', error);
        alert('Gagal menghapus link');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pending' },
      processing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Diproses' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Gagal' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Links</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola link produk untuk didistribusikan</p>
        </div>
        <div className="flex space-x-2">
          <label className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer">
            {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> : <FaUpload />}
            <span>Upload CSV</span>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <FaPlus />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Links List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {links.length === 0 ? (
          <div className="p-8 text-center">
            <FaLink className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada link</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Tambahkan link produk untuk memulai</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {links.map((link) => (
              <div key={link.id} className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {link.url}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(link.status)}
                    {link.batch && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Batch: {link.batch.name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="text-red-500 hover:text-red-700 p-2 ml-2"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Links Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tambah Links</h2>
            <textarea
              value={newUrls}
              onChange={(e) => setNewUrls(e.target.value)}
              placeholder="Masukkan URL, satu per baris..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleAddLinks}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Links;