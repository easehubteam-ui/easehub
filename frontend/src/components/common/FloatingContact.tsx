import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const FloatingContact: React.FC = () => {
  const location = useLocation();

  // If user is already on the support page, hide floating button to avoid redundancy
  if (location.pathname === '/support') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
      <Link
        to="/support"
        aria-label="Contact Us & Support"
        title="Go to Contact Us & Help Center"
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#225944] hover:bg-[#194434] text-white shadow-xl hover:shadow-2xl border-2 border-[#EECA3A] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <div className="relative flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px] text-[#EECA3A]">support_agent</span>
          {/* Subtle static WhatsApp green dot badge */}
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-[#225944] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          </span>
        </div>
        
        <div className="flex flex-col text-left pr-1">
          <span className="text-xs font-bold tracking-wide text-white leading-none">Contact Us</span>
          <span className="text-[10px] text-[#EECA3A] font-semibold mt-0.5 leading-none">Help &amp; WhatsApp</span>
        </div>

        <span className="material-symbols-outlined text-[16px] text-white/80 group-hover:translate-x-0.5 transition-transform">
          chevron_right
        </span>
      </Link>
    </div>
  );
};

export default FloatingContact;
