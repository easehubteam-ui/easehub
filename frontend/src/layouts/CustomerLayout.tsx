import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingContact from '../components/common/FloatingContact';
import { savedApi } from '../services/savedApi';
import { PageTransition } from '../components/common/PageTransition';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(0);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    let isMounted = true;
    if (user && user.role === 'customer') {
      savedApi.getSavedItems().then((items) => {
        if (isMounted) setSavedCount(items.length);
      }).catch(() => {
        if (isMounted) setSavedCount(0);
      });
    } else {
      setSavedCount(0);
    }
    return () => { isMounted = false; };
  }, [user, currentPath]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] flex flex-col font-sans relative pb-20 md:pb-0">
      {/* App-like Top Navigation Bar for Logged-In Customers */}
      <header className="sticky top-3 z-40 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto my-2 pointer-events-auto transition-all duration-300">
        <div className="w-full rounded-full px-4 sm:px-6 py-2 bg-white/50 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] flex items-center justify-between gap-4 transition-all duration-300">
          
          {/* Logo Branding */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="EaseHub Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-xs border border-[#E5E1D6] group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#225944] leading-none">
                Ease<span className="text-[#EECA3A]">Hub</span>
              </span>
              <span className="text-[10px] text-[#4F7A65] font-bold tracking-wider uppercase hidden sm:inline">
                Student Living App
              </span>
            </div>
          </Link>



          {/* Desktop App Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold">
            <Link
              to="/dashboard"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                currentPath === '/dashboard'
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/pg"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                currentPath === '/pg'
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">domain</span>
              <span>PG / Hostel</span>
            </Link>

            <Link
              to="/meals"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                currentPath === '/meals'
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
              <span>Meals</span>
            </Link>

            <Link
              to="/laundry"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                currentPath === '/laundry'
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">local_laundry_service</span>
              <span>Laundry</span>
            </Link>

            <Link
              to="/services"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                currentPath === '/services'
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span>Services</span>
            </Link>

            <Link
              to="/bookings"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                currentPath === '/bookings'
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>My Bookings</span>
            </Link>
          </nav>

          {/* Right Header Icons & Profile Avatar */}
          <div className="flex items-center gap-3">
            {/* Wishlist Heart Icon */}
            <Link
              to="/wishlist"
              className="p-2 sm:p-2.5 rounded-xl bg-[#F7F5EF] hover:bg-[#E5E1D6] text-[#171A18] transition relative flex items-center justify-center border border-[#E5E1D6]"
              title="Saved Wishlist"
            >
              <span className="material-symbols-outlined text-[20px] text-rose-500">favorite</span>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#225944] text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Notifications Bell Icon */}
            <Link
              to="/account?tab=notifications"
              className="p-2 sm:p-2.5 rounded-xl bg-[#F7F5EF] hover:bg-[#E5E1D6] text-[#171A18] transition relative flex items-center justify-center border border-[#E5E1D6]"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EECA3A] text-[#171A18] font-black text-[10px] flex items-center justify-center shadow-xs">
                3
              </span>
            </Link>

            {/* User Profile Avatar Button */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-[#E5E1D6] bg-white hover:bg-[#F7F5EF] transition shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-[#225944] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-bold text-xs text-[#171A18] max-w-[100px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#6B6B63]">expand_more</span>
              </button>

              {/* User Account Dropdown Menu */}
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
                    to="/bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#225944]">calendar_month</span>
                    <span>My Bookings</span>
                  </Link>

                  <Link
                    to="/payment"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#225944]">qr_code_scanner</span>
                    <span>Make Payment</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition"
                  >
                    <span className="material-symbols-outlined text-[18px] text-rose-500">favorite</span>
                    <span>Saved Wishlist</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold text-[#715d00] bg-[#EECA3A]/20 hover:bg-[#EECA3A]/30 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      <span>Admin Console</span>
                    </Link>
                  )}

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
          </div>
        </div>
      </header>

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>

      {/* Floating Animated WhatsApp Contact Button */}
      <FloatingContact />

      {/* Mobile Bottom Navigation Bar (Fixed for App Feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E1D6] px-2 py-2 shadow-lg flex items-center justify-around">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            currentPath === '/dashboard' ? 'text-[#225944] font-bold' : 'text-[#6B6B63]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          to="/pg"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            currentPath === '/pg' ? 'text-[#225944] font-bold' : 'text-[#6B6B63]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">domain</span>
          <span className="text-[10px]">PG</span>
        </Link>

        <Link
          to="/meals"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            currentPath === '/meals' ? 'text-[#225944] font-bold' : 'text-[#6B6B63]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">restaurant</span>
          <span className="text-[10px]">Meals</span>
        </Link>

        <Link
          to="/laundry"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            currentPath === '/laundry' ? 'text-[#225944] font-bold' : 'text-[#6B6B63]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">local_laundry_service</span>
          <span className="text-[10px]">Laundry</span>
        </Link>

        <Link
          to="/account"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            currentPath.includes('/account') || currentPath === '/bookings' ? 'text-[#225944] font-bold' : 'text-[#6B6B63]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">person</span>
          <span className="text-[10px]">Account</span>
        </Link>
      </div>
    </div>
  );
};

export default CustomerLayout;
