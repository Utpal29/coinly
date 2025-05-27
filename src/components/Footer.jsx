import React from 'react';

function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-lg border-t border-white/10 py-6 mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Coinly
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400 text-sm">
              Track your finances with ease
            </span>
          </div>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <a 
              href="https://utpal.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Meet the Creator
            </a>
            <a 
              href="/support" 
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 