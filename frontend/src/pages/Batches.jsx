import React, { useState, useEffect } from 'react';
import { getBatches, getDevices, createBatch, updateBatch, sendBatchToPwa, deleteBatch } from '../api';
import { FaPlus, FaTrash, FaPaperPlane, FaEdit } from 'react-icons/fa';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    device_id: '',
    link_count: 10,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, devicesRes] = await Promise.all([
        getBatches(),
        getDevices(),
      ]);
      setBatches(batchesRes.data);
      setDevices(devicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBatch) {
        await updateBatch(editingBatch.id, {
          device_id: formData.device_id || null
        });
      } else {
        await createBatch(formData);
      }
      setShowModal(false);
      setEditingBatch(null);
      setFormData({ name: '', device_id: '', link_count: 10 });
      fetchData();
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Gagal menyimpan batch');
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      device_id: batch.device_id || '',
      link_count: batch.total_links,
    });
    setShowModal(true);
  };

  const handleSendToPwa = async (batchId) => {
    try {
      await sendBatchToPwa(batchId);
      alert('Batch berhasil dikirim ke PWA');
      fetchData();
    } catch (error) {
      console.error('Error sending batch:', error);
      alert('Gagal mengirim batch ke PWA');
    }
  };

  const handleDelete = async (batchId) => {
    if (confirm('Yakin ingin menghapus batch ini?')) {
      try {
        await deleteBatch(batchId);
        fetchData();
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Gagal menghapus batch');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pending' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terkirim' },
      processing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Diproses' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Batch Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola batch untuk distribusi ke PWA</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <FaPlus />
          <span>Buat Batch</span>
        </button>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <div key={batch.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{batch.name}</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(batch)}
                  className="text-blue-500 hover:text-blue-700 p-1"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(batch.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                {getStatusBadge(batch.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Device:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {batch.device?.name || 'Belum ditugaskan'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {batch.processed_links}/{batch.total_links}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${batch.total_links > 0 ? (batch.processed_links / batch.total_links) * 100 : 0}%`
                }}
              ></div>
            </div>

            <button
              onClick={() => handleSendToPwa(batch.id)}
              disabled={!batch.device_id || batch.status === 'sent'}
              className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
            >
              <FaPaperPlane />
              <span>Kirim ke PWA</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingBatch ? 'Edit Batch' : 'Buat Batch Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingBatch && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Batch
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Perangkat PWA
                </label>
                <select
                  value={formData.device_id}
                  onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Pilih perangkat...</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </div>

              {!editingBatch && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jumlah Link
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.link_count}
                    onChange={(e) => setFormData({ ...formData, link_count: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBatch(null);
                    setFormData({ name: '', device_id: '', link_count: 10 });
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  {editingBatch ? 'Update' : 'Buat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;