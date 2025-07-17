import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ContactModal from '../components/ContactModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { getKontaks, createKontak, updateKontak, deleteKontak } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const ManajemenHpPage = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState(null);

  // Fungsi untuk memuat data kontak dari API
  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await getKontaks();
      console.log("Data kontak berhasil dimuat:", response.data); // Log data yang diterima
      setContacts(response.data);
    } catch (error) {
      console.error("Gagal memuat kontak:", error.response || error.message);
      alert('Gagal memuat data kontak dari server. Cek console untuk detail.');
    } finally {
      setIsLoading(false);
    }
  };

  // Memuat kontak saat komponen pertama kali di-mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenModal = (contact = null) => {
    console.log("Membuka modal untuk kontak:", contact); // Log kontak yang akan diedit
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleSaveContact = async (contactToSave) => {
    console.log("Mencoba menyimpan kontak:", contactToSave); // Log data yang akan disimpan
    try {
      if (contactToSave.id) {
        // Edit kontak
        await updateKontak(contactToSave.id, contactToSave);
      } else {
        // Tambah kontak baru
        await createKontak(contactToSave);
      }
      fetchContacts(); // Muat ulang data setelah berhasil
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menyimpan kontak:", error.response || error.message);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
      const errorDetails = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : '';
      alert(`Gagal menyimpan kontak: ${errorMessage}\n${errorDetails}`);
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingContactId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteKontak(deletingContactId);
      fetchContacts(); // Muat ulang data setelah berhasil
      handleCancelDelete();
    } catch (error) {
      console.error("Gagal menghapus kontak:", error.response || error.message);
      alert('Gagal menghapus kontak. Cek console untuk detail.');
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setDeletingContactId(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Kontak HP</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          <FaPlus className="mr-2" />
          Tambah Kontak
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Nama</th>
                <th scope="col" className="px-6 py-3">Nomor HP</th>
                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {contact.nama}
                  </th>
                  <td className="px-6 py-4">{contact.nomor_hp}</td>
                  <td className="px-6 py-4 flex justify-center space-x-4">
                    <button onClick={() => handleOpenModal(contact)} className="text-blue-500 hover:text-blue-700">
                      <FaEdit size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(contact.id)} className="text-red-500 hover:text-red-700">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ContactModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveContact}
        contact={editingContact}
      />
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus kontak ini?"
      />
    </div>
  );
};

export default ManajemenHpPage;
