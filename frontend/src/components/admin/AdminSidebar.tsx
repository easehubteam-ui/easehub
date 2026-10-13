import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminPermissionKey } from '../../types';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarNavItem {
  label: string;
  path: string;
  icon: string;
  permission?: AdminPermissionKey;
  superAdminOnly?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { logout, isSuperAdmin, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const navCategories: { group: string; items: SidebarNavItem[] }[] = [
    {
      group: 'Overview',
      items: [
        {
          label: 'Dashboard Overview',
          path: '/admin/dashboard',
          icon: 'dashboard',
          permission: 'dashboard',
        },
      ],
    },
    {
      group: 'Operations',
      items: [
        { label: 'Bookings', path: '/admin/bookings', icon: 'calendar_month', permission: 'bookings' },
        { label: 'Payments', path: '/admin/payments', icon: 'payments', permission: 'payments' },
        { label: 'Users', path: '/admin/users', icon: 'group', permission: 'users' },
        { label: 'Vendors', path: '/admin/vendors', icon: 'storefront', permission: 'vendors' },
      ],
    },
    {
      group: 'Services',
      items: [
        { label: 'PG / Hostels', path: '/admin/pg', icon: 'night_shelter', permission: 'pg' },
        { label: 'Meals & Mess', path: '/admin/meals', icon: 'restaurant', permission: 'meals' },
        { label: 'Laundry', path: '/admin/laundry', icon: 'local_laundry_service', permission: 'laundry' },
        { label: 'Extra Services', path: '/admin/services', icon: 'handyman', permission: 'services' },
      ],
    },
    {
      group: 'Customer',
      items: [
        { label: 'Community Chat', path: '/admin/community', icon: 'forum', permission: 'community' },
        { label: 'Live Support & Chat', path: '/admin/support', icon: 'chat', permission: 'support' },
        { label: 'Reviews', path: '/admin/reviews', icon: 'star', permission: 'reviews' },
        { label: 'Complaints', path: '/admin/complaints', icon: 'support_agent', permission: 'complaints' },
        { label: 'Notifications', path: '/admin/notifications', icon: 'notifications', permission: 'notifications' },
      ],
    },
    {
      group: 'Business & System',
      items: [
        { label: 'Sub Admin', path: '/admin/subadmins', icon: 'admin_panel_settings', superAdminOnly: true },
        { label: 'Reports & Revenue', path: '/admin/reports', icon: 'bar_chart', permission: 'reports' },
        { label: 'System Settings', path: '/admin/settings', icon: 'settings', permission: 'settings' },
        { label: 'Activity Logs', path: '/admin/activity-logs', icon: 'receipt_long', permission: 'activity_logs' },
      ],
    },
  ];

  const visibleCategories = navCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        if (item.superAdminOnly) return isSuperAdmin;
        if (item.permission) return hasPermission(item.permission);
        return true;
      }),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#ffffff] text-[#191c1a] z-50 flex flex-col justify-between shadow-xl border-r border-[#E5E1D6] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full min-h-0 py-4 px-3">
          {/* Header Branding */}
          <div className="flex flex-col gap-2 px-2 pb-3 border-b border-[#E5E1D6]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#225944] flex items-center justify-center text-white shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[24px]">apartment</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg text-[#225944] tracking-tight">EaseHub</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#EECA3A] text-[#171A18] text-[9px] font-extrabold uppercase">
                      {isSuperAdmin ? 'SUPER ADMIN' : 'SUB ADMIN'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6B6B63] font-medium">Campus Living Suite</span>
                </div>
              </div>

              <button onClick={onClose} className="lg:hidden text-[#6B6B63] hover:text-[#171A18]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Nav Categories List */}
          <nav className="flex-1 overflow-y-auto pr-1 py-3 space-y-3 custom-scrollbar">
            {visibleCategories.map((cat) => (
              <div key={cat.group} className="space-y-0.5">
                {cat.group !== 'Overview' && (
                  <span className="px-3 py-1 text-[10px] font-extrabold uppercase text-[#6B6B63] tracking-wider block">
                    {cat.group}
                  </span>
                )}
                {cat.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#225944] text-white shadow-sm font-bold'
                          : 'text-[#404944] hover:bg-[#EDEEEB] hover:text-[#191c1a]'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined text-[18px] shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer Admin Status Card */}
          <div className="p-3 bg-[#F3F4F0] rounded-xl flex items-center justify-between border border-[#E5E1D6]">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-[#6B6B63]">Campus Node</span>
              <span className="text-xs font-extrabold text-[#171A18]">v2.4.8 Central</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#225944] animate-pulse"></span>
          </div>

          <div className="pt-2 border-t border-[#E5E1D6] mt-2 flex items-center justify-between text-xs">
            <NavLink to="/" target="_blank" className="text-[#225944] font-bold hover:underline">
              View Website ↗
            </NavLink>
            <button onClick={handleLogout} className="text-rose-600 font-bold hover:underline">
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
