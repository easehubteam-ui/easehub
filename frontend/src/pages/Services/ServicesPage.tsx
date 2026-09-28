import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import { serviceApi, ExtraServiceItem } from '../../services/serviceApi';
import { savedApi } from '../../services/savedApi';

import { BookingModal, BookingModalItem } from '../../components/common/BookingModal';
import { paymentConfig } from '../../config/paymentConfig';

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewsCount: number;
  startingPrice: number;
  image: string;
  badge: { text: string; color: string };
  verified: boolean;
  tags: string[];
  features: string[];
}

export const ServicesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All Services');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [providersList, setProvidersList] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingModalItem, setBookingModalItem] = useState<BookingModalItem | null>(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await serviceApi.getAll();
      if (Array.isArray(data)) {
        const mapped: ServiceProvider[] = data.map((s: ExtraServiceItem) => ({
          id: s._id || s.code,
          name: s.name,
          category: s.category || 'General Service',
          location: s.location?.address ? `${s.location.address}, ${s.location.city}` : `${s.corridor || 'Bhilai'}, Chhattisgarh`,
          rating: s.rating || 5.0,
          reviewsCount: s.reviewCount || 0,
          startingPrice: s.basePrice || 0,
          image: s.images?.[0] || '',
          badge: { text: 'Verified', color: 'bg-[#225944] text-white' },
          verified: true,
          tags: [s.priceUnit || 'per visit', s.corridor || 'Bhilai'],
          features: ['⚡ Verified EaseHub Partner', '₹ Transparent Pricing', '🕒 Doorstep Service'],
        }));
        setProvidersList(mapped);
      }
    } catch (err: any) {
      console.error('Failed to load extra services from API:', err);
      setError('Unable to load extra services. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'customer') {
      savedApi.getSavedItems().then((records) => {
        const srvSavedIds = records.filter((r) => r.item_type === 'services').map((r) => r.item_id);
        setFavorites(srvSavedIds);
      }).catch(() => setFavorites([]));
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, user]);

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    const isFav = favorites.includes(id);
    if (isFav) {
      setFavorites((prev) => prev.filter((i) => i !== id));
      await savedApi.removeSavedItem('services', id);
    } else {
      setFavorites((prev) => [...prev, id]);
      await savedApi.saveItem('services', id);
    }
  };

  const handleBooking = (provider: ServiceProvider) => {
    setBookingModalItem({
      id: provider.id,
      name: provider.name,
      type: 'Service',
      price: provider.startingPrice,
      priceUnit: '/ visit',
      location: provider.location,
      image: provider.image,
    });
    setIsBookingModalOpen(true);
  };

  const filteredProviders = providersList.filter((provider) => {
    if (activeFilter !== 'All Services' && activeFilter !== 'More') {
      if (!provider.category.toLowerCase().includes(activeFilter.toLowerCase()) &&
          !provider.tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()))) {
        return false;
      }
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        provider.name.toLowerCase().includes(q) ||
        provider.category.toLowerCase().includes(q) ||
        provider.location.toLowerCase().includes(q) ||
        provider.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="bg-[#F7F5EF] text-[#171A18] font-sans antialiased min-h-screen flex flex-col selection:bg-[#EECA3A] selection:text-[#171A18]">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 flex-grow w-full">
        
        {/* HERO SECTION (Exact Match to Reference HTML & Image) */}
        <section className="relative bg-[#f4f1ea] rounded-3xl overflow-hidden border border-[#eae6dc] shadow-xs mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] items-center">
            
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 p-8 sm:p-12 z-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e3eae3] text-[#225944] text-xs font-bold tracking-wider uppercase mb-5">
                <span>YOUR EVERYDAY NEEDS, JUST EASIER.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#225944] leading-[1.12] tracking-tight mb-4">
                Trusted Services <br />
                At Your <span className="text-[#EECA3A]">Doorstep</span>
              </h1>

              <p className="text-[#6B6B63] text-lg sm:text-xl font-normal mb-8 max-w-xl">
                Verified professionals for all your home & daily needs
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 text-sm font-semibold text-[#225944]">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#225944] text-white">
                    <svg className="w-3 h-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>Verified Professionals</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#225944] text-white">
                    <svg className="w-3 h-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>Affordable Pricing</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#225944] text-white">
                    <svg className="w-3 h-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>On-Time Service</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#225944] text-white">
                    <svg className="w-3 h-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>Safe & Reliable</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Banner */}
            <div className="lg:col-span-5 relative h-full flex items-end justify-center pt-8 pr-6 min-h-[380px]">
              
              {/* Handwritten Sticky Notes */}
              <div className="absolute top-10 left-6 sm:left-2 -rotate-6 z-20 select-none pointer-events-none">
                <span className="font-handwriting text-2xl sm:text-3xl text-[#171A18] leading-none block font-bold">
                  Skilled<br />People<br />Happier<br />Homes
                </span>
                <div className="w-20 h-1 bg-[#EECA3A]/80 mt-1 rounded-full" />
              </div>

              <div className="absolute top-12 right-6 rotate-6 z-20 select-none pointer-events-none text-right">
                <span className="font-handwriting text-2xl sm:text-3xl text-[#171A18] leading-none block font-bold">
                  Home<br />Services<br />Made Simple
                </span>
                <div className="w-20 h-1 bg-[#EECA3A]/80 mt-1 ml-auto rounded-full" />
              </div>

              {/* Service Partner Visual */}
              <div className="h-[340px] sm:h-[380px] w-64 rounded-2xl bg-gradient-to-br from-[#225944] to-[#184232] text-white p-6 flex flex-col justify-between z-10 shadow-xl border border-white/20">
                <span className="material-symbols-outlined text-6xl text-[#EECA3A]">handyman</span>
                <div>
                  <h4 className="text-xl font-black">Doorstep Repairs</h4>
                  <p className="text-xs text-white/80 mt-1">Verified Electricians, Plumbers & Technicians</p>
                </div>
              </div>
            </div>

          </div>

          {/* Floating Search Bar */}
          <div className="p-4 sm:p-5 bg-white/95 backdrop-blur-sm border-t border-[#E5E1D6]">
            <form onSubmit={(e) => e.preventDefault()} className="bg-white border border-[#E5E1D6] shadow-lg rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2">
              
              {/* Search Field */}
              <div className="flex items-center flex-1 px-3 w-full border-b md:border-b-0 md:border-r border-[#E5E1D6] py-2">
                <svg className="w-5 h-5 text-[#225944] mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search service (e.g. electrician, plumber) or area"
                  className="w-full text-sm placeholder-[#6B6B63] border-0 focus:ring-0 text-[#171A18] font-medium p-0 outline-none bg-transparent"
                />
              </div>

              {/* Location Action */}
              <button
                type="button"
                onClick={() => setSearchQuery('Bhilai, Chhattisgarh')}
                className="hidden sm:flex items-center gap-1.5 px-3 text-xs font-semibold text-[#6B6B63] hover:text-[#171A18] py-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4 text-[#225944]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Use current location</span>
              </button>

              {/* Category Selector */}
              <div className="flex items-center px-4 py-2 border-t md:border-t-0 md:border-l border-[#E5E1D6] w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#171A18]">
                  <svg className="w-4 h-4 text-[#225944]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>All Services</span>
                </div>
                <svg className="w-4 h-4 text-[#6B6B63] ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Search Submit CTA */}
              <button
                type="submit"
                className="w-full md:w-auto bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>

            </form>
          </div>
        </section>

        {/* QUICK FILTER CATEGORY BAR */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-3 mb-8">
          {[
            { name: 'All Services', icon: '🛠️' },
            { name: 'Electrician', icon: '⚡' },
            { name: 'Plumber', icon: '🚰' },
            { name: 'Carpenter', icon: '🪓' },
            { name: 'AC Service', icon: '❄️' },
            { name: 'Painter', icon: '🖌️' },
            { name: 'Cleaning', icon: '🧹' },
            { name: 'Pest Control', icon: '🐞' },
            { name: 'Appliance Repair', icon: '🔧' },
            { name: 'Packers & Movers', icon: '📦' },
            { name: 'Bike/Car Service', icon: '🚗' },
            { name: 'More', icon: '▾' }
          ].map((cat) => {
            const isActive = activeFilter === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveFilter(cat.name)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#EECA3A] text-[#171A18] font-bold shadow-xs'
                    : 'bg-white border border-[#E5E1D6] text-[#171A18] hover:border-[#225944]/40'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN MARKETPLACE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: PROVIDERS FEED (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Results Counter & Sort */}
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-xl font-extrabold text-[#171A18] tracking-tight">
                {filteredProviders.length} Trusted Service Providers near you
              </h2>
              <div className="flex items-center gap-2 text-sm text-[#6B6B63]">
                <span className="text-xs font-medium text-[#6B6B63]">Sort by:</span>
                <select className="bg-white border border-[#E5E1D6] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#171A18] focus:outline-none cursor-pointer">
                  <option value="recommended">Recommended</option>
                  <option value="rating">Rating: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                </select>
              </div>
            </div>

            {/* Provider Cards */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-[#E5E1D6] p-12 text-center shadow-xs">
                <div className="w-10 h-10 border-4 border-[#225944] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-[#171A18]">Loading Home & Extra Services...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center text-red-700 shadow-xs font-semibold text-sm space-y-3">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={loadServices}
                  className="px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#194434] transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E1D6] p-12 text-center shadow-xs">
                <div className="w-16 h-16 bg-[#225944]/10 text-[#225944] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">home_repair_service</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#171A18]">No extra services available yet.</h3>
                <p className="text-sm text-[#6B6B63] mt-2 font-medium">
                  Verified repair and utility service providers will appear here once added from the Admin Panel.
                </p>
              </div>
            ) : (
              filteredProviders.map((provider) => {
              const isFav = favorites.includes(provider.id);

              return (
                <article
                  key={provider.id}
                  className="bg-white rounded-2xl border border-[#E5E1D6] p-5 shadow-xs hover:shadow-md transition duration-200"
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    
                    {/* Thumbnail Image */}
                    <div className="relative sm:w-56 h-44 rounded-xl overflow-hidden shrink-0 bg-[#E5E1D6]/40 flex items-center justify-center">
                      {provider.image ? (
                        <img
                          src={provider.image}
                          alt={provider.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#225944]">
                          <span className="material-symbols-outlined text-4xl mb-1">handyman</span>
                          <span className="text-xs font-bold text-center">Home & Repair Service</span>
                        </div>
                      )}
                      <span className={`absolute top-3 left-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${provider.badge.color}`}>
                        {provider.badge.text}
                      </span>
                      <button
                        type="button"
                        aria-label="Favorite"
                        onClick={(e) => toggleFavorite(provider.id, e)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#171A18] hover:text-red-500 transition shadow-xs"
                      >
                        <svg className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* Body Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title & Verified Badge */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-[#171A18]">{provider.name}</h3>
                            <span className="text-[#EECA3A] text-sm">★</span>
                            <span className="text-xs font-bold text-[#171A18]">{provider.rating}</span>
                            <span className="text-xs text-[#6B6B63]">({provider.reviewsCount} reviews)</span>
                          </div>
                          {provider.verified && (
                            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              ✔ Verified
                            </span>
                          )}
                        </div>

                        {/* Location */}
                        <p className="text-xs text-[#6B6B63] mt-1 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-[#6B6B63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {provider.location}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {provider.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-gray-100 text-[#171A18] font-medium px-2.5 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer: Specs & Price */}
                      <div className="pt-4 border-t border-gray-100 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 text-xs font-medium text-[#6B6B63] flex-wrap">
                          {provider.features.map((feat, idx) => (
                            <span key={idx}>{feat}</span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <div className="text-right">
                            <span className="text-xl font-black text-[#171A18] leading-none">₹{provider.startingPrice}</span>
                            <span className="block text-[10px] text-[#6B6B63]">Starting from</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleBooking(provider)}
                            className="bg-[#225944] hover:bg-[#194434] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition"
                          >
                            <span>Book Now</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                </article>
              );
            }))}

          </div>

          {/* RIGHT COLUMN: SIDEBAR WIDGETS (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Widget 1: Promo Card */}
            <div className="bg-[#dcf0e2] rounded-3xl p-6 relative overflow-hidden border border-[#cfe5d6]">
              <span className="bg-[#EECA3A] text-[#171A18] text-[11px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-3">
                Professional Services
              </span>
              <h3 className="text-2xl font-extrabold text-[#225944] leading-tight mb-2">
                From Fixes<br />to Fresh Starts
              </h3>
              <p className="text-xs text-[#6B6B63] font-medium mb-5 max-w-[200px]">
                Reliable service professionals for a better home
              </p>
              <button
                type="button"
                className="bg-[#225944] hover:bg-[#194434] text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-xs transition"
              >
                <span>Explore Services</span>
                <span>→</span>
              </button>
              
              <div className="absolute top-4 right-4 text-center font-handwriting rotate-12 z-10 select-none">
                <span className="text-xl font-bold text-[#225944] block leading-none">Same<br />Day<br />Service</span>
                <div className="w-8 h-0.5 bg-[#EECA3A] mx-auto mt-1" />
              </div>
            </div>

            {/* Widget 2: Why Choose EaseHub Services? Grid */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs">
              <h4 className="text-base font-bold text-[#171A18] mb-5">
                Why Choose EaseHub Services?
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    🛡️
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#171A18] leading-tight">Verified Professionals</h5>
                    <p className="text-[11px] text-[#6B6B63] mt-0.5 leading-snug">Background checked</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold">₹</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#171A18] leading-tight">Affordable Pricing</h5>
                    <p className="text-[11px] text-[#6B6B63] mt-0.5 leading-snug">No hidden charges</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    ⏱️
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#171A18] leading-tight">On-Time Service</h5>
                    <p className="text-[11px] text-[#6B6B63] mt-0.5 leading-snug">Your time matters</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    📱
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#171A18] leading-tight">Easy Booking</h5>
                    <p className="text-[11px] text-[#6B6B63] mt-0.5 leading-snug">Book in minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 3: Custom Service Request */}
            <div className="bg-white rounded-3xl p-5 border border-[#E5E1D6] shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#225944] flex items-center justify-center shrink-0 font-bold text-xl">
                  ⚙️
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#171A18]">Need a Custom Service?</h5>
                  <p className="text-xs text-[#6B6B63] leading-snug">Can't find what you're looking for?<br />Tell us your requirement.</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Submit Custom Service Request"
                className="w-11 h-11 rounded-xl bg-[#225944] hover:bg-[#194434] text-white flex items-center justify-center shrink-0 transition"
              >
                →
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Global Booking & Contact Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        item={bookingModalItem}
      />
    </div>
  );
};

export default ServicesPage;
