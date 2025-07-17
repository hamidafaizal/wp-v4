import React, { useState, useEffect, useCallback } from 'react';
import BatchCard from '../components/BatchCard.jsx';
import { FaShareAlt, FaSpinner } from 'react-icons/fa';
import { getDistribusiState, setupBatches, distributeLinks, updateBatch, logSentLinks } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const DistribusiLinkPage = () => {
  const [linksInGudang, setLinksInGudang] = useState(0);
  const [batches, setBatches] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Fungsi untuk mengambil semua data dari backend
  const fetchState = useCallback(async () => {
    try {
      const response = await getDistribusiState();
      const { linksInGudang, batches, contacts } = response.data;
      setLinksInGudang(linksInGudang);
      setBatches(batches);
      setContacts(contacts);
    } catch (error) {
      console.error("Gagal memuat state distribusi:", error);
      alert("Gagal memuat data dari server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Panggil fetchState saat komponen pertama kali dimuat
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Fungsi untuk mengatur ulang batch saat jumlah HP diubah
  const handleSetupBatches = async (e) => {
    const jumlahHp = parseInt(e.target.value, 10);
    if (isNaN(jumlahHp) || jumlahHp < 0) return;

    setIsSettingUp(true);
    try {
      await setupBatches(jumlahHp);
      await fetchState(); // Muat ulang state setelah berhasil
    } catch (error) {
      console.error("Gagal mengatur batch:", error);
      alert("Gagal mengatur ulang batch.");
    } finally {
      setIsSettingUp(false);
    }
  };

  // Fungsi untuk membagikan link dari gudang ke batch
  const handleDistributeLinks = async () => {
    setIsLoading(true);
    try {
      await distributeLinks();
      await fetchState(); // Muat ulang state setelah berhasil
    } catch (error) {
      console.error("Gagal mendistribusikan link:", error);
      alert("Gagal mendistribusikan link.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menugaskan kontak ke batch
  const handleAssignContact = async (batchId, contactId) => {
    try {
      await updateBatch(batchId, { kontak_id: contactId });
      await fetchState();
    } catch (error) {
      console.error(`Gagal menugaskan kontak ke batch ${batchId}:`, error);
      alert("Gagal memperbarui batch.");
    }
  };

  // Fungsi untuk memperbarui kapasitas batch
  const handleUpdateKapasitas = async (batchId, newKapasitas) => {
    try {
      await updateBatch(batchId, { kapasitas: newKapasitas });
      // Tidak perlu fetchState() di sini agar tidak mengganggu input user lain
    } catch (error) {
      console.error(`Gagal memperbarui kapasitas batch ${batchId}:`, error);
      alert("Gagal memperbarui kapasitas batch.");
      fetchState(); // Muat ulang jika gagal untuk sinkronisasi
    }
  };
  
  // Fungsi untuk mencatat link yang terkirim
  const handleSendSuccess = async (batchId) => {
    try {
      await logSentLinks(batchId);
      await fetchState();
    } catch (error) {
      console.error(`Gagal mencatat link terkirim untuk batch ${batchId}:`, error);
      alert("Gagal mencatat link terkirim.");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Distribusi Link</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Atur jumlah HP, bagi link, lalu kirimkan ke kontak Anda.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 gap-6">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Link di Gudang</h3>
          <p className="text-3xl font-bold text-blue-500">{linksInGudang}</p>
        </div>

        <div className="text-center sm:text-left relative">
          <label htmlFor="jumlah-hp" className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Jumlah HP
          </label>
          <div className="flex items-center">
            <input
              type="number"
              id="jumlah-hp"
              defaultValue={batches.length}
              onBlur={handleSetupBatches} // Panggil API saat fokus hilang
              className="mt-1 block w-full sm:w-24 px-3 py-2 text-center text-xl font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
              min="0"
              disabled={isSettingUp}
            />
            {isSettingUp && <FaSpinner className="animate-spin ml-2 text-blue-500" />}
          </div>
        </div>

        <button
          onClick={handleDistributeLinks}
          disabled={linksInGudang === 0 || isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FaShareAlt className="mr-3" />
          Bagi Link ke Batch
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {batches.map(batch => (
          <BatchCard
            key={batch.id}
            batch={batch}
            contacts={contacts}
            onAssignContact={handleAssignContact}
            onUpdateKapasitas={handleUpdateKapasitas}
            onSendSuccess={handleSendSuccess}
          />
        ))}
      </div>
    </div>
  );
};

export default DistribusiLinkPage;
