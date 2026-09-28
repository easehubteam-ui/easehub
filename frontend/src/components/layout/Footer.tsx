import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full bg-[#131715] text-[#A3A8A4] pt-14 pb-8 font-sans border-t border-[#232925]">
      {/* Right accent highlight bar matching reference image */}
      <div className="absolute top-0 right-0 w-1.5 h-full bg-[#EECA3A]"></div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-10">
          
          {/* Brand Info & Locality Pills */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="EaseHub Logo"
                className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Ease<span className="text-[#EECA3A]">Hub</span>
              </span>
            </Link>

            <p className="text-xs text-[#A3A8A4] max-w-sm leading-relaxed">
              Simplifying accommodation, verified meals, and laundry services for college students & young working professionals across Chhattisgarh.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-xs font-semibold text-[#D4D8D5]">Popular hubs:</span>
              <div className="flex items-center gap-1.5">
                <Link to="/pg" className="px-3 py-1 rounded-md bg-[#232925] hover:bg-[#2F3732] text-xs font-medium text-white transition-colors">
                  Bhilai
                </Link>
                <Link to="/pg" className="px-3 py-1 rounded-md bg-[#232925] hover:bg-[#2F3732] text-xs font-medium text-white transition-colors">
                  Raipur
                </Link>
                <Link to="/pg" className="px-3 py-1 rounded-md bg-[#232925] hover:bg-[#2F3732] text-xs font-medium text-white transition-colors">
                  Durg
                </Link>
              </div>
            </div>
          </div>

          {/* Stay & Living */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              STAY & LIVING
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/pg" className="hover:text-[#EECA3A] transition-colors">
                  Boys Hostels & PGs
                </Link>
              </li>
              <li>
                <Link to="/pg" className="hover:text-[#EECA3A] transition-colors">
                  Girls Hostels & PGs
                </Link>
              </li>
              <li>
                <Link to="/pg" className="hover:text-[#EECA3A] transition-colors">
                  Single Room Rentals
                </Link>
              </li>
            </ul>
          </div>

          {/* Food & Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              FOOD & SERVICES
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/meals" className="hover:text-[#EECA3A] transition-colors">
                  Daily Mess Service
                </Link>
              </li>
              <li>
                <Link to="/meals" className="hover:text-[#EECA3A] transition-colors">
                  Monthly Tiffin Plans
                </Link>
              </li>
              <li>
                <Link to="/laundry" className="hover:text-[#EECA3A] transition-colors">
                  Doorstep Laundry
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              SUPPORT & TRUST
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="tel:+916201614778" className="hover:text-[#EECA3A] transition-colors flex items-center gap-1.5">
                  <span>📞 Call: +91 6201614778</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/916201614778?text=Hello%20EaseHub%20Support" target="_blank" rel="noopener noreferrer" className="hover:text-[#EECA3A] transition-colors flex items-center gap-1.5">
                  <span>💬 WhatsApp: +91 6201614778</span>
                </a>
              </li>
              <li>
                <Link to="/support" className="hover:text-[#EECA3A] transition-colors">
                  Contact Support Center
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Line & Copyright */}
        <div className="pt-6 border-t border-[#232925] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#828884]">
          <p>© {new Date().getFullYear()} EaseHub Technologies. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link to="/support" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/support" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
