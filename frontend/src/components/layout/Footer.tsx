import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full bg-[#F7F5EF] text-[#171A18] pt-12 pb-16 font-sans">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* 5-Column Navigation Grid matching Jitter layout: clean on mobile, perfect on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-10 sm:gap-10 pb-16">
          {/* Column 1: Stay & Living */}
          <div>
            <h4 className="text-[16px] sm:text-[18px] font-bold text-[#171A18] mb-3 sm:mb-4">
              Stay & Living
            </h4>
            <ul className="space-y-3 text-sm text-[#55554E]">
              <li>
                <Link to="/pg" className="hover:text-[#171A18] transition-colors block">
                  Boys Hostels & PGs
                </Link>
              </li>
              <li>
                <Link to="/pg" className="hover:text-[#171A18] transition-colors block">
                  Girls Hostels & PGs
                </Link>
              </li>
              <li>
                <Link to="/pg" className="hover:text-[#171A18] transition-colors block">
                  Single Room Rentals
                </Link>
              </li>
              <li>
                <Link to="/pg" className="hover:text-[#171A18] transition-colors block">
                  Verified Properties
                </Link>
              </li>
              <li>
                <Link to="/pg" className="hover:text-[#171A18] transition-colors block">
                  Zero Brokerage
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Meals & Mess */}
          <div>
            <h4 className="text-[16px] sm:text-[18px] font-bold text-[#171A18] mb-3 sm:mb-4">
              Meals & Mess
            </h4>
            <ul className="space-y-3 text-sm text-[#55554E]">
              <li>
                <Link to="/meals" className="hover:text-[#171A18] transition-colors block">
                  Daily Mess Service
                </Link>
              </li>
              <li>
                <Link to="/meals" className="hover:text-[#171A18] transition-colors block">
                  Monthly Tiffin Plans
                </Link>
              </li>
              <li>
                <Link to="/meals" className="hover:text-[#171A18] transition-colors block">
                  Pure Veg Options
                </Link>
              </li>
              <li>
                <Link to="/meals" className="hover:text-[#171A18] transition-colors block">
                  Vacation Meal Pause
                </Link>
              </li>
              <li>
                <Link to="/meals" className="hover:text-[#171A18] transition-colors block">
                  Hostel Gate Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="text-[16px] sm:text-[18px] font-bold text-[#171A18] mb-3 sm:mb-4">
              Services
            </h4>
            <ul className="space-y-3 text-sm text-[#55554E]">
              <li>
                <Link to="/laundry" className="hover:text-[#171A18] transition-colors block">
                  Doorstep Laundry
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#171A18] transition-colors block">
                  Room Deep Cleaning
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#171A18] transition-colors block">
                  Repairs & Electrician
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#171A18] transition-colors block">
                  Bicycle & Rentals
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#171A18] transition-colors block">
                  Campus Moving Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="text-[16px] sm:text-[18px] font-bold text-[#171A18] mb-3 sm:mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-[#55554E]">
              <li>
                <Link to="/about" className="hover:text-[#171A18] transition-colors block">
                  About EaseHub
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-[#171A18] transition-colors block">
                  Terms & conditions
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-[#171A18] transition-colors block">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-[#171A18] transition-colors block">
                  Owner Verification ↗
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-[#171A18] transition-colors block">
                  Campus Ambassador ↗
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Connect */}
          <div>
            <h4 className="text-[16px] sm:text-[18px] font-bold text-[#171A18] mb-3 sm:mb-4">
              Connect
            </h4>
            <ul className="space-y-3 text-sm text-[#55554E]">
              <li>
                <a
                  href="https://wa.me/916201614778?text=Hello%20EaseHub%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#171A18] transition-colors block"
                >
                  WhatsApp Support ↗
                </a>
              </li>
              <li>
                <a href="tel:+916201614778" className="hover:text-[#171A18] transition-colors block">
                  +91 6201614778
                </a>
              </li>
              <li>
                <Link to="/support" className="hover:text-[#171A18] transition-colors block">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/pg" className="hover:text-[#171A18] transition-colors block">
                  Bhilai Hub
                </Link>
              </li>
              <li>
                <Link to="/pg" className="hover:text-[#171A18] transition-colors block">
                  Raipur Hub
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line & Copyright */}
        <div className="pt-8 border-t border-[#E5E1D6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6B63]">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="inline-flex items-center gap-2 font-black text-sm text-[#171A18]">
              <img src="/logo.png" alt="EaseHub Logo" className="w-5 h-5 rounded-md object-cover" />
              <span>EaseHub</span>
            </Link>
            <span className="text-[#A3A8A4]">•</span>
            <span>© {new Date().getFullYear()} EaseHub Technologies. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/support" className="hover:text-[#171A18] transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/support" className="hover:text-[#171A18] transition-colors">Terms</Link>
            <span>•</span>
            <Link to="/support" className="hover:text-[#171A18] transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
