import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Building2, Utensils, Shirt, Wrench, ChevronRight, RotateCcw } from 'lucide-react';
import { AnimatedCityFooter } from '../../components/home/AnimatedCityFooter';

interface NotFoundProps {
  title?: string;
  message?: string;
  isError?: boolean;
  onRetry?: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or may have been moved.",
  isError = false,
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] font-sans antialiased flex flex-col justify-between selection:bg-[#EECA3A] selection:text-[#171A18]">
      
      {/* Main 404 Content Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 flex flex-col items-center justify-center text-center relative z-10">
        
        {/* 1. Large Animated 404 Number & Student Illustration */}
        <div className="relative my-4 sm:my-6 select-none flex items-center justify-center">
          
          {/* Background Soft Clouds */}
          <div className="absolute -top-8 -left-12 w-32 h-16 bg-white/70 rounded-full blur-sm pointer-events-none"></div>
          <div className="absolute top-2 -right-10 w-36 h-20 bg-white/70 rounded-full blur-sm pointer-events-none"></div>

          {/* Paper Plane Dashed Trail Graphic (Top-Right) */}
          <div className="absolute -top-10 right-4 sm:right-12 z-20 pointer-events-none animate-float-slow">
            <svg className="w-20 sm:w-28 h-16 overflow-visible" viewBox="0 0 120 70" fill="none">
              <path
                d="M 10 50 Q 30 10 60 30 T 100 15"
                stroke="#225944"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <polygon points="100,10 115,15 105,25" fill="#225944" />
            </svg>
          </div>

          {/* 404 Main Typography Container */}
          <div className="relative flex items-center justify-center font-black tracking-tighter text-[110px] sm:text-[170px] md:text-[210px] leading-none">
            
            {/* First "4" in EaseHub Deep Green */}
            <span className="text-[#225944] relative z-10 font-sans">4</span>

            {/* Middle "0" in EaseHub Golden Yellow with Top Sparks */}
            <div className="relative z-10 mx-1 sm:mx-2 flex items-center justify-center">
              <span className="text-[#EECA3A]">0</span>
              {/* Yellow Spark Rays above 0 */}
              <div className="absolute -top-4 sm:-top-8 flex gap-1.5 text-[#EECA3A]">
                <span className="w-1.5 h-4 rounded-full bg-[#EECA3A] transform -rotate-15"></span>
                <span className="w-1.5 h-5 rounded-full bg-[#EECA3A]"></span>
                <span className="w-1.5 h-4 rounded-full bg-[#EECA3A] transform rotate-15"></span>
              </div>
            </div>

            {/* Second "4" in EaseHub Deep Green */}
            <span className="text-[#225944] relative z-10 font-sans">4</span>

            {/* Sitting Student Illustration Vector Overlay (Left of first 4) */}
            <div className="absolute bottom-2 sm:bottom-4 -left-6 sm:-left-10 z-20 pointer-events-none">
              <svg className="w-16 sm:w-24 md:w-28 h-20 sm:h-28 md:h-32" viewBox="0 0 100 110" fill="none">
                {/* Backpack */}
                <path d="M 25 50 Q 15 50 15 70 Q 15 85 30 85 Z" fill="#184232" />
                {/* Legs in Navy/Green */}
                <path d="M 40 70 L 25 88 L 45 92 Z" fill="#171A18" />
                <path d="M 45 70 L 35 90 L 55 92 Z" fill="#225944" />
                {/* Shoes */}
                <ellipse cx="22" cy="90" rx="8" ry="4" fill="#FFFFFF" />
                <ellipse cx="32" cy="92" rx="8" ry="4" fill="#FFFFFF" />
                {/* Body / Yellow Jacket */}
                <path d="M 35 45 C 30 55 32 75 45 72 C 55 70 50 50 40 45 Z" fill="#EECA3A" />
                {/* Head looking up */}
                <circle cx="48" cy="32" r="11" fill="#FFDBAC" />
                {/* Hair */}
                <path d="M 40 28 C 42 20 56 20 58 30 Z" fill="#171A18" />
              </svg>
            </div>

            {/* Green Sprouting Plants at Base */}
            <div className="absolute -bottom-2 left-1/4 z-20 pointer-events-none flex gap-2">
              <svg className="w-6 h-6 text-[#225944]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L10 9L3 12L10 15L12 22L14 15L21 12L14 9L12 2Z" />
              </svg>
            </div>
            <div className="absolute -bottom-2 right-1/4 z-20 pointer-events-none flex gap-2">
              <svg className="w-6 h-6 text-[#4F7A65]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L10 9L3 12L10 15L12 22L14 15L21 12L14 9L12 2Z" />
              </svg>
            </div>

          </div>
        </div>

        {/* 2. Heading & Supporting Copy */}
        <div className="space-y-2 max-w-lg mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#171A18] tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B63] font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* 3. CTA Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {isError && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="px-6 py-3 rounded-2xl bg-[#225944] hover:bg-[#184232] text-white text-xs sm:text-sm font-extrabold transition shadow-md flex items-center gap-2 btn-interaction"
            >
              <RotateCcw className="w-4 h-4 text-[#EECA3A]" />
              <span>Try Again</span>
            </button>
          ) : (
            <Link
              to="/"
              className="px-6 py-3 rounded-2xl bg-[#225944] hover:bg-[#184232] text-white text-xs sm:text-sm font-extrabold transition shadow-md flex items-center gap-2 btn-interaction"
            >
              <Home className="w-4 h-4 text-[#EECA3A]" />
              <span>Back to Home</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-2xl bg-white hover:bg-[#F3F4F0] text-[#171A18] border border-[#E5E1D6] text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-2 btn-interaction"
          >
            <ArrowLeft className="w-4 h-4 text-[#6B6B63]" />
            <span>Go Back</span>
          </button>
        </div>

        {/* 4. "Or explore EaseHub" Category Cards */}
        <div className="w-full max-w-2xl mx-auto space-y-4">
          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E1D6]"></div>
            </div>
            <span className="relative px-4 bg-[#F7F5EF] text-xs font-bold text-[#6B6B63] uppercase tracking-wider">
              Or explore EaseHub
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: PG/Hostel */}
            <Link
              to="/pg"
              className="bg-white hover:bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E5E1D6] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#225944]/10 text-[#225944] shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#171A18] group-hover:text-[#225944] transition-colors truncate">
                  PG/Hostel
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6B6B63] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            {/* Card 2: Meals */}
            <Link
              to="/meals"
              className="bg-white hover:bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E5E1D6] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#EECA3A]/20 text-[#171A18] shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#171A18] group-hover:text-[#225944] transition-colors truncate">
                  Meals
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6B6B63] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            {/* Card 3: Laundry */}
            <Link
              to="/laundry"
              className="bg-white hover:bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E5E1D6] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#225944]/10 text-[#225944] shrink-0">
                  <Shirt className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#171A18] group-hover:text-[#225944] transition-colors truncate">
                  Laundry
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6B6B63] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            {/* Card 4: Services */}
            <Link
              to="/services"
              className="bg-white hover:bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E5E1D6] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-gray-100 text-[#171A18] shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#171A18] group-hover:text-[#225944] transition-colors truncate">
                  Services
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6B6B63] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        </div>

      </main>

      {/* 5. Bottom Panoramic City/Campus Skyline Scene */}
      <AnimatedCityFooter />

      {/* Inline Animation Styles */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
        .animate-float-slow {
          animation: floatSlow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
