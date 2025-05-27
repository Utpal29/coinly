import React from 'react';

function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              Support Coinly
            </h1>
            <p className="text-gray-300 mb-8">
              If you find Coinly helpful, consider buying me a coffee to support the development!
            </p>
            
            <a
              href="https://buymeacoffee.com/utpal29"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-medium rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 9.5c.28 0 .5.22.5.5v2c0 .28-.22.5-.5.5H19v6.5c0 .83-.67 1.5-1.5 1.5h-13c-.83 0-1.5-.67-1.5-1.5v-13C3 4.67 3.67 4 4.5 4h13c.83 0 1.5.67 1.5 1.5V9h1.5zM8 13h8v-1.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5v4c0 .28-.22.5-.5.5h-3c-.28 0-.5-.22-.5-.5V15H8v-2z"/>
              </svg>
              Buy Me a Coffee
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support; 