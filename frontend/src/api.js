import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// --- Auth ---
export const registerUser = (data) => apiClient.post('/register', data);
export const loginUser = (credentials) => apiClient.post('/login', credentials);
export const logoutUser = () => apiClient.post('/logout');
export const getUser = () => apiClient.get('/user');
export const updateUserProfile = (data) => apiClient.put('/user/profile', data);


// --- Kontak ---
export const getKontaks = () => apiClient.get('/kontak');
export const createKontak = (kontakData) => apiClient.post('/kontak', kontakData);
export const updateKontak = (id, kontakData) => apiClient.put(`/kontak/${id}`, kontakData);
export const deleteKontak = (id) => apiClient.delete(`/kontak/${id}`);

// --- Riset ---
export const uploadRisetFiles = (formData) => {
  return apiClient.post('/riset/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// --- Distribusi ---
export const getDistribusiState = () => apiClient.get('/distribusi/state');
export const setupBatches = (jumlahHp) => apiClient.post('/distribusi/setup-batches', { jumlah_hp: jumlahHp });
export const distributeLinks = () => apiClient.post('/distribusi/distribute');
export const updateBatch = (batchId, data) => apiClient.put(`/distribusi/batch/${batchId}`, data);
export const getBatchLinks = (batchId) => apiClient.get(`/distribusi/batch/${batchId}/links`);
export const markBatchAsSent = (batchId) => apiClient.post('/distribusi/mark-sent', { batch_id: batchId });

// --- Dashboard ---
export const forceRestartSystem = () => apiClient.post('/dashboard/force-restart');
export const getDashboardHistory = () => apiClient.get('/dashboard/history');

// --- PWA ---
export const getBatchesForDevice = (deviceToken) => apiClient.post('/pwa/batches', { device_token: deviceToken });
export const generatePerangkatPwaToken = () => apiClient.post('/perangkat-pwa/generate-token');


export default apiClient;
