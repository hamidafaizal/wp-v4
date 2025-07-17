import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../api';
import { FaSave, FaSpinner, FaUserCircle, FaEnvelope, FaEdit } from 'react-icons/fa';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  // State untuk beralih antara mode tampilan dan mode edit
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mengisi form dengan data pengguna saat ini
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.password_confirmation) {
      setError('Konfirmasi password tidak cocok.');
      setIsLoading(false);
      return;
    }

    const dataToUpdate = {
        name: formData.name,
        email: formData.email,
    };

    if (formData.password) {
        dataToUpdate.password = formData.password;
        dataToUpdate.password_confirmation = formData.password_confirmation;
    }

    try {
      const response = await updateUserProfile(dataToUpdate);
      updateUser(response.data.user); 
      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false); // Kembali ke mode tampilan setelah berhasil
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memperbarui profil.';
      const errorDetails = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : '';
      setError(`${errorMessage} ${errorDetails}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p>Memuat...</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-8">Profil Saya</h1>
      
      {isEditing ? (
        // Tampilan Form Edit
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama</label>
            <input
              type="text" name="name" id="name" value={formData.name} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email" name="email" id="email" value={formData.email} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" required
            />
          </div>

          <hr className="border-gray-200 dark:border-gray-600"/>
          <p className="text-sm text-gray-500 dark:text-gray-400">Isi bagian berikut hanya jika Anda ingin mengubah password.</p>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password Baru</label>
            <input
              type="password" name="password" id="password" value={formData.password} onChange={handleChange}
              placeholder="Minimal 8 karakter"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" minLength="8"
            />
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Konfirmasi Password Baru</label>
            <input
              type="password" name="password_confirmation" id="password_confirmation" value={formData.password_confirmation} onChange={handleChange}
              placeholder="Ulangi password baru"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
              {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      ) : (
        // Tampilan Informasi Profil
        <div className="space-y-4">
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{success}</div>}
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FaUserCircle className="text-3xl sm:text-4xl text-gray-400 mr-4" />
                <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nama</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</p>
                </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FaEnvelope className="text-3xl sm:text-4xl text-gray-400 mr-4" />
                <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.email}</p>
                </div>
            </div>
            <div className="text-right mt-6">
                <button onClick={() => { setIsEditing(true); setSuccess(''); }} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <FaEdit className="mr-2" />
                    Ubah Profil
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
