import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaTachometerAlt, 
  FaMobileAlt, 
  FaLink, 
  FaUpload,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <FaTachometerAlt />, text: 'Dashboard', to: '/dashboard' },
    { icon: <FaMobileAlt />, text: 'Perangkat PWA', to: '/devices' },
    { icon: <FaUpload />, text: 'Upload Links', to: '/links' },
    { icon: <FaLink />, text: 'Batch Management', to: '/batches' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative flex flex-col bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out z-30 w-64 min-h-screen ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">PWA Distribution</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-2">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-2 rounded-lg ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.text}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 p-2 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-2 text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FaBars />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">PWA Distribution</h1>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;