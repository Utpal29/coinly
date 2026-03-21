import { Link } from 'react-router-dom'
import { User, LifeBuoy } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white/[0.02] backdrop-blur-lg border-t border-white/[0.06] mt-6">
      {/* Gold gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-xs sm:text-sm">
              © {new Date().getFullYear()} Coinly
            </span>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">
              Track your finances with ease
            </span>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <a
              href="https://utpal.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-yellow-400 transition-colors duration-200 text-sm flex items-center py-1 px-1"
            >
              <User className="w-4 h-4 mr-1.5" />
              Creator
            </a>
            <Link
              to="/support"
              className="text-gray-500 hover:text-yellow-400 transition-colors duration-200 text-sm flex items-center py-1 px-1"
            >
              <LifeBuoy className="w-4 h-4 mr-1.5" />
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
