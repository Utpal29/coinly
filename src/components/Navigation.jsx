import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const location = window.location;

  return (
    <div className="flex items-center space-x-4">
      <Link
        to="/dashboard"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
          location.pathname === '/dashboard'
            ? 'bg-white/10 text-yellow-400'
            : 'text-gray-300 hover:text-yellow-400 hover:bg-white/5'
        }`}
      >
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </Link>

      <Link
        to="/calendar"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
          location.pathname === '/calendar'
            ? 'bg-white/10 text-yellow-400'
            : 'text-gray-300 hover:text-yellow-400 hover:bg-white/5'
        }`}
      >
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Calendar
      </Link>
    </div>
  );
};

export default Navigation; 