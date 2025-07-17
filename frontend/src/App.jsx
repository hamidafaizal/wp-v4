import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

// Components
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ThemeToggle from './components/ThemeToggle.jsx'; // Asumsi tombol tema dipisah

// Halaman (Lazy Loaded)
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ManajemenHpPage = lazy(() => import('./pages/ManajemenHpPage.jsx'));
const RisetPage = lazy(() => import('./pages/RisetPage.jsx'));
const DistribusiLinkPage = lazy(() => import('./pages/DistribusiLinkPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));

// Komponen untuk rute yang dilindungi
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Komponen untuk rute otentikasi (login/register)
const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <ThemeToggle />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Rute untuk halaman yang tidak memerlukan login */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
          </Route>

          {/* Rute untuk halaman yang memerlukan login */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/manajemen-hp" element={<ProtectedRoute><ManajemenHpPage /></ProtectedRoute>} />
            <Route path="/riset" element={<ProtectedRoute><RisetPage /></ProtectedRoute>} />
            <Route path="/distribusi-link" element={<ProtectedRoute><DistribusiLinkPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            {/* Arahkan path root dan path tidak dikenal */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
