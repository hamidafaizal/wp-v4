import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Links from './pages/Links';
import Batches from './pages/Batches';
import PwaApp from './pages/pwa/PwaApp';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* PWA Route (no auth required) */}
      <Route path="/pwa" element={<PwaApp />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Auth /></AuthRoute>} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/devices" element={<ProtectedRoute><Layout><Devices /></Layout></ProtectedRoute>} />
      <Route path="/links" element={<ProtectedRoute><Layout><Links /></Layout></ProtectedRoute>} />
      <Route path="/batches" element={<ProtectedRoute><Layout><Batches /></Layout></ProtectedRoute>} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;