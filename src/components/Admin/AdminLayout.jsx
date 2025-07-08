import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiSettings, FiEdit3, FiUsers, FiCode, FiMenu, FiX } = FiIcons;

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Site Settings', href: '/admin/settings', icon: FiSettings },
    { name: 'Blog Posts', href: '/admin/blog', icon: FiEdit3 },
    { name: 'Members', href: '/admin/members', icon: FiUsers },
    { name: 'Code Snippets', href: '/admin/snippets', icon: FiCode },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <SafeIcon icon={FiX} className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-red-50 text-red-600 border-r-2 border-red-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SafeIcon icon={item.icon} className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <SafeIcon icon={FiHome} className="h-4 w-4 mr-2" />
            Back to Site
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <SafeIcon icon={FiMenu} className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">GT86 Aero Admin</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;