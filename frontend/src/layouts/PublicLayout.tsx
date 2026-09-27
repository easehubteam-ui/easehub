import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FloatingContact from '../components/common/FloatingContact';
import { CustomerLayout } from './CustomerLayout';
import { useAuth } from '../context/AuthContext';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isCustomerLoggedIn = isAuthenticated && user && user.role !== 'admin' && user.role !== 'superadmin';

  if (isCustomerLoggedIn && location.pathname !== '/login' && location.pathname !== '/register') {
    return <CustomerLayout />;
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] flex flex-col font-sans relative">
      {/* Global Shared Header Navbar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating Animated WhatsApp Contact Button (Bottom-Right) */}
      <FloatingContact />

      {/* Global Shared Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
