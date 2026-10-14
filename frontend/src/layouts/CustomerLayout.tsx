import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServiceExperience } from '../context/ServiceExperienceContext';
import FloatingContact from '../components/common/FloatingContact';
import { savedApi } from '../services/savedApi';
import { PageTransition } from '../components/common/PageTransition';
import { Menu, X } from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings: serviceSettings } = useServiceExperience();
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const isPathActive = (path: string) =>
    currentPath === path || currentPath.startsWith(`${path}/`);
  const isNotificationsPage =
    currentPath === '/account' && new URLSearchParams(location.search).get('tab') === 'notifications';
  const accountNavLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
      isActive ? 'bg-[#225944] text-white' : 'text-[#171A18] hover:bg-[#F7F5EF]'
    }`;
  const accountNavIconClass = (isActive: boolean, defaultColor = 'text-[#225944]') =>
    `material-symbols-outlined text-[20px] ${isActive ? 'text-white' : defaultColor}`;

  const [accountSidebarOpen, setAccountSidebarOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(0);
  const accountSidebarTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setAccountSidebarOpen(false);
  }, [location.key]);

  useEffect(() => {
    if (!accountSidebarOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setAccountSidebarOpen(false);
      accountSidebarTriggerRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [accountSidebarOpen]);

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
  }, [user?.id]);

  const handleLogout = async () => {
    setAccountSidebarOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] flex flex-col font-sans relative pb-20 xl:pb-0">
      {/* App-like Top Navigation Bar for Logged-In Customers */}
      <header className="sticky top-3 z-40 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto my-2 pointer-events-auto transition-all duration-300">
        <div className="w-full rounded-full px-4 sm:px-6 py-2 glass-navbar flex items-center justify-between gap-4 transition-all duration-300">
          
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
          <nav className="hidden xl:flex items-center gap-6 text-xs sm:text-sm font-bold">
            <Link
              to="/dashboard"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                isPathActive('/dashboard')
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
                isPathActive('/pg')
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">domain</span>
              <span>PG / Hostel</span>
            </Link>

            {(serviceSettings ? Boolean(serviceSettings.new_meals_enabled || serviceSettings.old_meals_enabled) : true) && <Link
              to="/meals"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                isPathActive('/meals')
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
              <span>Meals</span>
            </Link>}

            {(serviceSettings ? Boolean(serviceSettings.new_laundry_enabled || serviceSettings.old_laundry_enabled) : true) && <Link
              to="/laundry"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                isPathActive('/laundry')
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">local_laundry_service</span>
              <span>Laundry</span>
            </Link>}

            {(serviceSettings ? Boolean(serviceSettings.extra_services_enabled) : true) && <Link
              to="/services"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                isPathActive('/services')
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span>Services</span>
            </Link>}

            <Link
              to="/bookings"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                isPathActive('/bookings')
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>My Bookings</span>
            </Link>

            <Link
              to="/community"
              className={`py-2 transition-all flex items-center gap-1.5 ${
                isPathActive('/community')
                  ? 'text-[#225944] border-b-2 border-[#225944]'
                  : 'text-[#6B6B63] hover:text-[#171A18]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">forum</span>
              <span>Community</span>
            </Link>
          </nav>

          {/* Right Header Icons & Profile Avatar */}
          <div className="flex items-center gap-3">
            {/* Wishlist Heart Icon */}
            <Link
              to="/wishlist"
              className="hidden sm:flex p-2 sm:p-2.5 rounded-xl bg-[#F7F5EF] hover:bg-[#E5E1D6] text-[#171A18] transition relative items-center justify-center border border-[#E5E1D6]"
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
              className="hidden sm:flex p-2 sm:p-2.5 rounded-xl bg-[#F7F5EF] hover:bg-[#E5E1D6] text-[#171A18] transition relative items-center justify-center border border-[#E5E1D6]"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EECA3A] text-[#171A18] font-black text-[10px] flex items-center justify-center shadow-xs">
                3
              </span>
            </Link>

            {/* Account sidebar trigger; profile details live in the sidebar. */}
            <button
              type="button"
              ref={accountSidebarTriggerRef}
              onClick={() => setAccountSidebarOpen(true)}
              aria-label="Open account sidebar"
              aria-expanded={accountSidebarOpen}
              aria-controls="customer-account-sidebar"
              title="Account menu"
              className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-[#F7F5EF] text-[#171A18] transition border border-[#E5E1D6] shadow-xs"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {accountSidebarOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Close account sidebar"
            onClick={() => setAccountSidebarOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <aside
            id="customer-account-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Account sidebar"
            className="absolute inset-y-0 right-0 flex w-[min(22rem,90vw)] flex-col border-l border-[#E5E1D6] bg-white p-5 shadow-2xl animate-in slide-in-from-right duration-200"
          >
            <div className="flex items-center justify-between border-b border-[#E5E1D6] pb-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#6B6B63]">Your account</p>
                <h2 className="mt-1 text-lg font-black text-[#225944]">EaseHub</h2>
              </div>
              <button
                type="button"
                onClick={() => setAccountSidebarOpen(false)}
                aria-label="Close account sidebar"
                className="rounded-xl border border-[#E5E1D6] p-2 text-[#171A18] transition hover:bg-[#F7F5EF]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#F7F5EF] p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#225944] text-sm font-black text-white">
                {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#171A18]">{user?.name || 'Student Resident'}</p>
                <p className="truncate text-xs text-[#6B6B63]">{user?.email}</p>
              </div>
            </div>

            <nav aria-label="Account navigation" className="mt-5 flex-1 space-y-1 overflow-y-auto">
              <Link
                to="/account"
                onClick={() => setAccountSidebarOpen(false)}
                className={accountNavLinkClass(isPathActive('/account') && !isNotificationsPage)}
              >
                <span className={accountNavIconClass(isPathActive('/account') && !isNotificationsPage)}>account_circle</span>
                My Account
              </Link>
              <Link
                to="/account?tab=notifications"
                onClick={() => setAccountSidebarOpen(false)}
                className={accountNavLinkClass(isNotificationsPage)}
              >
                <span className={accountNavIconClass(isNotificationsPage)}>notifications</span>
                Notifications
              </Link>
              <Link
                to="/bookings"
                onClick={() => setAccountSidebarOpen(false)}
                className={accountNavLinkClass(isPathActive('/bookings') || isPathActive('/booking/confirmation'))}
              >
                <span className={accountNavIconClass(isPathActive('/bookings') || isPathActive('/booking/confirmation'))}>calendar_month</span>
                My Bookings
              </Link>
              <Link
                to="/payment"
                onClick={() => setAccountSidebarOpen(false)}
                className={accountNavLinkClass(isPathActive('/payment'))}
              >
                <span className={accountNavIconClass(isPathActive('/payment'))}>qr_code_scanner</span>
                Make Payment
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setAccountSidebarOpen(false)}
                className={accountNavLinkClass(isPathActive('/wishlist'))}
              >
                <span className={accountNavIconClass(isPathActive('/wishlist'), 'text-rose-500')}>favorite</span>
                Saved Wishlist{savedCount > 0 ? ` (${savedCount})` : ''}
              </Link>
              <Link
                to="/community"
                onClick={() => setAccountSidebarOpen(false)}
                className={accountNavLinkClass(isPathActive('/community'))}
              >
                <span className={accountNavIconClass(isPathActive('/community'))}>forum</span>
                Community Support
              </Link>
              <Link
                to="/support/chat"
                onClick={() => setAccountSidebarOpen(false)}
                className={accountNavLinkClass(isPathActive('/support/chat'))}
              >
                <span className={accountNavIconClass(isPathActive('/support/chat'))}>support_agent</span>
                Admin Support Chat
              </Link>
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center gap-3 rounded-xl border-t border-[#E5E1D6] px-3 py-4 text-left text-sm font-extrabold text-rose-600 transition hover:bg-rose-50"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Log Out
            </button>
          </aside>
        </div>
      )}

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>

      {/* Floating Animated WhatsApp Contact Button */}
      <FloatingContact />

      {/* Mobile Bottom Navigation Bar (Fixed for App Feel) */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E1D6] px-2 py-2 shadow-lg flex items-center justify-around">
        <Link
          to="/dashboard"
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition ${
            isPathActive('/dashboard') ? 'text-[#225944] font-bold' : 'text-[#6B6B63]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          to="/pg"
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition ${
            isPathActive('/pg') ? 'text-[#225944] font-bold' : 'text-[#6B6B63]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">domain</span>
          <span className="text-[10px]">PG</span>
        </Link>

        {(serviceSettings?.new_meals_enabled || serviceSettings?.old_meals_enabled) && <Link
          to="/meals"
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition ${
            isPathActive('/meals') ? 'text-[#225944] font-bold' : 'text-[#6B6B63]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">restaurant</span>
          <span className="text-[10px]">Meals</span>
        </Link>}

        {(serviceSettings?.new_laundry_enabled || serviceSettings?.old_laundry_enabled) && <Link
          to="/laundry"
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition ${
            isPathActive('/laundry') ? 'text-[#225944] font-bold' : 'text-[#6B6B63]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">local_laundry_service</span>
          <span className="text-[10px]">Laundry</span>
        </Link>}

        <Link
          to="/account"
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition ${
            isPathActive('/account') || isPathActive('/bookings') || isPathActive('/booking/confirmation') ? 'text-[#225944] font-bold' : 'text-[#6B6B63]'
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
