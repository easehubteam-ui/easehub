import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle, title }) => {
  const { user, logout, isSuperAdmin, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-[#E5E1D6] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl bg-[#F3F4F0] text-[#171A18] hover:bg-[#EDEEEB] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {title && <h1 className="text-lg font-extrabold text-[#171A18] tracking-tight">{title}</h1>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Live system status pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Online</span>
        </div>

        {/* Notifications toggle */}
        {hasPermission('notifications') && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-[#F3F4F0] hover:bg-[#EDEEEB] text-[#171A18] relative transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E1D6] p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6] mb-3">
                  <h4 className="text-xs font-bold text-[#171A18]">System Notifications</h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Live</span>
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/admin/notifications');
                  }}
                  className="w-full py-1.5 rounded-xl bg-[#F3F4F0] hover:bg-[#EDEEEB] text-xs text-[#225944] font-bold text-center transition-colors"
                >
                  Open Broadcast Notifications
                </button>
              </div>
            )}
          </div>
        )}

        {/* Profile menu dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F3F4F0] transition-colors border border-transparent hover:border-[#E5E1D6]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#225944] text-[#EECA3A] font-bold flex items-center justify-center text-xs border border-[#EECA3A]/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#171A18] leading-none">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-[#6B6B63] font-semibold mt-0.5">
                {isSuperAdmin ? 'Super Admin' : 'Sub Admin'}
              </p>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#6B6B63]">expand_more</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E5E1D6] p-2 z-50">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/admin/profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#171A18] hover:bg-[#F3F4F0] font-semibold transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[16px] text-[#225944]">person</span>
                <span>Admin Profile</span>
              </button>

              {isSuperAdmin && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/admin/subadmins');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#171A18] hover:bg-[#F3F4F0] font-semibold transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#225944]">admin_panel_settings</span>
                  <span>Sub Admin Management</span>
                </button>
              )}

              {hasPermission('settings') && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#171A18] hover:bg-[#F3F4F0] font-semibold transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#225944]">settings</span>
                  <span>System Settings</span>
                </button>
              )}

              <div className="my-1 border-t border-[#E5E1D6]"></div>

              <button
                onClick={async () => {
                  setShowProfileMenu(false);
                  await logout();
                  navigate('/admin/login', { replace: true });
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
