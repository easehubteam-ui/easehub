import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';

type TabType = 'pg' | 'meals' | 'laundry' | 'repairs';

interface MapNode {
  id: string;
  name: string;
  pgs: number;
  mess: number;
  embedUrl: string;
}

const mapNodes: MapNode[] = [
  {
    id: 'bhilai-central',
    name: 'Bhilai Central Hub',
    pgs: 342,
    mess: 124,
    embedUrl: 'https://maps.google.com/maps?q=Bhilai,%20Chhattisgarh&t=&z=13&ie=UTF8&iwloc=&output=embed',
  },
  {
    id: 'junwani',
    name: 'Junwani (BIT Durg Gate 2)',
    pgs: 98,
    mess: 42,
    embedUrl: 'https://maps.google.com/maps?q=Bhilai%20Institute%20of%20Technology%20Durg,%20Chhattisgarh&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },
  {
    id: 'smriti-nagar',
    name: 'Smriti Nagar Hub',
    pgs: 74,
    mess: 30,
    embedUrl: 'https://maps.google.com/maps?q=Smriti%20Nagar%20Bhilai,%20Chhattisgarh&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },
  {
    id: 'civic-center',
    name: 'Civic Center',
    pgs: 52,
    mess: 38,
    embedUrl: 'https://maps.google.com/maps?q=Civic%20Center%20Bhilai,%20Chhattisgarh&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },
  {
    id: 'nehru-nagar',
    name: 'Nehru Nagar',
    pgs: 46,
    mess: 19,
    embedUrl: 'https://maps.google.com/maps?q=Nehru%20Nagar%20Bhilai,%20Chhattisgarh&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },
  {
    id: 'rungta',
    name: 'Rungta Kurud Corridor',
    pgs: 63,
    mess: 28,
    embedUrl: 'https://maps.google.com/maps?q=Rungta%20College%20Bhilai,%20Chhattisgarh&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },
];

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pg');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [subscribedMessage, setSubscribedMessage] = useState(false);
  const [selectedMapNode, setSelectedMapNode] = useState<MapNode>(mapNodes[0]);
  const navigate = useNavigate();

  const handleCTAFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOrPhone.trim()) {
      setSubscribedMessage(true);
      setTimeout(() => setSubscribedMessage(false), 5000);
      setEmailOrPhone('');
    }
  };

  return (
    <div className="bg-[#F7F5EF] text-[#171A18] font-sans antialiased min-h-screen">

      <main className="w-full">
        {/* HERO MASTER SECTION */}
        <section className="relative w-full pt-6 pb-16 md:pt-10 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F7F5EF] via-[#E9F1ED]/40 to-[#F7F5EF]">
          {/* Subtle architectural background glow */}
          <div className="absolute -top-24 right-[-5%] w-[550px] h-[550px] bg-[#EECA3A]/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-1/2 left-[-10%] w-[480px] h-[480px] bg-[#225944]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
            {/* Top Split: Headline & Visual Collage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: Copy & Value Proposition */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#225944]/10 text-[#225944]">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span className="text-[11px] tracking-wider uppercase font-bold">The All-In-One Co-Living Ecosystem</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#171A18] tracking-tight leading-[1.15]">
                  Your Entire Student Living, <br className="hidden sm:inline" />
                  <span className="text-[#225944] relative inline-block">
                    Sorted In One Place.
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#EECA3A] opacity-80" fill="none" preserveAspectRatio="none" viewBox="0 0 240 12">
                      <path d="M2 9C58 2 178 3 238 9" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                    </svg>
                  </span>
                </h1>

                <p className="text-lg text-[#6B6B63] max-w-xl leading-relaxed">
                  Verified PG & Hostels, nutritious daily tiffins, hygienic door-to-door laundry, and reliable maintenance across Bhilai & Durg campuses.
                </p>

                {/* Quick Metrics Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-3 text-[#6B6B63]">
                  <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[18px]">verified_user</span>
                    <span className="text-xs font-semibold text-[#171A18]">100% Verified Places</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#EECA3A] text-[18px]">skillet</span>
                    <span className="text-xs font-semibold text-[#171A18]">Fresh Homestyle Food</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[18px]">local_laundry_service</span>
                    <span className="text-xs font-semibold text-[#171A18]">24h Turnaround</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[18px]">money_off</span>
                    <span className="text-xs font-semibold text-[#171A18]">Zero Brokerage</span>
                  </div>
                </div>
              </div>

              {/* Right: Bento Hero Composition */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl bg-white p-4 shadow-[0_6px_16px_rgba(23,26,24,0.04),0_20px_40px_rgba(34,89,68,0.08)] border border-[#E5E1D6]">
                  <div className="relative h-[340px] md:h-[390px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#225944] via-[#1a4535] to-[#113125] p-6 text-white flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EECA3A] text-[#171A18] text-xs font-bold mb-3">
                        <span>EaseHub Living Ecosystem</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-[#EECA3A]">
                        Verified Student Living & Services
                      </h2>
                      <p className="text-xs text-white/80 mt-2 max-w-sm">
                        Direct access to PGs, daily tiffin messes, doorstep laundry pickups, and on-demand maintenance.
                      </p>
                    </div>

                    {/* Floating Mini Micro-cards */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl flex items-center gap-3 shadow-md border border-[#E5E1D6] text-[#171A18]">
                        <div className="w-10 h-10 rounded-lg bg-[#EECA3A]/20 text-[#171A18] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">restaurant</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-[#6B6B63] uppercase font-bold">Hot Tiffin</p>
                          <p className="text-xs font-bold text-[#171A18] truncate">Cooked Fresh Daily</p>
                        </div>
                      </div>

                      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl flex items-center gap-3 shadow-md border border-[#E5E1D6] text-[#171A18]">
                        <div className="w-10 h-10 rounded-lg bg-[#225944]/10 text-[#225944] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">local_laundry_service</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-[#6B6B63] uppercase font-bold">Laundry Pick</p>
                          <p className="text-xs font-bold text-[#171A18] truncate">Doorstep Pickup</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-tab Unified Search & Discovery Bar */}
            <div className="w-full bg-white rounded-3xl p-4 md:p-6 shadow-[0_4px_12px_rgba(23,26,24,0.04),0_18px_36px_rgba(34,89,68,0.06)] border border-[#E5E1D6] -mt-2 z-20">
              {/* Interactive Service Mode Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-[#E5E1D6]" id="discovery-tabs">
                <button
                  onClick={() => setActiveTab('pg')}
                  className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                    activeTab === 'pg'
                      ? 'bg-[#225944] text-white shadow-sm'
                      : 'bg-[#F7F5EF] text-[#6B6B63] hover:text-[#171A18]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">bed</span>
                  <span>Find PG / Hostel</span>
                </button>

                <button
                  onClick={() => setActiveTab('meals')}
                  className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                    activeTab === 'meals'
                      ? 'bg-[#225944] text-white shadow-sm'
                      : 'bg-[#F7F5EF] text-[#6B6B63] hover:text-[#171A18]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                  <span>Daily Meals & Tiffins</span>
                </button>

                <button
                  onClick={() => setActiveTab('laundry')}
                  className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                    activeTab === 'laundry'
                      ? 'bg-[#225944] text-white shadow-sm'
                      : 'bg-[#F7F5EF] text-[#6B6B63] hover:text-[#171A18]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">local_laundry_service</span>
                  <span>Laundry Pickup</span>
                </button>

                <button
                  onClick={() => setActiveTab('repairs')}
                  className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                    activeTab === 'repairs'
                      ? 'bg-[#225944] text-white shadow-sm'
                      : 'bg-[#F7F5EF] text-[#6B6B63] hover:text-[#171A18]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">handyman</span>
                  <span>Doorstep Repairs</span>
                </button>
              </div>

              {/* Tab Content Panels */}
              {activeTab === 'pg' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-4 bg-[#F7F5EF] rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[22px]">location_on</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-[#6B6B63] uppercase font-bold">Campus / Locality</label>
                      <input
                        type="text"
                        defaultValue="Junwani, Bhilai"
                        className="w-full bg-transparent text-sm font-bold text-[#171A18] focus:outline-none placeholder-[#6B6B63]"
                        placeholder="e.g. Junwani, BIT Durg, Smriti Nagar"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3 bg-[#F7F5EF] rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[22px]">group</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-[#6B6B63] uppercase font-bold">Room Category</label>
                      <select className="w-full bg-transparent text-sm font-bold text-[#171A18] focus:outline-none cursor-pointer border-none p-0">
                        <option>Single Room (Private)</option>
                        <option>Double Sharing</option>
                        <option>Triple Sharing</option>
                        <option>Girls Only PG</option>
                        <option>Boys Only PG</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-[#F7F5EF] rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[22px]">payments</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-[#6B6B63] uppercase font-bold">Max Budget</label>
                      <select className="w-full bg-transparent text-sm font-bold text-[#171A18] focus:outline-none cursor-pointer border-none p-0">
                        <option>Under ₹6,000</option>
                        <option>Under ₹8,000</option>
                        <option>Under ₹12,000</option>
                        <option>Any Budget</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <button
                      onClick={() => navigate('/pg')}
                      className="w-full h-12 rounded-2xl bg-[#EECA3A] hover:bg-[#e0bd2c] text-[#171A18] text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">search</span>
                      <span>Explore PG Listings</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'meals' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5 bg-[#F7F5EF] rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[22px]">map</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-[#6B6B63] uppercase font-bold">Delivery Locality</label>
                      <input
                        type="text"
                        defaultValue="Civic Center, Bhilai"
                        className="w-full bg-transparent text-sm font-bold text-[#171A18] focus:outline-none placeholder-[#6B6B63]"
                        placeholder="Locality, Hostel name, or College"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-4 bg-[#F7F5EF] rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[22px]">restaurant_menu</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-[#6B6B63] uppercase font-bold">Diet & Meal Type</label>
                      <select className="w-full bg-transparent text-sm font-bold text-[#171A18] focus:outline-none cursor-pointer border-none p-0">
                        <option>Pure Veg Daily Thali</option>
                        <option>Veg + Non-Veg Alternate</option>
                        <option>Breakfast + Dinner Pack</option>
                        <option>3 Meals All Inclusive</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <button
                      onClick={() => navigate('/meals')}
                      className="w-full h-12 rounded-2xl bg-[#EECA3A] hover:bg-[#e0bd2c] text-[#171A18] text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">skillet</span>
                      <span>Find Mess Plans</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'laundry' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5 bg-[#F7F5EF] rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[22px]">pin_drop</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-[#6B6B63] uppercase font-bold">Pickup Address</label>
                      <input
                        type="text"
                        defaultValue="Nehru Nagar East, Bhilai"
                        className="w-full bg-transparent text-sm font-bold text-[#171A18] focus:outline-none placeholder-[#6B6B63]"
                        placeholder="Hostel room or residence address"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-4 bg-[#F7F5EF] rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[22px]">local_shipping</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-[#6B6B63] uppercase font-bold">Turnaround Speed</label>
                      <select className="w-full bg-transparent text-sm font-bold text-[#171A18] focus:outline-none cursor-pointer border-none p-0">
                        <option>Standard 24-48 Hours (₹45/kg)</option>
                        <option>Express 24h Wash & Steam Press</option>
                        <option>Shoe & Heavy Bedding Deep Clean</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <button
                      onClick={() => navigate('/laundry')}
                      className="w-full h-12 rounded-2xl bg-[#EECA3A] hover:bg-[#e0bd2c] text-[#171A18] text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">schedule</span>
                      <span>Book Pickup</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'repairs' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5 bg-[#F7F5EF] rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[22px]">home_repair_service</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-[#6B6B63] uppercase font-bold">Issue / Service Type</label>
                      <input
                        type="text"
                        defaultValue="Electrician & Wiring Check"
                        className="w-full bg-transparent text-sm font-bold text-[#171A18] focus:outline-none placeholder-[#6B6B63]"
                        placeholder="Electrician, Tap Leak, AC servicing"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-4 bg-[#F7F5EF] rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-[#E5E1D6]">
                    <span className="material-symbols-outlined text-[#225944] text-[22px]">event</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] text-[#6B6B63] uppercase font-bold">Preferred Time</label>
                      <select className="w-full bg-transparent text-sm font-bold text-[#171A18] focus:outline-none cursor-pointer border-none p-0">
                        <option>Today - Urgent (Within 2 Hours)</option>
                        <option>Today - Evening (5 PM - 8 PM)</option>
                        <option>Tomorrow Morning (9 AM - 12 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <button
                      onClick={() => navigate('/services')}
                      className="w-full h-12 rounded-2xl bg-[#EECA3A] hover:bg-[#e0bd2c] text-[#171A18] text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">handyman</span>
                      <span>Find Verified Pro</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick filter chips underneath the search bar */}
              <div className="pt-4 flex flex-wrap items-center gap-2 text-[#6B6B63]">
                <span className="text-xs font-bold text-[#171A18] mr-1">Trending:</span>
                <Link to="/pg" className="px-3 py-1 rounded-full bg-[#F7F5EF] hover:bg-[#E5E1D6] text-xs font-medium text-[#171A18] transition-colors">
                  BIT Durg Girls Hostel
                </Link>
                <Link to="/pg" className="px-3 py-1 rounded-full bg-[#F7F5EF] hover:bg-[#E5E1D6] text-xs font-medium text-[#171A18] transition-colors">
                  Single Room AC Junwani
                </Link>
                <Link to="/meals" className="px-3 py-1 rounded-full bg-[#F7F5EF] hover:bg-[#E5E1D6] text-xs font-medium text-[#171A18] transition-colors">
                  Monthly Pure Veg Tiffin
                </Link>
                <Link to="/laundry" className="px-3 py-1 rounded-full bg-[#F7F5EF] hover:bg-[#E5E1D6] text-xs font-medium text-[#171A18] transition-colors">
                  Wash & Fold Smriti Nagar
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* THE 4 PILLARS OF EASEHUB (INTERACTIVE SERVICE CARDS) */}
        <section className="w-full py-16 bg-[#F7F5EF]">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#225944] uppercase tracking-wider">Complete Student Convenience</span>
                <h2 className="text-3xl font-extrabold text-[#171A18] mt-1">Explore The 4 Pillars of EaseHub</h2>
              </div>
              <p className="text-sm text-[#6B6B63] max-w-md">
                Everything an outstation student or young professional requires to thrive with peace of mind.
              </p>
            </div>

            {/* Bento Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pillar 1: PG & Hostels */}
              <div className="group relative rounded-3xl bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all border border-[#E5E1D6]">
                <div>
                  <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 relative bg-gradient-to-br from-[#225944] to-[#163b2d] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-6xl text-[#EECA3A]">apartment</span>
                    <span className="absolute top-3 left-3 px-3 py-0.5 rounded-full bg-[#225944] text-white text-[11px] font-bold border border-white/20">
                      Verified Accommodation
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#225944] mb-1">
                    <span className="material-symbols-outlined text-[20px]">apartment</span>
                    <span className="text-xs font-bold uppercase">Living Spaces</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#171A18] mb-1">PG & Hostels</h3>
                  <p className="text-xs text-[#6B6B63] mb-4 leading-relaxed">
                    Secure single and sharing spaces near your college. Includes Wi-Fi, power backup, study desks, and biometric safety.
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between border-t border-[#E5E1D6]">
                  <div>
                    <span className="text-[10px] text-[#6B6B63] uppercase">Starting from</span>
                    <p className="text-lg text-[#225944] font-extrabold">₹4,500<span className="text-xs font-normal text-[#6B6B63]">/mo</span></p>
                  </div>
                  <Link
                    to="/pg"
                    className="w-10 h-10 rounded-full bg-[#225944]/10 group-hover:bg-[#225944] text-[#225944] group-hover:text-white flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Pillar 2: Meals & Tiffins */}
              <div className="group relative rounded-3xl bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all border border-[#E5E1D6]">
                <div>
                  <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 relative bg-gradient-to-br from-[#FFF3C4] to-[#EECA3A]/30 flex items-center justify-center text-[#171A18]">
                    <span className="material-symbols-outlined text-6xl text-[#225944]">skillet</span>
                    <span className="absolute top-3 left-3 px-3 py-0.5 rounded-full bg-[#EECA3A] text-[#171A18] text-[11px] font-bold">
                      Certified Mess
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#225944] mb-1">
                    <span className="material-symbols-outlined text-[20px]">restaurant</span>
                    <span className="text-xs font-bold uppercase">Nutrition</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#171A18] mb-1">Mess & Tiffin Plans</h3>
                  <p className="text-xs text-[#6B6B63] mb-4 leading-relaxed">
                    Home-like food prepared with low-oil, high-nutrition recipes. Pause anytime during holidays or exam breaks.
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between border-t border-[#E5E1D6]">
                  <div>
                    <span className="text-[10px] text-[#6B6B63] uppercase">Starting from</span>
                    <p className="text-lg text-[#171A18] font-extrabold">₹60<span className="text-xs font-normal text-[#6B6B63]">/meal</span></p>
                  </div>
                  <Link
                    to="/meals"
                    className="w-10 h-10 rounded-full bg-[#EECA3A]/20 group-hover:bg-[#EECA3A] text-[#171A18] flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Pillar 3: Laundry Care */}
              <div className="group relative rounded-3xl bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all border border-[#E5E1D6]">
                <div>
                  <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 relative bg-gradient-to-br from-[#E9F2EE] to-[#225944]/20 flex items-center justify-center text-[#225944]">
                    <span className="material-symbols-outlined text-6xl">local_laundry_service</span>
                    <span className="absolute top-3 left-3 px-3 py-0.5 rounded-full bg-[#225944] text-white text-[11px] font-bold">
                      Doorstep Pickup
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#225944] mb-1">
                    <span className="material-symbols-outlined text-[20px]">local_laundry_service</span>
                    <span className="text-xs font-bold uppercase">Hygiene</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#171A18] mb-1">Smart Laundry Care</h3>
                  <p className="text-xs text-[#6B6B63] mb-4 leading-relaxed">
                    Hygienic wash, fabric-soft rinse, and wrinkle-free steam pressing. Doorstep collection and 24-48h dropoff guaranteed.
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between border-t border-[#E5E1D6]">
                  <div>
                    <span className="text-[10px] text-[#6B6B63] uppercase">Starting from</span>
                    <p className="text-lg text-[#225944] font-extrabold">₹45<span className="text-xs font-normal text-[#6B6B63]">/kg</span></p>
                  </div>
                  <Link
                    to="/laundry"
                    className="w-10 h-10 rounded-full bg-[#225944]/10 group-hover:bg-[#225944] text-[#225944] group-hover:text-white flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Pillar 4: Home & Maintenance Repairs */}
              <div className="group relative rounded-3xl bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all border border-[#E5E1D6]">
                <div>
                  <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 relative bg-gradient-to-br from-[#F7F5EF] to-[#E5E1D6] flex items-center justify-center text-[#171A18]">
                    <span className="material-symbols-outlined text-6xl text-[#225944]">handyman</span>
                    <span className="absolute top-3 left-3 px-3 py-0.5 rounded-full bg-[#225944] text-white text-[11px] font-bold">
                      Background Checked
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#225944] mb-1">
                    <span className="material-symbols-outlined text-[20px]">handyman</span>
                    <span className="text-xs font-bold uppercase">Repairs & Help</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#171A18] mb-1">Home & Maintenance</h3>
                  <p className="text-xs text-[#6B6B63] mb-4 leading-relaxed">
                    Electricians, plumbers, room deep cleaning, and appliance fixes. Fast turnaround within 2 hours for urgent fixes.
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between border-t border-[#E5E1D6]">
                  <div>
                    <span className="text-[10px] text-[#6B6B63] uppercase">Starting from</span>
                    <p className="text-lg text-[#225944] font-extrabold">₹199<span className="text-xs font-normal text-[#6B6B63]">/visit</span></p>
                  </div>
                  <Link
                    to="/services"
                    className="w-10 h-10 rounded-full bg-[#225944]/10 group-hover:bg-[#225944] text-[#225944] group-hover:text-white flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE CITY HUB & INTERACTIVE MAP DISCOVERY */}
        <section className="w-full py-14 bg-[#E9F1ED]/50 border-y border-[#E5E1D6]">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Interactive Live Map Component */}
              <div className="lg:col-span-6 relative">
                <div className="relative w-full h-[460px] rounded-3xl overflow-hidden shadow-xl bg-gray-200 border-2 border-[#225944]/30 flex flex-col justify-between">
                  {/* Live Google Maps Interactive iFrame */}
                  <iframe
                    title="Bhilai Campus Live Interactive Map"
                    src={selectedMapNode.embedUrl}
                    className="w-full h-full border-0 filter contrast-105 saturate-110"
                    allowFullScreen
                    loading="lazy"
                  />

                  {/* Map Overlay Top Banner */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                    <div className="bg-[#225944] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-auto">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EECA3A] animate-pulse"></span>
                      <span className="text-xs font-extrabold">{selectedMapNode.name}: {selectedMapNode.pgs} PGs • {selectedMapNode.mess} Mess</span>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/PG+Hostel+near+${encodeURIComponent(selectedMapNode.name)}+Bhilai`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white/95 backdrop-blur-md hover:bg-white text-[#171A18] px-3.5 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-1.5 transition pointer-events-auto border border-[#E5E1D6]"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#225944]">open_in_new</span>
                      <span>Open G-Maps</span>
                    </a>
                  </div>

                  {/* Interactive Locality Node Chips Overlay at Bottom of Map */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#E5E1D6] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171A18] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#225944] text-[16px]">location_on</span>
                        <span>Select Campus Node to Focus Live Map:</span>
                      </span>
                      <Link to="/pg" className="text-[11px] font-bold text-[#225944] hover:underline flex items-center gap-0.5">
                        <span>View Full Map</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {mapNodes.map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => setSelectedMapNode(node)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                            selectedMapNode.id === node.id
                              ? 'bg-[#225944] text-white shadow-sm'
                              : 'bg-[#F7F5EF] text-[#171A18] hover:bg-[#E5E1D6]'
                          }`}
                        >
                          <span>{node.name.split(' ')[0]}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            selectedMapNode.id === node.id ? 'bg-white/20 text-white' : 'bg-[#EECA3A] text-[#171A18]'
                          }`}>
                            {node.pgs}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Campus Quick Browse Directory */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <span className="text-xs font-bold text-[#EECA3A] uppercase tracking-wider">Prime Educational Neighborhoods</span>
                  <h2 className="text-3xl font-extrabold text-[#171A18] mt-1">Popular Student Hubs in Bhilai &amp; Durg</h2>
                  <p className="text-sm text-[#6B6B63] mt-2 leading-relaxed">
                    Stay close to your lecture halls, coaching institutes, and transit stops. Choose a locality to focus the live map instantly.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {mapNodes.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedMapNode(node)}
                      className={`p-4 rounded-2xl text-left transition-all border ${
                        selectedMapNode.id === node.id
                          ? 'bg-[#225944] text-white shadow-md border-[#225944]'
                          : 'bg-white hover:bg-[#225944] hover:text-white group border-[#E5E1D6]'
                      }`}
                    >
                      <p className={`text-sm font-bold ${selectedMapNode.id === node.id ? 'text-white' : 'text-[#171A18] group-hover:text-white'}`}>
                        {node.name.split(' ')[0]}
                      </p>
                      <p className={`text-xs ${selectedMapNode.id === node.id ? 'text-white/80' : 'text-[#6B6B63] group-hover:text-white/80'}`}>
                        {node.pgs} PGs • {node.mess} Mess
                      </p>
                    </button>
                  ))}
                </div>

                {/* Quick Tip Panel */}
                <div className="p-4 rounded-2xl bg-white border border-[#E5E1D6] flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-[#EECA3A] text-[#171A18] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">school</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171A18]">Are you an incoming 1st-year student?</p>
                    <p className="text-xs text-[#6B6B63]">Get free guided campus roommate pairing & college orientation kit.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW EASEHUB MAKES CAMPUS LIFE EASY (3-STEP FLOW) */}
        <section className="w-full py-16 bg-[#F7F5EF]">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <span className="text-xs font-bold text-[#225944] uppercase tracking-wider">Frictionless Living</span>
              <h2 className="text-3xl font-extrabold text-[#171A18]">How EaseHub Works For You</h2>
              <p className="text-sm text-[#6B6B63]">
                Say goodbye to shady brokers, bad hostel food, and laundry piles. We streamline college lifestyle in three direct steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="relative bg-white rounded-3xl p-6 shadow-sm border border-[#E5E1D6] flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#225944] text-white flex items-center justify-center mb-4 shadow-md">
                  <span className="material-symbols-outlined text-[30px]">travel_explore</span>
                </div>
                <span className="text-[11px] text-[#EECA3A] uppercase font-extrabold mb-1">Step 01</span>
                <h3 className="text-lg font-bold text-[#171A18] mb-2">Choose Your Services</h3>
                <p className="text-xs text-[#6B6B63] leading-relaxed">
                  Explore verified accommodations, compare meal reviews, and schedule laundry slots according to your college timetable.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white rounded-3xl p-6 shadow-sm border border-[#E5E1D6] flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#EECA3A] text-[#171A18] flex items-center justify-center mb-4 shadow-md">
                  <span className="material-symbols-outlined text-[30px]">schedule_send</span>
                </div>
                <span className="text-[11px] text-[#225944] uppercase font-extrabold mb-1">Step 02</span>
                <h3 className="text-lg font-bold text-[#171A18] mb-2">Instant Room & Plan Booking</h3>
                <p className="text-xs text-[#6B6B63] leading-relaxed">
                  Schedule an in-person room visit, start a 3-day meal trial, or request doorstep clothes pickup in less than 60 seconds.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white rounded-3xl p-6 shadow-sm border border-[#E5E1D6] flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#225944] text-white flex items-center justify-center mb-4 shadow-md">
                  <span className="material-symbols-outlined text-[30px]">sentiment_very_satisfied</span>
                </div>
                <span className="text-[11px] text-[#EECA3A] uppercase font-extrabold mb-1">Step 03</span>
                <h3 className="text-lg font-bold text-[#171A18] mb-2">Focus On Your Ambition</h3>
                <p className="text-xs text-[#6B6B63] leading-relaxed">
                  Zero chore overhead. Consolidated monthly digital bills and 24/7 student assistance let you focus purely on your studies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STUDENT REVIEWS & SOCIAL PROOF */}
        <section className="w-full py-16 bg-[#E9F1ED]/40 border-t border-[#E5E1D6]">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#225944] uppercase tracking-wider">Trusted by 4,200+ Students</span>
                <h2 className="text-3xl font-extrabold text-[#171A18] mt-1">Real Stories From Local Campuses</h2>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E5E1D6]">
                <span className="text-base font-extrabold text-[#225944]">4.9 / 5.0</span>
                <div className="flex text-[#EECA3A]">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]">star</span>
                  ))}
                </div>
                <span className="text-xs text-[#6B6B63]">Student Rating</span>
              </div>
            </div>

            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Review 1 */}
              <div className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm border border-[#E5E1D6]">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-[#EECA3A]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[18px]">star</span>
                    ))}
                  </div>
                  <p className="text-sm text-[#171A18] italic leading-relaxed">
                    "Finding a safe girls PG in Junwani with proper study desks and high-speed Wi-Fi was impossible until I found EaseHub. Zero brokerage and the room matched the photos 100%."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E5E1D6] mt-4">
                  <div className="w-10 h-10 rounded-full bg-[#225944]/10 flex items-center justify-center text-[#225944] font-bold text-sm">
                    AR
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171A18]">Ananya Roy</p>
                    <p className="text-[11px] text-[#6B6B63]">B.Tech 3rd Year • BIT Durg</p>
                  </div>
                </div>
              </div>

              {/* Review 2 */}
              <div className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm border border-[#E5E1D6]">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-[#EECA3A]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[18px]">star</span>
                    ))}
                  </div>
                  <p className="text-sm text-[#171A18] italic leading-relaxed">
                    "The monthly tiffin subscription saved my stomach! Authentic homemade food delivered piping hot right before my 1:00 PM break. I can even pause meals on weekends."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E5E1D6] mt-4">
                  <div className="w-10 h-10 rounded-full bg-[#EECA3A]/30 flex items-center justify-center text-[#171A18] font-bold text-sm">
                    PK
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171A18]">Priyanshu Kumar</p>
                    <p className="text-[11px] text-[#6B6B63]">Diploma Mechanical • CSIT Durg</p>
                  </div>
                </div>
              </div>

              {/* Review 3 */}
              <div className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm border border-[#E5E1D6]">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-[#EECA3A]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[18px]">star</span>
                    ))}
                  </div>
                  <p className="text-sm text-[#171A18] italic leading-relaxed">
                    "Between semester exams and lab submissions, laundry was my biggest stress. FreshThread pickups via EaseHub are clean, steam-pressed, and back in 24 hours. A total lifesaver."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E5E1D6] mt-4">
                  <div className="w-10 h-10 rounded-full bg-[#225944]/10 flex items-center justify-center text-[#225944] font-bold text-sm">
                    SD
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171A18]">Srishti Dewangan</p>
                    <p className="text-[11px] text-[#6B6B63]">MBA • Rungta Group</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CONVERSION CTA BANNER */}
        <section className="w-full py-16 bg-[#F7F5EF]">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-[#EECA3A] p-8 md:p-12 overflow-hidden shadow-xl border border-amber-300">
              {/* Graphic backdrop circle */}
              <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-200/50 blur-2xl pointer-events-none"></div>

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171A18]/10 text-[#171A18]">
                  <span className="material-symbols-outlined text-[16px]">celebration</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">New Academic Season 2026</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-[#171A18] tracking-tight leading-tight">
                  Ready to elevate your college lifestyle?
                </h2>

                <p className="text-sm md:text-base text-[#171A18]/90 font-medium">
                  Sign up now to unlock exclusive student discounts on PGs, get a free tiffin meal voucher, and 20% off your first laundry pickup.
                </p>

                {subscribedMessage ? (
                  <div className="bg-[#225944] text-white p-4 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-md">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>Welcome to EaseHub! Our campus concierge will get in touch shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleCTAFormSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
                    <input
                      type="text"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="Enter your mobile number or college email"
                      required
                      className="flex-1 h-12 px-5 rounded-full bg-white text-[#171A18] text-sm focus:outline-none placeholder-[#6B6B63] shadow-sm border border-amber-200"
                    />
                    <button
                      type="submit"
                      className="h-12 px-8 rounded-full bg-[#225944] hover:bg-[#184232] text-white text-sm font-bold shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
                    >
                      <span>Get Started Free</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </form>
                )}

                <p className="text-xs text-[#171A18]/80 flex items-center gap-1.5 pt-1">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>No spam. Cancel or pause services anytime with 1-click.</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
