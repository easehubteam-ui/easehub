import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  helpfulPct: number;
  helpfulCount: number;
  icon: string;
  keywords: string[];
}

const articlesData: ArticleItem[] = [
  {
    id: '1',
    title: 'How to pause your daily tiffin plan during university exams or holiday breaks',
    category: 'meals',
    readTime: '2 min read',
    helpfulPct: 98,
    helpfulCount: 412,
    icon: 'calendar_month',
    keywords: ['meal', 'cancellation', 'tiffin', 'pause', 'exam', 'holiday']
  },
  {
    id: '2',
    title: 'Security deposit return timeline: Check-out checklist & bank transfer norms',
    category: 'accommodation',
    readTime: '3 min read',
    helpfulPct: 94,
    helpfulCount: 308,
    icon: 'currency_rupee',
    keywords: ['security', 'deposit', 'refund', 'return', 'check-out', 'pg']
  },
  {
    id: '3',
    title: 'Requesting a room or roommate swap within the same EaseHub property',
    category: 'accommodation',
    readTime: '4 min read',
    helpfulPct: 91,
    helpfulCount: 189,
    icon: 'swap_horiz',
    keywords: ['change', 'room', 'roommate', 'swap', 'hostel', 'transfer']
  },
  {
    id: '4',
    title: 'High-speed WiFi router reset instructions & speed drops reporting in Junwani stays',
    category: 'repairs',
    readTime: '2 min read',
    helpfulPct: 96,
    helpfulCount: 275,
    icon: 'wifi',
    keywords: ['wifi', 'emergency', 'maintenance', 'internet', 'speed', 'router']
  },
  {
    id: '5',
    title: 'Laundry turnaround times: What to do if your wash bundle is past the 24-hr mark',
    category: 'laundry',
    readTime: '3 min read',
    helpfulPct: 89,
    helpfulCount: 142,
    icon: 'local_shipping',
    keywords: ['laundry', 'delivery', 'delay', 'pickup', 'wash']
  }
];

