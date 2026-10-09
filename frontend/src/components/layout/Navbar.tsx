import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { isAdminRole, getFirstAllowedAdminPath } from '../../types';
import { savedApi } from '../../services/savedApi';
import { Heart, Menu, X, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  const scrolledRef = useRef(false);
  const lastScrollY = useRef(0);
  const accumulatedDelta = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // 1. At top of page (< 60px): Always render FULL navbar
      if (currentY < 60) {
        if (scrolledRef.current) {
          scrolledRef.current = false;
          setScrolled(false);
        }
        accumulatedDelta.current = 0;
        lastScrollY.current = currentY;
        return;
      }

      const diff = currentY - lastScrollY.current;

      // Ignore microscopic sub-pixel noise
      if (Math.abs(diff) < 0.5) return;

      // Reset accumulator if scroll direction reverses
      if ((diff > 0 && accumulatedDelta.current < 0) || (diff < 0 && accumulatedDelta.current > 0)) {
        accumulatedDelta.current = 0;
      }

      accumulatedDelta.current += diff;

      // 2. Intentional Directional Scroll Triggers (10px threshold)
      if (accumulatedDelta.current > 10 && !scrolledRef.current) {
        scrolledRef.current = true;
        setScrolled(true);
        accumulatedDelta.current = 0;
      } else if (accumulatedDelta.current < -10 && scrolledRef.current) {
        scrolledRef.current = false;
        setScrolled(false);
        accumulatedDelta.current = 0;
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && user && user.role === 'customer') {
      savedApi
        .getSavedItems()
        .then((items) => {
          if (isMounted) setSavedCount(items.length);
        })
        .catch(() => {
          if (isMounted) setSavedCount(0);
        });
    } else {
      setSavedCount(0);
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, currentPath]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  const homePath = isAuthenticated && user
    ? (isAdminRole(user.role) ? getFirstAllowedAdminPath(user) : '/dashboard')
    : '/';

  const navLinks = [
    { path: homePath, label: 'Home' },
    { path: '/pg', label: 'PG / Hostels' },
    { path: '/meals', label: 'Meals & Mess' },
    { path: '/laundry', label: 'Laundry' },
    { path: '/services', label: 'Services' },
    { path: '/support', label: 'Support' },
  ];

  return (
    <header className="sticky top-3 sm:top-5 z-50 w-full px-4 sm:px-8 max-w-[1420px] mx-auto pointer-events-auto flex justify-end h-[70px] min-h-[70px]">
      {/* SYNCHRONIZED MORPHING NAVBAR CONTAINER (TRANSPARENT BACKGROUND WHEN SCROLLED) */}
      <div
        className={`flex items-center justify-between h-full transition-all duration-300 ease-expo-out ${
          scrolled
            ? 'w-auto bg-transparent border-transparent shadow-none p-0 gap-2.5'
            : 'w-full bg-white rounded-2xl sm:rounded-full border border-[#E5E1D6] px-5 sm:px-8 lg:px-9 py-2 shadow-xs'
        }`}
        style={{ transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* LEFT: Branding (Fades out when scrolled) */}
        <div
          className={`flex items-center shrink-0 transition-all duration-300 ${
            scrolled
              ? 'opacity-0 max-w-0 scale-95 overflow-hidden pointer-events-none mr-0'
              : 'opacity-100 max-w-[280px] scale-100 mr-4'
          }`}
          style={{ transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)' }}
        >
          <Link to={homePath} className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-[#225944] text-[#EECA3A] flex items-center justify-center font-black text-xl shadow-xs border border-[#184232] group-hover:scale-105 transition-transform duration-200">
              E
            </div>
            <div className="flex flex-col justify-center whitespace-nowrap">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#171A18] leading-none group-hover:text-[#225944] transition-colors">
                Ease<span className="text-[#EECA3A]">Hub</span>
              </span>
              <span className="text-[10px] text-[#6B6B63] font-bold tracking-tight hidden sm:block">
                Campus Life Partner
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Navigation Links (Fades out when scrolled) */}
        <div
          className={`hidden xl:flex items-center transition-all duration-300 ${
            scrolled
              ? 'opacity-0 max-w-0 scale-95 overflow-hidden pointer-events-none'
              : 'opacity-100 max-w-[800px] scale-100'
          }`}
          style={{ transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)' }}
        >
          <nav className="flex items-center gap-6 lg:gap-8 text-sm font-bold text-[#171A18] whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-1.5 px-1 transition-all duration-200 text-[15px] tracking-tight ${
                    isActive
                      ? 'text-[#225944] font-extrabold'
                      : 'text-[#171A18] hover:text-[#225944]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#225944] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* RIGHT: Standalone Floating Pill Buttons (No Outer Box Background When Scrolled) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
          {/* Wishlist Button */}
          {isAuthenticated && user?.role === 'customer' && (
            <button
              type="button"
              onClick={() => navigate('/wishlist')}
              className={`rounded-full transition-all relative ${
                scrolled
                  ? 'p-2.5 bg-white border border-[#E5E1D6] text-[#171A18] shadow-md hover:bg-[#F7F5EF]'
                  : 'p-2 text-[#171A18] hover:bg-[#F7F5EF] hover:text-rose-600'
              }`}
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>
          )}

          {/* User Account / Auth Pill */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 rounded-full text-xs font-bold transition-all ${
                  scrolled
                    ? 'px-4 py-2 bg-white border border-[#E5E1D6] text-[#171A18] shadow-md hover:bg-[#F7F5EF]'
                    : 'px-4 py-2 border border-[#E5E1D6] bg-[#F7F5EF] text-[#171A18] hover:bg-[#EBE7DC] shadow-2xs'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#225944] text-[#EECA3A] font-black text-[10px] flex items-center justify-center">
                  {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B6B63]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-52 bg-white rounded-2xl shadow-xl border border-[#E5E1D6] p-1.5 z-50 text-xs font-semibold space-y-0.5">
                  <div className="px-3 py-2 border-b border-[#E5E1D6]/70">
                    <p className="font-bold text-[#171A18] truncate">{user?.name || 'Resident'}</p>
                    <p className="text-[10px] text-[#6B6B63] truncate">{user?.email}</p>
                  </div>
                  <Link
                    to={isAdminRole(user.role) ? getFirstAllowedAdminPath(user) : '/dashboard'}
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-[#171A18] hover:bg-[#F7F5EF] transition-colors"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'customer' && (
                    <>
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-3 py-2 rounded-xl text-[#171A18] hover:bg-[#F7F5EF] transition-colors"
                      >
                        Account &amp; Settings
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-3 py-2 rounded-xl text-[#171A18] hover:bg-[#F7F5EF] transition-colors"
                      >
                        My Bookings
                      </Link>
                    </>
                  )}
                  <div className="pt-1 border-t border-[#E5E1D6]/70">
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
            <>
              {/* Contact Us Standalone Pill */}
              <Link
                to="/support"
                className={`rounded-full font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  scrolled
                    ? 'px-5 py-2.5 bg-white/95 backdrop-blur-md text-[#171A18] border border-[#E5E1D6] shadow-md hover:bg-[#F7F5EF] active:scale-95'
                    : 'px-4 py-2 bg-[#F7F5EF] text-[#171A18] border border-[#E5E1D6]/80 hover:bg-[#EBE7DC] active:scale-95'
                }`}
              >
                Contact Us
              </Link>

              {/* Sign Up Primary Standalone Pill */}
              <Link
                to="/register"
                className={`rounded-full bg-[#171A18] hover:bg-[#225944] text-white font-extrabold text-xs sm:text-sm transition-all active:scale-95 whitespace-nowrap ${
                  scrolled ? 'px-5 py-2.5 shadow-md' : 'px-5 py-2 shadow-xs hover:shadow-md'
                }`}
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Circular Menu Icon Button (≡) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#171A18] text-white flex items-center justify-center hover:bg-[#225944] transition-all shadow-md active:scale-95 shrink-0 ${
              scrolled ? 'flex' : 'flex xl:hidden'
            }`}
            aria-label="Toggle Navigation Menu"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* DRAWER MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`mt-2 bg-white border border-[#E5E1D6] rounded-[24px] p-4 shadow-2xl space-y-1.5 text-sm font-bold text-[#171A18] absolute top-full right-4 sm:right-8 ${
              scrolled ? 'w-64' : 'w-72'
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl transition-colors ${
                  currentPath === link.path
                    ? 'bg-[#225944] text-white font-extrabold'
                    : 'hover:bg-[#F7F5EF] text-[#171A18]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="pt-2 border-t border-[#E5E1D6]">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-center bg-[#F7F5EF] text-[#171A18] font-bold"
                >
                  Log in
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
