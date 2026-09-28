import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { savedApi } from '../../services/savedApi';
import { Search, Heart, User, LogIn, Menu, X, ChevronDown, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
    { path: '/support', label: 'Help' },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3 transition-all duration-300">
      <div
        className={`max-w-7xl w-full mx-auto rounded-full bg-white/95 backdrop-blur-md border border-[#E5E1D6] transition-all duration-300 ${
          scrolled ? 'shadow-md py-2.5 px-5' : 'shadow-sm py-3 px-6'
        } flex items-center justify-between gap-4`}
      >
        {/* Left: Logo & Tagline */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img
            src="/logo.jpg"
            alt="EaseHub Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-xs border border-[#E5E1D6] group-hover:scale-105 transition-transform duration-200"
          />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#225944] leading-none">
              Ease<span className="text-[#EECA3A]">Hub</span>
            </span>
            <span className="text-[10px] text-[#6B6B63] font-semibold tracking-wide hidden sm:block">
              Your Campus Life Partner
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#171A18]">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#225944] text-white shadow-xs font-extrabold'
                    : 'text-[#6B6B63] hover:text-[#171A18] hover:bg-[#F7F5EF]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Trigger */}
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
            className="p-2.5 rounded-full bg-[#F7F5EF] hover:bg-[#E5E1D6] text-[#171A18] transition-colors border border-[#E5E1D6] flex items-center justify-center shadow-xs"
            title="Search EaseHub"
          >
            <Search className="w-4 h-4 text-[#225944]" />
          </button>

          {/* Wishlist Heart Button */}
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
            title="View Wishlist"
            className={`p-2.5 rounded-full border transition-all shadow-xs flex items-center justify-center relative ${
              currentPath === '/wishlist' || currentPath === '/saved'
                ? 'bg-[#225944] text-[#EECA3A] border-[#225944]'
                : 'bg-[#F7F5EF] border-[#E5E1D6] text-[#171A18] hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <Heart className="w-4 h-4 fill-current text-rose-500" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                {savedCount}
              </span>
            )}
          </button>

          {/* Profile / Authentication Button */}
          {isAuthenticated && user?.role === 'customer' ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-[#E5E1D6] bg-white hover:bg-[#F7F5EF] transition shadow-xs"
              >
                <div className="w-8 h-8 rounded-full bg-[#225944] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-[#171A18] max-w-[90px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B6B63]" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E1D6] p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#E5E1D6] mb-1">
                    <p className="text-xs font-bold text-[#171A18]">{user?.name || 'Resident'}</p>
                    <p className="text-[10px] text-[#6B6B63] truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    <User className="w-4 h-4 text-[#225944]" />
                    <span>My Account</span>
                  </Link>

                  <Link
                    to="/bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    <Sparkles className="w-4 h-4 text-[#225944]" />
                    <span>My Bookings</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Saved Wishlist</span>
                  </Link>

                  <div className="pt-1 border-t border-[#E5E1D6]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-[#225944] hover:bg-[#174532] text-white text-xs font-extrabold shadow-sm transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#EECA3A]" />
              <span>Login / Sign Up</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full border border-[#E5E1D6] text-[#171A18] hover:bg-[#F7F5EF]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2 bg-white rounded-3xl border border-[#E5E1D6] p-4 shadow-xl flex flex-col gap-2 font-bold text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2.5 px-4 rounded-2xl ${
                currentPath === link.path ? 'bg-[#225944] text-white' : 'text-[#171A18] hover:bg-[#F7F5EF]'
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
