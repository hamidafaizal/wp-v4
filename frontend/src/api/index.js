import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Auth
export const register = (data) => apiClient.post('/register', data);
export const login = (credentials) => apiClient.post('/login', credentials);
export const logout = () => apiClient.post('/logout');
export const getUser = () => apiClient.get('/user');

// Devices
export const getDevices = () => apiClient.get('/devices');
export const generateDeviceToken = () => apiClient.post('/devices/generate-token');
export const registerDevice = (data) => apiClient.post('/devices', data);
export const deleteDevice = (id) => apiClient.delete(`/devices/${id}`);

// Batches
export const getBatches = () => apiClient.get('/batches');
export const createBatch = (data) => apiClient.post('/batches', data);
export const updateBatch = (id, data) => apiClient.put(`/batches/${id}`, data);
export const sendBatchToPwa = (id) => apiClient.post(`/batches/${id}/send`);
export const deleteBatch = (id) => apiClient.delete(`/batches/${id}`);

// Links
export const getLinks = () => apiClient.get('/links');
export const createLinks = (data) => apiClient.post('/links', data);
export const uploadLinks = (formData) => apiClient.post('/links/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteLink = (id) => apiClient.delete(`/links/${id}`);

// PWA
export const getPwaBatches = (deviceToken) => apiClient.post('/pwa/batches', { device_token: deviceToken });
export const updateLinkStatus = (data) => apiClient.post('/pwa/links/update-status', data);
export const completeBatch = (data) => apiClient.post('/pwa/batches/complete', data);

export default apiClient;