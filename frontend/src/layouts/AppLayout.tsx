import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingContact from '../components/common/FloatingContact';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="min-h-screen bg-[#171A18] text-white flex flex-col relative">
      {/* Top Application Bar */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/dashboard" className="flex items-center gap-2 font-extrabold text-xl text-[#225944]">
          <img src="/logo.png" alt="EaseHub Logo" className="w-8 h-8 rounded-lg object-cover border border-[#EECA3A]/30" />
          <span className="text-white">
            Ease<span className="text-[#EECA3A]">Hub App</span>
          </span>
        </Link>

        <div className="flex items-center space-x-4 text-xs font-bold">
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="px-3 py-1.5 rounded-xl bg-[#EECA3A] text-[#171A18] hover:bg-[#e2be2d] font-extrabold transition-all shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>EaseHub Admin Console</span>
            </Link>
          )}

          <span className="text-white/80">{user?.name || user?.email}</span>

          <button
            onClick={() => logout()}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold transition border border-rose-500/30"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main App Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Floating Animated WhatsApp Contact Button (Bottom-Right) */}
      <FloatingContact />
    </div>
  );
};

export default AppLayout;
