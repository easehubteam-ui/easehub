import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FloatingContact from '../components/common/FloatingContact';
import { PageTransition } from '../components/common/PageTransition';

export const PublicLayout: React.FC = () => {
  const location = useLocation();

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

      {/* Floating Animated WhatsApp Contact Button (Bottom-Right) */}
      <FloatingContact />

      {/* Global Shared Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
