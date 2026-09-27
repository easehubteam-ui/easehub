import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { savedApi } from '../../services/savedApi';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(0);

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E1D6] text-[#171A18] shadow-xs">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Logo Branding */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/logo.jpg"
            alt="EaseHub Logo"
            className="w-10 h-10 rounded-xl object-cover shadow-xs border border-[#E5E1D6] group-hover:scale-105 transition-transform duration-200"
          />
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tight text-[#225944] leading-none">
              Ease<span className="text-[#EECA3A]">Hub</span>
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
          <Link
            to="/"
            className={`py-2 transition-all ${
              currentPath === '/'
                ? 'text-[#171A18] font-bold border-b-2 border-[#225944]'
                : 'text-[#6B6B63] hover:text-[#171A18]'
            }`}
          >
            Home
          </Link>

          <Link
            to="/pg"
            className={`py-2 transition-all ${
              currentPath === '/pg'
                ? 'text-[#171A18] font-bold border-b-2 border-[#225944]'
                : 'text-[#6B6B63] hover:text-[#171A18]'
            }`}
          >
            PG / Hostel
          </Link>

          <Link
            to="/meals"
            className={`py-2 transition-all ${
              currentPath === '/meals'
                ? 'text-[#171A18] font-bold border-b-2 border-[#225944]'
                : 'text-[#6B6B63] hover:text-[#171A18]'
            }`}
          >
            Meals
          </Link>

          <Link
            to="/laundry"
            className={`py-2 transition-all ${
              currentPath === '/laundry'
                ? 'text-[#171A18] font-bold border-b-2 border-[#225944]'
                : 'text-[#6B6B63] hover:text-[#171A18]'
            }`}
          >
            Laundry
          </Link>

          <div
            className="relative group"
            onMouseEnter={() => setServicesDropdownOpen(true)}
            onMouseLeave={() => setServicesDropdownOpen(false)}
          >
            <Link
              to="/services"
              className={`py-2 transition-colors flex items-center gap-1 ${
                currentPath === '/services'
                  ? 'text-[#171A18] font-bold border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span>Services</span>
              <svg className="w-3.5 h-3.5 text-[#6B6B63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {/* Dropdown Menu */}
            {servicesDropdownOpen && (
              <div className="absolute top-full left-0 w-52 bg-white rounded-xl shadow-xl border border-[#E5E1D6] p-2 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95">
                <Link
                  to="/services"
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-[#171A18] hover:bg-[#F7F5EF] transition-colors"
                >
                  🛠️ All Maintenance Services
                </Link>
                <Link
                  to="/services"
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-[#171A18] hover:bg-[#F7F5EF] transition-colors"
                >
                  🧹 Room Deep Cleaning
                </Link>
                <Link
                  to="/meals"
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-[#171A18] hover:bg-[#F7F5EF] transition-colors"
                >
                  🍲 Daily Tiffin Subscriptions
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/support"
            className={`py-2 transition-all ${
              currentPath === '/support'
                ? 'text-[#171A18] font-bold border-b-2 border-[#225944]'
                : 'text-[#6B6B63] hover:text-[#171A18]'
            }`}
          >
            Help
          </Link>
        </nav>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">


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
            aria-label="Wishlist"
            title="View Wishlist"
            className={`p-2.5 rounded-xl border transition-colors shadow-xs flex items-center justify-center relative ${
              currentPath === '/wishlist' || currentPath === '/saved'
                ? 'bg-[#225944] text-[#EECA3A] border-[#225944]'
                : 'bg-white border-[#E5E1D6] text-[#171A18] hover:text-red-500 hover:border-red-300'
            }`}
          >
            <svg className="w-4 h-4 fill-current" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EECA3A] text-[#171A18] font-bold text-[10px] flex items-center justify-center shadow-xs">
                {savedCount}
              </span>
            )}
          </button>

          {/* Dynamic User Authentication State */}
          {isAuthenticated && user?.role === 'customer' && currentPath !== '/login' && currentPath !== '/register' ? (
            /* Logged-In User Profile Button & Dropdown */
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-[#E5E1D6] bg-white hover:bg-[#F7F5EF] transition shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-[#225944] text-white font-extrabold text-xs flex items-center justify-center">
                  {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#171A18] truncate max-w-[110px]">
                    {user?.name || 'My Account'}
                  </span>
                  <span className="text-[10px] text-[#225944] font-semibold">Account</span>
                </div>
                <svg className="w-4 h-4 text-[#6B6B63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E1D6] p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#E5E1D6] mb-1">
                    <p className="text-xs font-bold text-[#171A18]">{user?.name || 'Student Resident'}</p>
                    <p className="text-[10px] text-[#6B6B63] truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#225944]">account_circle</span>
                    <span>My Account</span>
                  </Link>

                  <Link
                    to="/account?tab=bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#225944]">calendar_month</span>
                    <span>My Bookings &amp; Orders</span>
                  </Link>

                  <Link
                    to="/account?tab=payments"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#225944]">account_balance_wallet</span>
                    <span>Payments &amp; Escrow</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#225944]">favorite</span>
                    <span>Saved PGs &amp; Messes</span>
                  </Link>

                  <div className="pt-1 border-t border-[#E5E1D6]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest Buttons */
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-[#E5E1D6] bg-white text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition-all shadow-xs"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Get Started</span>
              </Link>
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-[#E5E1D6] text-[#171A18] hover:bg-[#F7F5EF]"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E1D6] px-4 py-4 flex flex-col gap-3 font-semibold text-sm animate-in slide-in-from-top-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`py-2 px-3 rounded-lg ${currentPath === '/' ? 'bg-[#225944] text-white font-bold' : 'text-[#171A18] hover:bg-[#F7F5EF]'}`}
          >
            Home
          </Link>
          <Link
            to="/pg"
            onClick={() => setMobileMenuOpen(false)}
            className={`py-2 px-3 rounded-lg ${currentPath === '/pg' ? 'bg-[#225944] text-white font-bold' : 'text-[#171A18] hover:bg-[#F7F5EF]'}`}
          >
            PG / Hostel
          </Link>
          <Link
            to="/meals"
            onClick={() => setMobileMenuOpen(false)}
            className={`py-2 px-3 rounded-lg ${currentPath === '/meals' ? 'bg-[#225944] text-white font-bold' : 'text-[#171A18] hover:bg-[#F7F5EF]'}`}
          >
            Meals
          </Link>
          <Link
            to="/laundry"
            onClick={() => setMobileMenuOpen(false)}
            className={`py-2 px-3 rounded-lg ${currentPath === '/laundry' ? 'bg-[#225944] text-white font-bold' : 'text-[#171A18] hover:bg-[#F7F5EF]'}`}
          >
            Laundry
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className={`py-2 px-3 rounded-lg ${currentPath === '/services' ? 'bg-[#225944] text-white font-bold' : 'text-[#171A18] hover:bg-[#F7F5EF]'}`}
          >
            Services
          </Link>

          {isAuthenticated && user?.role === 'customer' && (
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-[#171A18] hover:bg-[#F7F5EF] flex items-center justify-between font-bold"
            >
              <span>My Account</span>
              <span className="material-symbols-outlined text-[18px] text-[#225944]">account_circle</span>
            </Link>
          )}

          <div className="pt-2 border-t border-[#E5E1D6] flex items-center gap-3">
            {isAuthenticated && user?.role === 'customer' ? (
              <button
                onClick={handleLogout}
                className="flex-1 py-2 text-center rounded-xl bg-rose-500/10 text-rose-700 text-xs font-bold"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl border border-[#E5E1D6] text-xs font-bold text-[#171A18]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-[#EECA3A] text-xs font-bold text-[#171A18]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
