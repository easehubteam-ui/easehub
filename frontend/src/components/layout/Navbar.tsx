import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { savedApi } from '../../services/savedApi';
import { Search, Heart, User, LogIn, Menu, X, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && user && user.role === 'customer') {
      savedApi.getSavedItems().then((items) => {
        if (isMounted) setSavedCount(items.length);
      }).catch(() => {
        if (isMounted) setSavedCount(0);
      });
    } else {
      setSavedCount(0);
    }
    return () => { isMounted = false; };
  }, [isAuthenticated, user, currentPath]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/pg', label: 'PG / Hostels' },
    { path: '/meals', label: 'Meals & Mess' },
    { path: '/laundry', label: 'Laundry' },
    { path: '/services', label: 'Extra Services' },
    { path: '/support', label: 'Support' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white border-b border-[#E5E1D6] transition-shadow duration-200 ${
        scrolled ? 'shadow-xs' : ''
      }`}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo.png"
            alt="EaseHub Logo"
            className="w-9 h-9 rounded-xl object-cover border border-[#E5E1D6]"
          />
          <span className="text-xl font-extrabold tracking-tight text-[#225944]">
            Ease<span className="text-[#EECA3A]">Hub</span>
          </span>
        </Link>

        {/* Center: Clean Marketplace Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#171A18]">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#225944] text-white font-bold'
                    : 'text-[#6B6B63] hover:text-[#171A18] hover:bg-[#F7F5EF]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Saved, Account */}
        <div className="flex items-center gap-2">
          
          {/* Quick Search */}
          <button
            type="button"
            onClick={() => {
              const searchInput = document.getElementById('hero-search-input');
              if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                navigate('/pg');
              }
            }}
            className="p-2 rounded-lg text-[#6B6B63] hover:text-[#171A18] hover:bg-[#F7F5EF] transition"
            title="Search listings"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated || !user) {
                navigate('/login');
              } else if (user.role === 'admin' || user.role === 'superadmin') {
                navigate('/admin/dashboard');
              } else {
                navigate('/wishlist');
              }
            }}
            aria-label="Saved Wishlist"
            className="p-2 rounded-lg text-[#6B6B63] hover:text-rose-600 hover:bg-[#F7F5EF] transition relative"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* User Account / Login */}
          {isAuthenticated && user?.role === 'customer' ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E1D6] hover:bg-[#F7F5EF] text-xs font-bold text-[#171A18] transition"
              >
                <div className="w-6 h-6 rounded-full bg-[#225944] text-white font-extrabold text-[10px] flex items-center justify-center">
                  {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B6B63]" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-[#E5E1D6] p-1.5 z-50 text-xs font-semibold space-y-0.5">
                  <div className="px-3 py-2 border-b border-[#E5E1D6]">
                    <p className="font-bold text-[#171A18] truncate">{user?.name || 'Resident'}</p>
                    <p className="text-[10px] text-[#6B6B63] truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-2 rounded-lg text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    My Account &amp; Profile
                  </Link>
                  <Link
                    to="/bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-2 rounded-lg text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-2 rounded-lg text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    Saved Wishlist
                  </Link>

                  <div className="pt-1 border-t border-[#E5E1D6]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-rose-600 font-bold hover:bg-rose-50 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#EECA3A]" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#171A18] hover:bg-[#F7F5EF]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5E1D6] px-4 py-3 space-y-1 text-sm font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-lg ${
                currentPath === link.path ? 'bg-[#225944] text-white font-bold' : 'text-[#171A18] hover:bg-[#F7F5EF]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
