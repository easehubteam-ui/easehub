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
    <header className="sticky top-3 z-50 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto my-2 pointer-events-auto transition-all duration-300">
      <div
        className={`w-full rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 transition-all duration-300 ${
          scrolled ? 'glass-navbar-scrolled' : 'glass-navbar'
        }`}
      >
        {/* Left: Brand Logo & Tagline */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/logo.png"
            alt="EaseHub Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-[#E5E1D6] shadow-2xs group-hover:scale-105 transition-transform duration-200"
          />
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black tracking-tight text-[#225944] leading-none">
              Ease<span className="text-[#EECA3A]">Hub</span>
            </span>
            <span className="text-[10px] text-[#6B6B63] font-semibold tracking-tight hidden sm:block">
              Your Campus Life Partner
            </span>
          </div>
        </Link>

        {/* Center: Clean Floating Pill Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-[#171A18]">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#225944] text-white font-extrabold shadow-xs'
                    : 'text-[#171A18] hover:text-[#225944] hover:bg-black/5 hover:-translate-y-0.5 active:scale-95'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Quick Actions & Login Pill Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Button */}
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
            className="p-2 rounded-full text-[#171A18] hover:bg-black/5 hover:text-[#225944] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            title="Search listings"
          >
            <Search className="w-4 h-4" />
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
            className="p-2 rounded-full text-[#171A18] hover:bg-black/5 hover:text-rose-600 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 relative"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-xs">
                {savedCount}
              </span>
            )}
          </button>

          {/* User Account / Login Pill */}
          {isAuthenticated && user?.role === 'customer' ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E5E1D6] bg-white hover:bg-[#F7F5EF] hover:-translate-y-0.5 active:scale-95 text-xs font-bold text-[#171A18] transition-all duration-200 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-[#225944] text-white font-black text-[10px] flex items-center justify-center">
                  {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B6B63]" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#E5E1D6] p-1.5 z-50 text-xs font-semibold space-y-0.5 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#E5E1D6]">
                    <p className="font-bold text-[#171A18] truncate">{user?.name || 'Resident'}</p>
                    <p className="text-[10px] text-[#6B6B63] truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-[#171A18] hover:bg-[#F7F5EF] transition-colors"
                  >
                    My Account &amp; Profile
                  </Link>
                  <Link
                    to="/bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-[#171A18] hover:bg-[#F7F5EF] transition-colors"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-[#171A18] hover:bg-[#F7F5EF] transition-colors"
                  >
                    Saved Wishlist
                  </Link>

                  <div className="pt-1 border-t border-[#E5E1D6]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 font-bold hover:bg-rose-50 transition-colors"
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
              className="px-4 sm:px-5 py-2 rounded-full bg-[#225944] hover:bg-[#184232] text-white text-xs font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#EECA3A]" />
              <span>Login / Sign Up</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-[#171A18] hover:bg-black/5 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-white/75 backdrop-blur-xl border border-white/60 rounded-3xl p-3 space-y-1 text-sm font-semibold shadow-xl animate-in fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-full ${
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
