import React, { useState } from 'react';
import { FaUser, FaLink, FaSpinner, FaBox, FaMobileAlt } from 'react-icons/fa';
import { getBatchLinks } from '../api.js';

const BatchCard = ({ batch, contacts, onAssignContact, onUpdateKapasitas, onMarkAsSent }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [kapasitas, setKapasitas] = useState(batch.kapasitas);
  
  const assignedContact = batch.assigned_contact;

  const handleAssign = (e) => {
    const contactId = parseInt(e.target.value, 10);
    if (!isNaN(contactId)) {
      onAssignContact(batch.id, contactId);
    }
  };

  const handleKapasitasChange = (e) => {
    setKapasitas(e.target.value);
  };

  const handleKapasitasBlur = () => {
    const newKapasitas = parseInt(kapasitas, 10);
    if (!isNaN(newKapasitas) && newKapasitas !== batch.kapasitas) {
      onUpdateKapasitas(batch.id, newKapasitas);
    }
  };

  const handleSendToPWA = async () => {
    if (!assignedContact) {
      alert('Silakan tugaskan kontak ke batch ini terlebih dahulu.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await getBatchLinks(batch.id);
      const { links } = response.data;

      if (links.length === 0) {
        alert('Tidak ada link di dalam batch ini untuk dikirim.');
        setIsProcessing(false);
        return;
      }

      // Simulasi pengiriman ke PWA - dalam implementasi nyata ini akan mengirim notifikasi ke PWA
      alert(`Batch berhasil dikirim ke PWA ${assignedContact.nama}!\n\nJumlah link: ${links.length}\n\nPWA akan menerima notifikasi untuk memproses batch ini.`);
      
      // Tandai batch sebagai terkirim
      await onMarkAsSent(batch.id);

    } catch (error) {
      console.error("Gagal mengirim batch ke PWA:", error);
      alert("Terjadi kesalahan saat mengirim batch ke PWA.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{batch.nama.replace('Batch #', '')}</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-2">
          <div className="flex items-center">
            <FaLink className="mr-2" />
            <span>{batch.links_count} / {batch.kapasitas} Link</span>
          </div>
          <div className="flex items-center">
            <FaUser className="mr-2" />
            <span>{assignedContact ? assignedContact.nama : 'Belum ditugaskan'}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor={`kapasitas-${batch.id}`} className="text-xs font-medium text-gray-600 dark:text-gray-400">Kapasitas</label>
          <div className="flex items-center">
            <FaBox className="text-gray-400 mr-2" />
            <input
              type="number"
              id={`kapasitas-${batch.id}`}
              value={kapasitas}
              onChange={handleKapasitasChange}
              onBlur={handleKapasitasBlur}
              className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
              min="1"
            />
          </div>
        </div>

        <div className="mt-2">
          <label htmlFor={`kontak-${batch.id}`} className="text-xs font-medium text-gray-600 dark:text-gray-400">Tugaskan ke</label>
          <select
            id={`kontak-${batch.id}`}
            value={assignedContact?.id || ''}
            onChange={handleAssign}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
          >
            <option value="" disabled>Pilih Kontak</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.nama}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleSendToPWA}
          disabled={!assignedContact || batch.links_count === 0 || isProcessing}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? <FaSpinner className="animate-spin mr-2" /> : <FaMobileAlt className="mr-2" />}
          {isProcessing ? 'Memproses...' : 'Kirim ke PWA'}
        </button>
      </div>
    </div>
  );
};

export default BatchCard;