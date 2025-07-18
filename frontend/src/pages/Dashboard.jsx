import React, { useState, useEffect } from 'react';
import { getBatches, getLinks, getDevices } from '../api';
import { FaLink, FaMobileAlt, FaBox, FaCheckCircle } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalDevices: 0,
    totalBatches: 0,
    completedBatches: 0,
  });
  const [recentBatches, setRecentBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linksRes, devicesRes, batchesRes] = await Promise.all([
          getLinks(),
          getDevices(),
          getBatches(),
        ]);

        const links = linksRes.data;
        const devices = devicesRes.data;
        const batches = batchesRes.data;

        setStats({
          totalLinks: links.length,
          totalDevices: devices.length,
          totalBatches: batches.length,
          completedBatches: batches.filter(b => b.status === 'completed').length,
        });

        setRecentBatches(batches.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Links', value: stats.totalLinks, icon: <FaLink />, color: 'bg-blue-500' },
    { title: 'Perangkat PWA', value: stats.totalDevices, icon: <FaMobileAlt />, color: 'bg-green-500' },
    { title: 'Total Batch', value: stats.totalBatches, icon: <FaBox />, color: 'bg-purple-500' },
    { title: 'Batch Selesai', value: stats.completedBatches, icon: <FaCheckCircle />, color: 'bg-orange-500' },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pending' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terkirim' },
      processing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Diproses' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Ringkasan sistem distribusi PWA</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg text-white text-xl mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Batches */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Batch Terbaru</h2>
        </div>
        <div className="p-6">
          {recentBatches.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada batch</p>
          ) : (
            <div className="space-y-4">
              {recentBatches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{batch.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {batch.device?.name || 'Belum ditugaskan'} • {batch.processed_links}/{batch.total_links} link
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(batch.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;