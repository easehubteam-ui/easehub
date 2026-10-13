import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FloatingContact from '../components/common/FloatingContact';
import { PageTransition } from '../components/common/PageTransition';
import CustomerLayout from './CustomerLayout';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  // Keep the authenticated customer shell consistent while browsing public
  // catalog and legal pages; guests continue to use the public site navbar.
  if (isAuthenticated && user?.role === 'customer' && !isAuthPage) {
    return <CustomerLayout />;
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] flex flex-col font-sans relative">
      {/* Global Shared Header Navbar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>

      {!isAuthPage && <FloatingContact />}

      {!isAuthPage && <Footer />}
    </div>
  );
};

export default PublicLayout;