export const SupportPage: React.FC = () => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Ticket Modal State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [pgNameRoom, setPgNameRoom] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Room Maintenance');
  const [ticketSeverity, setTicketSeverity] = useState('Normal (Within 24h)');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSearch = (queryText: string) => {
    setSearchQuery(queryText);
  };

  const filteredArticles = articlesData.filter((art) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      art.title.toLowerCase().includes(q) ||
      art.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleCategoryClick = (categoryKey: string) => {
    const searchTerms: Record<string, string> = {
      accommodation: 'Room Booking Deposit',
      meals: 'Meal Cancellation',
      laundry: 'Laundry Delivery Delay',
      repairs: 'Emergency Maintenance',
      payments: 'Refund Deposit',
      safety: 'Safety Warden'
    };
    const term = searchTerms[categoryKey] || '';
    setSearchQuery(term);
    const elem = document.getElementById('articles-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setTicketSubmitted(false);
    setPgNameRoom('');
    setTicketDescription('');
  };

  return (
    <div className="w-full bg-[#F8FAF6] text-[#191C1A] min-h-screen">
      
      {/* Search & Support Hero */}
      <section className="relative w-full bg-[#F3F4F0] px-4 sm:px-6 lg:px-8 py-10 md:py-14 overflow-hidden border-b border-[#E1E3DF]">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#225944] border border-[#E1E3DF] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="material-symbols-outlined text-[18px] text-[#225944]">support_agent</span>
            <span>EaseHub Resident &amp; Student Help Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#225944] max-w-3xl mb-3 tracking-tight leading-tight">
            How can we help your student living today?
          </h1>
          
          <p className="text-base sm:text-lg text-[#404944] max-w-2xl mb-8 leading-relaxed">
            Fast solutions for your PG rooms, daily tiffin subscriptions, campus laundry slots, and local living around Bhilai &amp; Durg.
          </p>

          {/* Search Input Container */}
          <div className="w-full max-w-3xl bg-white rounded-full p-2 shadow-sm border border-[#E1E3DF] flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F0] flex items-center justify-center shrink-0 text-[#225944]">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type your question, issue, or keyword (e.g., refund, meal pause, room visit)..."
              className="flex-1 bg-transparent border-0 outline-none text-[#191C1A] text-sm font-medium placeholder-[#707973] h-12 pr-2"
            />
            
            <button
              onClick={() => handleSearch(searchQuery)}
              className="shrink-0 h-12 px-6 rounded-full bg-[#225944] text-white font-semibold text-sm hover:bg-[#194434] transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>Search</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {/* Quick Search Tag Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold uppercase text-[#404944] mr-1">Frequent:</span>
            {[
              'Meal Cancellation',
              'PG Deposit',
              'Laundry Delivery Delay',
              'Change Room',
              'Emergency Maintenance'
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSearch(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs border ${
                  searchQuery.toLowerCase() === tag.toLowerCase()
                    ? 'bg-[#225944] text-white border-[#225944]'
                    : 'bg-white text-[#191C1A] hover:bg-[#F3F4F0] border-[#E1E3DF]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Urgent Emergency Assistance Bar */}
      <section className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="bg-[#225944] text-white rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-[#194434]">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EECA3A] text-[#171A18] flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[30px]">emergency_home</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold tracking-tight text-white">
                  Locked out or facing a campus emergency?
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EECA3A] text-[#171A18] text-[10px] font-bold uppercase tracking-wide">
                  24/7 Available
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/80 max-w-2xl mt-1 leading-relaxed">
                Direct priority dispatch for immediate room lockouts, late-night gate permissions, or critical plumbing/electrical hazards around BIT Durg, Nehru Nagar, and Junwani.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            <a
              href="tel:+916201614778"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-white text-[#225944] font-bold text-sm hover:bg-[#F3F4F0] transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
              <span>+91 6201614778</span>
            </a>

            <a
              href="https://wa.me/916201614778?text=Hi%20EaseHub%20Support,%20I%20have%20an%20urgent%20student%20stay%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#EECA3A] text-[#171A18] hover:bg-[#E0BD2C] font-bold text-sm transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>WhatsApp Chat</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-black/10 text-[10px] tracking-tight font-bold">&lt;5 mins</span>
            </a>
          </div>
        </div>
      </section>

      {/* Official Communication & Support Channels */}
      <section className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Community Support */}
          <Link
            to="/community"
            className="group bg-white rounded-2xl p-6 border border-[#E1E3DF] hover:border-[#225944] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-4 group-hover:bg-[#225944] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[26px]">forum</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-extrabold text-[#171A18] group-hover:text-[#225944] transition-colors">
                  Community Support
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs font-semibold text-[#225944] mb-1">
                Chat with the EaseHub community
              </p>
              <p className="text-xs text-[#6B6B63] leading-relaxed">
                Connect with fellow student residents across Bhilai &amp; Durg. Ask questions about hostels, food, and campus life.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#EDEEEB] flex items-center justify-between text-xs font-bold text-[#225944]">
              <span>Enter Community Chat</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </Link>

          {/* 2. Contact Admin Private Chat */}
          <Link
            to="/support/chat"
            className="group bg-white rounded-2xl p-6 border border-[#E1E3DF] hover:border-[#225944] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EECA3A]/30 text-[#171A18] flex items-center justify-center mb-4 group-hover:bg-[#EECA3A] transition-colors">
                <span className="material-symbols-outlined text-[26px]">support_agent</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-extrabold text-[#171A18] group-hover:text-[#225944] transition-colors">
                  Contact Admin
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#EECA3A]/40 text-[#171A18] text-[10px] font-bold">
                  1-on-1
                </span>
              </div>
              <p className="text-xs font-semibold text-[#225944] mb-1">
                Private support chat with EaseHub
              </p>
              <p className="text-xs text-[#6B6B63] leading-relaxed">
                Direct private help with EaseHub central coordinators for booking deposits, room transfers, and verified complaints.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#EDEEEB] flex items-center justify-between text-xs font-bold text-[#225944]">
              <span>Start Admin Chat</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </Link>

          {/* 3. WhatsApp Direct Helpline */}
          <a
            href="https://wa.me/916201614778?text=Hi%20EaseHub%20Support,%20I%20need%20help%20with%20my%20stay"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl p-6 border border-[#E1E3DF] hover:border-[#225944] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[26px]">chat</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-extrabold text-[#171A18] group-hover:text-emerald-700 transition-colors">
                  WhatsApp Support
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  +91 6201614778
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-800 mb-1">
                Chat on WhatsApp
              </p>
              <p className="text-xs text-[#6B6B63] leading-relaxed">
                Our main 24/7 instant channel for quick queries, landlord contacts, urgent room holds, and field assistance.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#EDEEEB] flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Chat on WhatsApp</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                open_in_new
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase text-[#715D00] tracking-widest">Self-Service Directory</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#225944] tracking-tight mt-1">
              Browse assistance by category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#404944] max-w-md">
            Select a domain below to access specialized workflows, policies, and step-by-step resolution guides.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Room & PG Accommodation */}
          <div
            onClick={() => handleCategoryClick('accommodation')}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer border border-[#E1E3DF]"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-4 group-hover:bg-[#225944] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[26px]">apartment</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-[#191C1A] group-hover:text-[#225944] transition-colors">
                  Room &amp; PG Accommodation
                </h3>
                <span className="material-symbols-outlined text-[#707973] text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward_ios
                </span>
              </div>
              <p className="text-xs text-[#404944] mb-4 leading-relaxed">
                Guidance for physical room visits, booking confirmations, rent receipts, security deposit policies, and roommate transfers.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#EDEEEB]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Bookings</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Rent Slips</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Room Transfer</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Deposits</span>
            </div>
          </div>

          {/* 2. Daily Meals & Tiffins */}
          <div
            onClick={() => handleCategoryClick('meals')}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer border border-[#E1E3DF]"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-4 group-hover:bg-[#225944] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[26px]">restaurant</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-[#191C1A] group-hover:text-[#225944] transition-colors">
                  Daily Meals &amp; Tiffins
                </h3>
                <span className="material-symbols-outlined text-[#707973] text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward_ios
                </span>
              </div>
              <p className="text-xs text-[#404944] mb-4 leading-relaxed">
                Managing the meal pause calendar before exams, checking daily mess nutritional menus, mess hygiene ratings, and delivery timing.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#EDEEEB]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Pause Calendar</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Menu Updates</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Hygiene Certs</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Timings</span>
            </div>
          </div>

          {/* 3. Doorstep Laundry */}
          <div
            onClick={() => handleCategoryClick('laundry')}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer border border-[#E1E3DF]"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-4 group-hover:bg-[#225944] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[26px]">local_laundry_service</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-[#191C1A] group-hover:text-[#225944] transition-colors">
                  Doorstep Laundry
                </h3>
                <span className="material-symbols-outlined text-[#707973] text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward_ios
                </span>
              </div>
              <p className="text-xs text-[#404944] mb-4 leading-relaxed">
                Scheduled bag pickups, per-kg price brackets, delicate garment handling guidelines, steam ironing, and tracking delayed orders.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#EDEEEB]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Pickup Slots</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Per-Kg Rates</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Ironing</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Delays</span>
            </div>
          </div>

          {/* 4. Repairs & Home Maintenance */}
          <div
            onClick={() => handleCategoryClick('repairs')}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer border border-[#E1E3DF]"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-4 group-hover:bg-[#225944] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[26px]">handyman</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-[#191C1A] group-hover:text-[#225944] transition-colors">
                  Repairs &amp; Maintenance
                </h3>
                <span className="material-symbols-outlined text-[#707973] text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward_ios
                </span>
              </div>
              <p className="text-xs text-[#404944] mb-4 leading-relaxed">
                On-demand certified electricians, geyser/cooler repairs, RO water purifier service, plumbing fixes, and property repair SLAs.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#EDEEEB]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Plumbing</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Cooler/Geyser</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">RO Filters</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Electrician</span>
            </div>
          </div>

          {/* 5. Payments, Refunds & Wallet */}
          <div
            onClick={() => handleCategoryClick('payments')}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer border border-[#E1E3DF]"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-4 group-hover:bg-[#225944] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[26px]">account_balance_wallet</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-[#191C1A] group-hover:text-[#225944] transition-colors">
                  Payments &amp; Refunds
                </h3>
                <span className="material-symbols-outlined text-[#707973] text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward_ios
                </span>
              </div>
              <p className="text-xs text-[#404944] mb-4 leading-relaxed">
                Setting recurring rent autopay, refund initiation windows, deposit clearance verification, UPI failures, and monthly rent GST bills.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#EDEEEB]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Autopay</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Deposit Refund</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Tax Invoices</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">UPI Help</span>
            </div>
          </div>

          {/* 6. Safety, Security & Warden Support */}
          <div
            onClick={() => handleCategoryClick('safety')}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer border border-[#E1E3DF]"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-4 group-hover:bg-[#225944] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[26px]">shield_person</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-[#191C1A] group-hover:text-[#225944] transition-colors">
                  Safety &amp; Warden Support
                </h3>
                <span className="material-symbols-outlined text-[#707973] text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward_ios
                </span>
              </div>
              <p className="text-xs text-[#404944] mb-4 leading-relaxed">
                Student hostel gate closing timelines, warden grievance escalation, digital guest register entries, CCTV oversight, and medical first-aid.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#EDEEEB]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Gate Timings</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Warden Contact</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">Guest Entry</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F0] text-[#191C1A] text-[11px] font-semibold">First Aid</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles & Interactive FAQ Section */}
      <section id="articles-section" className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Articles List (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#715D00] text-[24px]">local_fire_department</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#225944] tracking-tight">
                  Popular Help Topics &amp; Guides
                </h2>
              </div>
              <span className="text-[11px] font-bold uppercase text-[#404944] tracking-wider">Updated Weekly</span>
            </div>

            <div className="flex flex-col gap-4">
              {filteredArticles.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E1E3DF]">
                  <p className="text-sm font-semibold text-[#404944]">
                    No articles found matching "{searchQuery}". Try searching for 'refund', 'tiffin', or 'laundry'.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 px-4 py-1.5 rounded-full bg-[#225944] text-white text-xs font-semibold"
                  >
                    Clear Search Filter
                  </button>
                </div>
              ) : (
                filteredArticles.map((art) => (
                  <article
                    key={art.id}
                    className="p-5 bg-white rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#E1E3DF]"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#F3F4F0] text-[#225944] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">{art.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#191C1A] hover:text-[#225944] transition-colors leading-snug">
                          {art.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#404944]">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">schedule</span> {art.readTime}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#225944] font-semibold">
                            <span className="material-symbols-outlined text-[15px]">thumb_up</span> {art.helpfulPct}% found helpful ({art.helpfulCount})
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Opening guide: "${art.title}"`)}
                      className="shrink-0 self-end sm:self-center px-4 py-2 rounded-full bg-[#F3F4F0] hover:bg-[#225944] text-[#225944] hover:text-white font-semibold text-xs transition-all border border-[#E1E3DF]"
                    >
                      Read Guide
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Trust Metrics & Accordion Snippets (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Live Resolution Status Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#E1E3DF] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase text-[#715D00] tracking-wider">Support Performance</span>
                  <h3 className="text-lg font-bold text-[#191C1A] mt-0.5">Bhilai Hub Response SLA</h3>
                </div>
                <div className="w-3 h-3 rounded-full bg-[#225944] animate-pulse"></div>
              </div>

              {/* Metrics Row */}
              <div className="flex items-center gap-4 p-4 bg-[#F3F4F0] rounded-xl mb-4 border border-[#E1E3DF]">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#E1E3DF]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#225944]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="94, 100"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-base font-bold text-[#225944] leading-none">94%</span>
                    <span className="text-[9px] uppercase text-[#404944] font-semibold mt-0.5">1-hr Fix</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold text-[#225944]">14 mins avg.</span>
                  <p className="text-xs text-[#404944]">
                    First-response time across student chat queries this semester.
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#225944]"></span>
                    <span className="text-xs font-bold text-[#191C1A]">542 Issues Resolved This Month</span>
                  </div>
                </div>
              </div>

              {/* Accordion FAQ Snippets */}
              <div className="space-y-2">
                <details className="group p-3 bg-[#F8FAF6] rounded-xl border border-[#E1E3DF] cursor-pointer">
                  <summary className="text-xs font-bold text-[#191C1A] flex items-center justify-between list-none">
                    <span>Can I pause tiffin for just 1 single meal?</span>
                    <span className="material-symbols-outlined text-[18px] group-open:rotate-180 transition-transform text-[#404944]">
                      expand_more
                    </span>
                  </summary>
                  <p className="text-xs text-[#404944] mt-2 leading-relaxed">
                    Yes! Head to Meals &gt; Daily Calendar. Toggle off either lunch or dinner before 9:00 AM (for lunch) or 4:00 PM (for dinner) to get full wallet credits.
                  </p>
                </details>

                <details className="group p-3 bg-[#F8FAF6] rounded-xl border border-[#E1E3DF] cursor-pointer">
                  <summary className="text-xs font-bold text-[#191C1A] flex items-center justify-between list-none">
                    <span>Are visitors allowed past 8:00 PM?</span>
                    <span className="material-symbols-outlined text-[18px] group-open:rotate-180 transition-transform text-[#404944]">
                      expand_more
                    </span>
                  </summary>
                  <p className="text-xs text-[#404944] mt-2 leading-relaxed">
                    Day visitors are permitted until 8:00 PM with entry logged via the Warden QR code. Overnight guest requests need prior warden approval 24h before.
                  </p>
                </details>

                <details className="group p-3 bg-[#F8FAF6] rounded-xl border border-[#E1E3DF] cursor-pointer">
                  <summary className="text-xs font-bold text-[#191C1A] flex items-center justify-between list-none">
                    <span>How is per-kg laundry weighed?</span>
                    <span className="material-symbols-outlined text-[18px] group-open:rotate-180 transition-transform text-[#404944]">
                      expand_more
                    </span>
                  </summary>
                  <p className="text-xs text-[#404944] mt-2 leading-relaxed">
                    Our delivery partner carries an authorized digital hanging scale at pickup. You verify and digitally sign the weight directly on their phone app.
                  </p>
                </details>
              </div>
            </div>

            {/* Student Life Visual Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm group border border-[#E1E3DF] bg-gradient-to-br from-[#225944] via-[#1a4535] to-[#123327] p-6 text-white flex flex-col justify-end h-48">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#EECA3A]">
                Community Guidelines
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                BIT Durg &amp; Bhilai PG Code of Conduct
              </h4>
              <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                Quiet hours, kitchen usage ethics, and safe communal practices.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Still Need Help? Raised CTA & Ticket Creation Banner */}
      <section className="w-full bg-[#F3F4F0] py-12 px-4 sm:px-6 lg:px-8 border-t border-b border-[#E1E3DF]">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden border border-[#E1E3DF]">
          <div className="flex flex-col max-w-xl relative z-10">
            <div className="flex items-center gap-2 text-[#225944] mb-2">
              <span className="material-symbols-outlined text-[22px]">contact_support</span>
              <span className="text-xs uppercase font-bold tracking-wider">Unresolved queries?</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#225944] tracking-tight">
              Still couldn't find what you were looking for?
            </h2>
            
            <p className="text-xs sm:text-sm text-[#404944] mt-2 leading-relaxed">
              Raise an official support ticket. Our student success desk based at Nehru Nagar and Junwani will inspect your stay details and get back within 3 hours.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-xs font-semibold text-[#191C1A]">Submit Ticket</span>
              </div>
              <span className="text-[#C0C9C2]">→</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-xs font-semibold text-[#191C1A]">Warden Assigned</span>
              </div>
              <span className="text-[#C0C9C2]">→</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-xs font-semibold text-[#191C1A]">Solved On-site</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 relative z-10">
            <button
              type="button"
              onClick={() => setShowTicketModal(true)}
              className="h-12 px-6 rounded-full bg-[#EECA3A] text-[#171A18] hover:bg-[#E0BD2C] font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
              <span>Raise Support Ticket</span>
            </button>

            <a
              href="tel:+917884051120"
              className="h-12 px-6 rounded-full bg-[#F3F4F0] hover:bg-[#E1E3DF] text-[#225944] font-bold text-sm transition-all flex items-center justify-center gap-2 border border-[#E1E3DF]"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
              <span>Contact Student Desk</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Modal: Raise a Ticket */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-[#191C1A]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-[#E1E3DF]">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EDEEEB]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#225944] text-[24px]">confirmation_number</span>
                <h3 className="text-xl font-bold text-[#225944]">Raise a Support Ticket</h3>
              </div>
              <button
                type="button"
                onClick={closeTicketModal}
                className="w-8 h-8 rounded-full bg-[#F3F4F0] hover:bg-[#E1E3DF] flex items-center justify-center text-[#404944]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {!ticketSubmitted ? (
              <form className="space-y-4" onSubmit={handleTicketSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-[#191C1A] mb-1">PG Name &amp; Room Number *</label>
                  <input
                    type="text"
                    required
                    value={pgNameRoom}
                    onChange={(e) => setPgNameRoom(e.target.value)}
                    placeholder="e.g. GreenVilla PG, Room 204, Nehru Nagar East"
                    className="w-full h-11 px-3.5 rounded-lg bg-[#F8FAF6] border border-[#C0C9C2] text-[#191C1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#225944]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#191C1A] mb-1">Service Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-[#F8FAF6] border border-[#C0C9C2] text-[#191C1A] text-sm focus:outline-none"
                    >
                      <option>Room Maintenance</option>
                      <option>Daily Tiffin &amp; Food</option>
                      <option>Doorstep Laundry</option>
                      <option>WiFi &amp; Electricity</option>
                      <option>Rent / Wallet / Deposit</option>
                      <option>Security &amp; Warden</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#191C1A] mb-1">Severity</label>
                    <select
                      value={ticketSeverity}
                      onChange={(e) => setTicketSeverity(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-[#F8FAF6] border border-[#C0C9C2] text-[#191C1A] text-sm focus:outline-none"
                    >
                      <option>Normal (Within 24h)</option>
                      <option>High (Within 6h)</option>
                      <option>Emergency (Immediate)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191C1A] mb-1">Describe the Issue *</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Explain what is wrong, e.g. Geyser stopped heating water since morning..."
                    className="w-full p-3.5 rounded-lg bg-[#F8FAF6] border border-[#C0C9C2] text-[#191C1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#225944] resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeTicketModal}
                    className="px-5 h-11 rounded-full text-[#404944] font-semibold text-xs hover:bg-[#F3F4F0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 h-11 rounded-full bg-[#225944] hover:bg-[#194434] text-white font-semibold text-sm shadow-md flex items-center gap-2"
                  >
                    <span>Submit Ticket</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-14 h-14 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>
                <h4 className="text-xl font-bold text-[#225944]">Ticket #EH-8924 Created!</h4>
                <p className="text-xs sm:text-sm text-[#404944] max-w-sm mt-1.5 mb-6 leading-relaxed">
                  Our field warden has been notified via SMS. Expected technician dispatch time: under 90 minutes.
                </p>
                <button
                  type="button"
                  onClick={closeTicketModal}
                  className="px-6 h-10 rounded-full bg-[#EECA3A] text-[#171A18] font-bold text-xs hover:bg-[#E0BD2C] transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
