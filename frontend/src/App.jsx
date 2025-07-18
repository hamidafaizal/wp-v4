import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

// Components
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';

// Halaman (Lazy Loaded)
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ManajemenHpPage = lazy(() => import('./pages/ManajemenHpPage.jsx'));
const RisetPage = lazy(() => import('./pages/RisetPage.jsx'));
const DistribusiLinkPage = lazy(() => import('./pages/DistribusiLinkPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
// Impor halaman baru
const ManajemenPerangkatPage = lazy(() => import('./pages/ManajemenPerangkatPage.jsx'));

// Halaman PWA (Impor Standar)
import PwaLoginPage from './pages/pwa/PwaLoginPage.jsx';
import PwaChatPage from './pages/pwa/PwaChatPage.jsx';


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
      <Routes>
        {/* Rute untuk halaman PWA (tanpa layout utama) */}
        <Route path="/pwa" element={<PwaLoginPage />} />
        <Route path="/chat" element={<PwaChatPage />} />

        {/* Rute lain menggunakan Suspense untuk lazy loading */}
        <Route
          path="/*"
          element={
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
                  {/* Tambahkan rute baru di sini */}
                  <Route path="/manajemen-perangkat" element={<ProtectedRoute><ManajemenPerangkatPage /></ProtectedRoute>} />
                  <Route path="/riset" element={<ProtectedRoute><RisetPage /></ProtectedRoute>} />
                  <Route path="/distribusi-link" element={<ProtectedRoute><DistribusiLinkPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  {/* Arahkan path root dan path tidak dikenal */}
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Route>
              </Routes>
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;
