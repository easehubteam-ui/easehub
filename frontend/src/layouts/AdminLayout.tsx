import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { PageTransition } from '../components/common/PageTransition';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Extract human-friendly title from pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard' || path === '/admin') return 'Overview Dashboard';
    if (path === '/admin/users') return 'User Management';
    if (path === '/admin/vendors') return 'Vendor Management';
    if (path === '/admin/bookings') return 'Bookings Management';
    if (path === '/admin/payments') return 'Payments & Transactions';
    if (path === '/admin/pg') return 'PG & Hostel Management';
    if (path === '/admin/meals') return 'Meals & Mess Management';
    if (path === '/admin/laundry') return 'Laundry Service Management';
    if (path === '/admin/services') return 'Maintenance & Services';
    if (path === '/admin/reviews') return 'Ratings & Reviews Moderation';
    if (path === '/admin/community') return 'Community Chat & Moderation';
    if (path === '/admin/support') return 'Support Desk & Community Moderation';
    if (path === '/admin/subadmins') return 'Sub Admin Management';
    if (path === '/admin/complaints') return 'Complaints & Support Tickets';
    if (path === '/admin/notifications') return 'Broadcast Notifications';
    if (path === '/admin/reports') return 'Reports & Analytics';
    if (path === '/admin/activity-logs') return 'System Activity Logs';
    if (path === '/admin/settings') return 'System Settings';
    if (path === '/admin/profile') return 'Admin Profile';
    return 'Admin Console';
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] font-sans antialiased text-[#171A18] flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} title={getPageTitle()} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 w-full max-w-[1536px]">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>

        <footer className="py-4 px-6 border-t border-[#E5E1D6] bg-white text-center text-xs text-[#6B6B63]">
          EaseHub Admin Platform v2.0 • Secure Infrastructure • &copy; {new Date().getFullYear()} EaseHub Technologies.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
