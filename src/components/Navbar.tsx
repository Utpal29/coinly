import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  UserCircle,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavLink {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function Navbar() {
  const { user } = useAuthContext();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getPageTitle = (): string => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/insights') return 'Insights';
    if (path === '/profile') return 'Profile';
    if (path === '/add-transaction') return 'Add Transaction';
    if (path.includes('/edit-transaction')) return 'Edit Transaction';
    return 'Coinly';
  };

  const navLinks: NavLink[] = [
    {
      to: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
    },
    {
      to: '/calendar',
      icon: <Calendar className="h-5 w-5" />,
      label: 'Calendar',
    },
    {
      to: '/insights',
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Insights',
    },
    {
      to: '/profile',
      icon: <UserCircle className="h-5 w-5" />,
      label: 'Profile',
    },
    {
      to: '/add-transaction',
      icon: <PlusCircle className="h-5 w-5" />,
      label: 'Add Transaction',
    },
  ];

  return (
    <nav className="bg-white/[0.04] backdrop-blur-2xl border-b border-white/[0.08] shadow-lg">
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
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Coinly
              </span>
            </Link>
            <div
              className={`ml-8 hidden md:flex items-center transform transition-all duration-500 ${
                isVisible
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-4 opacity-0'
              }`}
            >
              <span className="text-lg font-medium text-gray-200">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-label={link.label}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-yellow-400 bg-yellow-400/[0.08] shadow-[0_0_10px_rgba(250,204,21,0.1)] border border-yellow-400/[0.15]'
                    : 'text-gray-400 hover:text-yellow-400 hover:bg-white/[0.06] border border-transparent'
                }`}
                title={link.label}
              >
                {link.icon}
              </Link>
            ))}
            <div className="h-6 w-px bg-white/[0.08] mx-2" />
            <div
              className={`flex items-center transform transition-all duration-500 ${
                isVisible
                  ? 'translate-x-0 opacity-100'
                  : 'translate-x-4 opacity-0'
              }`}
            >
              <span className="text-sm text-gray-400">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-xl text-gray-400 hover:text-yellow-400 hover:bg-white/[0.06] focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white/[0.03] backdrop-blur-2xl border-t border-white/[0.06]">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-label={link.label}
              className={`flex items-center px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                location.pathname === link.to
                  ? 'text-yellow-400 bg-yellow-400/[0.08] border border-yellow-400/[0.15]'
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-white/[0.06] border border-transparent'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mr-3">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <div className="px-3 py-2 text-sm text-gray-500 border-t border-white/[0.06] mt-2">
            {user?.user_metadata?.full_name || user?.email}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
