import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

function Navbar() {
  const { user } = useAuthContext();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/insights') return 'Insights';
    if (path === '/profile') return 'Profile';
    if (path === '/add-transaction') return 'Add Transaction';
    if (path.includes('/edit-transaction')) return 'Edit Transaction';
    return 'Coinly';
  };

  const navLinks = [
    {
      to: '/dashboard',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Dashboard'
    },
    {
      to: '/insights',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'Insights'
    },
    {
      to: '/profile',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile'
    },
    {
      to: '/add-transaction',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      label: 'Add Transaction'
    }
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 group transition-transform duration-200 hover:scale-105"
            >
              <img
                src="/logo.png"
                alt="Coinly Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Coinly
              </span>
            </Link>
            <div className={`ml-8 hidden md:flex items-center transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
              <span className="text-lg font-medium text-gray-200">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10'
                }`}
                title={link.label}
              >
                {link.icon}
              </Link>
            ))}
            <div className="h-6 w-px bg-gray-600" />
            <div className={`flex items-center transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
              <span className="text-sm text-gray-300">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white/5 backdrop-blur-lg">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                location.pathname === link.to
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mr-3">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <div className="px-3 py-2 text-sm text-gray-300 border-t border-gray-600/30 mt-2">
            {user?.user_metadata?.full_name || user?.email}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 