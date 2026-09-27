import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedHub, setSelectedHub] = useState('Bhilai & Durg Central Hub');

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navCategories = [
    {
      group: 'Overview',
      items: [{ label: 'Dashboard Overview', path: '/admin/dashboard', icon: 'dashboard' }],
    },
    {
      group: 'Operations',
      items: [
        { label: 'Bookings', path: '/admin/bookings', icon: 'calendar_month' },
        { label: 'Payments', path: '/admin/payments', icon: 'payments' },
        { label: 'Users', path: '/admin/users', icon: 'group' },
        { label: 'Vendors', path: '/admin/vendors', icon: 'storefront' },
      ],
    },
    {
      group: 'Services',
      items: [
        { label: 'PG / Hostels', path: '/admin/pg', icon: 'night_shelter' },
        { label: 'Meals & Mess', path: '/admin/meals', icon: 'restaurant' },
        { label: 'Laundry', path: '/admin/laundry', icon: 'local_laundry_service' },
        { label: 'Extra Services', path: '/admin/services', icon: 'handyman' },
      ],
    },
    {
      group: 'Customer',
      items: [
        { label: 'Reviews', path: '/admin/reviews', icon: 'star' },
        { label: 'Complaints', path: '/admin/complaints', icon: 'support_agent' },
        { label: 'Notifications', path: '/admin/notifications', icon: 'notifications' },
      ],
    },
    {
      group: 'Business & System',
      items: [
        { label: 'Reports & Revenue', path: '/admin/reports', icon: 'bar_chart' },
        { label: 'System Settings', path: '/admin/settings', icon: 'settings' },
        { label: 'Activity Logs', path: '/admin/activity-logs', icon: 'receipt_long' },
      ],
    },
  ];

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
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6B6B63] font-medium">Campus Living Suite</span>
                </div>
              </div>

              <button onClick={onClose} className="lg:hidden text-[#6B6B63] hover:text-[#171A18]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Campus Node Switcher Dropdown */}
            <div className="flex items-center gap-2 bg-[#F3F4F0] px-3 py-1.5 rounded-xl mt-1 border border-[#E5E1D6]">
              <span className="material-symbols-outlined text-[#225944] text-[18px]">location_city</span>
              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#171A18] focus:outline-none cursor-pointer w-full"
              >
                <option value="Bhilai & Durg Central Hub">Bhilai & Durg Central Hub</option>
                <option value="Raipur East Campus Hub">Raipur East Campus Hub</option>
                <option value="Naya Raipur Technology Node">Naya Raipur Tech Node</option>
              </select>
            </div>
          </div>

          {/* Nav Categories List */}
          <nav className="flex-1 overflow-y-auto pr-1 py-3 space-y-3 custom-scrollbar">
            {navCategories.map((cat) => (
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
