import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCar, FiUser, FiLogOut, FiMenu, FiX, FiSettings } = FiIcons;

const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Directory', href: '/directory' },
    { name: 'Blog', href: '/blog' },
    { name: 'Register', href: '/register' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <SafeIcon icon={FiCar} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">GT86Aero.com</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Owners Club</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-red-600'
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  <SafeIcon icon={FiUser} className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-red-600"
                  >
                    <SafeIcon icon={FiSettings} className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  <SafeIcon icon={FiLogOut} className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            <SafeIcon icon={mobileMenuOpen ? FiX : FiMenu} className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <nav className="space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium ${
                    location.pathname === item.href
                      ? 'text-red-600'
                      : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700"
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-700"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-red-600"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;