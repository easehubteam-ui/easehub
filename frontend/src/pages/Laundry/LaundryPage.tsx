import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { laundryApi, LaundryProvider as ApiLaundryProvider } from '../../services/laundryApi';
import { savedApi } from '../../services/savedApi';
import { useAuth } from '../../context/AuthContext';

interface LaundryProvider {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewsCount: number;
  pricePerKg: number;
  image: string;
  badge: { text: string; color: string };
  services: string[];
  turnaround: string;
  freePickup: boolean;
  specialFeature: string;
}

export const LaundryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [activeFilter, setActiveFilter] = useState<string>('All Services');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [providersList, setProvidersList] = useState<LaundryProvider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const loadLaundry = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await laundryApi.getAll();
      if (Array.isArray(data)) {
        const mapped: LaundryProvider[] = data.map((l: ApiLaundryProvider) => {
          const serviceStrings = Array.isArray(l.tags) && l.tags.length > 0
            ? l.tags
            : (Array.isArray(l.services)
                ? l.services.map((s: any) => typeof s === 'string' ? s : (s?.name || String(s)))
                : ['Wash & Fold', 'Dry Cleaning']);

          return {
            id: l._id || l.code || String(l.id),
            name: l.name || 'Express Laundry Partner',
            location: l.location?.address ? `${l.location.address}, ${l.location.city}` : `${l.corridor || 'Bhilai'}, Chhattisgarh`,
            rating: l.rating || 4.8,
            reviewsCount: l.reviewCount || 18,
            pricePerKg: l.perKgPrice || l.pricePerKg || 50,
            image: l.image || (l.images && l.images[0]) || '',
            badge: { text: 'Verified', color: 'bg-[#225944] text-white' },
            services: serviceStrings.filter(Boolean),
            turnaround: l.turnaroundHours ? `${l.turnaroundHours} hours` : '24 hours',
            freePickup: l.pickupAvailable ?? true,
            specialFeature: 'Doorstep Pickup & Delivery',
          };
        });
        setProvidersList(mapped);
      }
    } catch (err: any) {
      console.error('Failed to load laundry providers from API:', err);
      setError('Unable to load laundry providers. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaundry();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'customer') {
      savedApi.getSavedItems().then((records) => {
        const lndSavedIds = records.filter((r) => r.item_type === 'laundry').map((r) => r.item_id);
        setFavorites(lndSavedIds);
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
      await savedApi.removeSavedItem('laundry', id);
    } else {
      setFavorites((prev) => [...prev, id]);
      await savedApi.saveItem('laundry', id);
    }
  };

  const filteredProviders = providersList.filter((provider) => {
    if (activeFilter === 'Wash & Fold' && !provider.services.some((s) => typeof s === 'string' && s.toLowerCase().includes('wash'))) return false;
    if (activeFilter === 'Dry Cleaning' && !provider.services.some((s) => typeof s === 'string' && s.toLowerCase().includes('dry'))) return false;
    if (activeFilter === 'Express (24h)' && !provider.turnaround.includes('24')) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        (provider.name || '').toLowerCase().includes(q) ||
        (provider.location || '').toLowerCase().includes(q) ||
        (provider.services || []).some((s) => typeof s === 'string' && s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="bg-[#F7F5EF] text-[#171A18] font-sans antialiased min-h-screen flex flex-col selection:bg-[#EECA3A] selection:text-[#171A18]">
      <main className="flex-grow">
        
        {/* HERO SECTION (Exact Match to Spec & Reference Image) */}
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="relative bg-gradient-to-r from-[#EDE8DC] via-[#FAF7F0] to-[#E9F0EC] rounded-3xl p-6 sm:p-10 overflow-hidden border border-[#E5E3DC]/60 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Hero Text Details */}
              <div className="lg:col-span-7 z-10">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#225944]/80 mb-2">
                  CLEAN CLOTHES. BRIGHTER DAYS.
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#225944] mb-3">
                  Laundry <span className="text-[#EECA3A]">Made Easy</span>
                </h1>
                <p className="text-lg text-[#6B6B63] font-medium mb-6">
                  Pickup <span className="text-[#EECA3A]">•</span> Clean <span className="text-[#EECA3A]">•</span> Fresh <span className="text-[#EECA3A]">•</span> Delivered
                </p>

                {/* Value Pills */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center space-x-2 text-sm font-medium text-[#171A18]">
                    <span className="w-7 h-7 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>Hygienic Cleaning</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm font-medium text-[#171A18]">
                    <span className="w-7 h-7 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    <span>Fabric Safe</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm font-medium text-[#171A18]">
                    <span className="w-7 h-7 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    <span>Quick Turnaround</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm font-medium text-[#171A18]">
                    <span className="w-7 h-7 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </span>
                    <span>Free Pickup & Delivery</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Visual Banner */}
              <div className="lg:col-span-5 relative flex items-center justify-end">
                <div className="relative w-full max-w-md h-52 sm:h-60 rounded-2xl overflow-hidden shadow-lg border border-white/60 bg-[#225944] text-white p-6 flex flex-col justify-between">
                  
                  {/* Playful Handwritten Tag */}
                  <div className="self-start -rotate-6 bg-[#EECA3A] text-[#171A18] px-3.5 py-1.5 rounded-lg font-handwriting text-xl sm:text-2xl font-bold shadow-md">
                    Leave the Laundry to Us
                  </div>

                  {/* Delivery Note */}
                  <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-[#225944] flex items-center space-x-1.5 shadow-sm self-start">
                    <svg className="w-4 h-4 text-[#225944]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                    <span>Fresh Folded Delivered</span>
                  </div>

                  {/* Side Sticker Note */}
                  <div className="absolute top-4 right-4 bg-[#F7F5EF] border border-[#EECA3A] px-3 py-2 rounded-xl text-right shadow-xs rotate-3">
                    <span className="block font-handwriting text-base sm:text-lg font-bold text-[#171A18] leading-none">More Time</span>
                    <span className="block font-handwriting text-sm text-[#6B6B63]">For What Matters :)</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FLOATING SEARCH CONSOLE */}
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-2 relative z-30">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E3DC] p-2 sm:p-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              
              {/* Search Input */}
              <div className="flex-1 flex items-center px-3.5 py-2.5">
                <svg className="w-5 h-5 text-[#225944] shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, area or landmark (e.g. Civic Center, Junwani)"
                  className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-[#171A18] placeholder-[#6B6B63] font-medium outline-none"
                />
              </div>

              {/* Current Location Trigger */}
              <button
                type="button"
                onClick={() => setSearchQuery('Civic Center, Bhilai')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-[#225944] hover:bg-[#E9F2EE] rounded-xl transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="7" strokeWidth="2" />
                  <circle cx="12" cy="12" fill="currentColor" r="2" />
                </svg>
                <span>Use current location</span>
              </button>

              <div className="hidden md:block w-px h-8 bg-[#E5E3DC]" />

              {/* Service Dropdown */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 md:bg-transparent rounded-xl shrink-0 cursor-pointer">
                <svg className="w-5 h-5 text-[#225944]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect height="20" rx="3" strokeWidth="2" width="16" x="4" y="2" />
                  <circle cx="12" cy="12" r="4" strokeWidth="2" />
                </svg>
                <span className="text-sm font-semibold text-[#171A18]">Laundry</span>
                <svg className="w-4 h-4 text-[#6B6B63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Search CTA Button */}
              <button
                type="button"
                className="flex items-center justify-center space-x-2 bg-[#EECA3A] hover:bg-[#DFB92D] px-8 py-3.5 rounded-xl font-bold text-[#171A18] shadow transition-transform active:scale-95 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>

            </div>
          </div>
        </section>

        {/* QUICK FILTER CATEGORY CHIPS */}
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 custom-scrollbar">
            
            {[
              { name: 'All Services', icon: '🧺' },
              { name: 'Wash & Fold', icon: '🧼' },
              { name: 'Dry Cleaning', icon: '👔' },
              { name: 'Steam Ironing', icon: '⚡' },
              { name: 'Shoe Cleaning', icon: '👟' },
              { name: 'Bed & Linen', icon: '🛏️' },
              { name: 'Express (24h)', icon: '⏱️' },
              { name: 'Premium Care', icon: '✨' },
              { name: 'More', icon: '▾' }
            ].map((chip) => {
              const isActive = activeFilter === chip.name;
              return (
                <button
                  key={chip.name}
                  type="button"
                  onClick={() => setActiveFilter(chip.name)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold text-xs sm:text-sm shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#EECA3A]/30 border border-[#EECA3A] text-[#171A18] font-bold shadow-xs'
                      : 'bg-white border border-[#E5E3DC] hover:border-[#225944]/40 text-[#171A18]'
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.name}</span>
                </button>
              );
            })}

          </div>
        </section>

        {/* MAIN CONTENT GRID (8 Cols Left / 4 Cols Right) */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          
          {/* Results Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171A18]">
              {filteredProviders.length} Laundry Services near you
            </h2>

            <div className="flex items-center space-x-2 text-sm text-[#6B6B63]">
              <span>Sort by:</span>
              <select className="bg-transparent border-none text-sm font-semibold text-[#171A18] focus:ring-0 pr-7 py-0 cursor-pointer">
                <option value="recommended">Recommended</option>
                <option value="rating">Rating: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="fastest">Fastest Turnaround</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: PROVIDER LISTINGS (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              {loading ? (
                <div className="bg-white rounded-2xl border border-[#E5E3DC] p-12 text-center shadow-xs">
                  <div className="w-10 h-10 border-4 border-[#225944] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-bold text-[#171A18]">Loading Laundry Partners...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center text-red-700 shadow-xs font-semibold text-sm space-y-3">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={loadLaundry}
                    className="px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#194434] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredProviders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E3DC] p-12 text-center shadow-xs">
                  <div className="w-16 h-16 bg-[#225944]/10 text-[#225944] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">dry_cleaning</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#171A18]">No laundry providers available yet.</h3>
                  <p className="text-sm text-[#6B6B63] mt-2 font-medium">
                    Verified doorstep laundry partners will appear here once added from the Admin Panel.
                  </p>
                </div>
              ) : (
                filteredProviders.map((provider) => {
                const isFav = favorites.includes(provider.id);

                return (
                  <article
                    key={provider.id}
                    className="bg-white rounded-2xl border border-[#E5E3DC] p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      
                      {/* Image Storefront Preview */}
                      <div className="relative w-full sm:w-56 h-44 sm:h-auto rounded-xl overflow-hidden shrink-0 bg-[#E5E3DC]/40 flex items-center justify-center">
                        {provider.image ? (
                          <img
                            src={provider.image}
                            alt={provider.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#225944]">
                            <span className="material-symbols-outlined text-4xl mb-1">local_laundry_service</span>
                            <span className="text-xs font-bold text-center">Laundry Partner</span>
                          </div>
                        )}
                        <span className={`absolute top-2.5 left-2.5 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${provider.badge.color}`}>
                          {provider.badge.text}
                        </span>
                        
                        <button
                          type="button"
                          aria-label="Favorite"
                          onClick={(e) => toggleFavorite(provider.id, e)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-xs transition-colors"
                        >
                          <svg className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title & Pricing Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-[#171A18] hover:text-[#225944] cursor-pointer transition-colors">
                                {provider.name}
                              </h3>
                              <p className="flex items-center text-xs font-medium text-[#6B6B63] mt-1">
                                <svg className="w-3.5 h-3.5 mr-1 text-[#225944]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {provider.location}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-xl font-bold text-[#171A18]">₹{provider.pricePerKg}<span className="text-xs font-normal text-[#6B6B63]">/kg</span></span>
                              <span className="block text-[10px] text-[#6B6B63] uppercase font-medium">Starting from</span>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center space-x-1.5 mt-2">
                            <div className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                              ★ {provider.rating}
                            </div>
                            <span className="text-xs text-[#6B6B63]">({provider.reviewsCount} reviews)</span>
                          </div>

                          {/* Service Badges */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {provider.services.map((service, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2.5 py-1 bg-gray-100 text-[#171A18] rounded-md font-medium"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Footer Row: Specs & CTA */}
                        <div className="pt-4 mt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center space-x-4 text-xs font-medium text-[#6B6B63]">
                            <span className="flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1 text-[#225944]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Free Pickup & Delivery
                            </span>
                            <span className="flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1 text-[#225944]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {provider.turnaround}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1 text-[#225944]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                              </svg>
                              {provider.specialFeature}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="bg-[#225944] hover:bg-[#194434] text-white font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-1.5 transition-colors"
                          >
                            <span>View Details</span>
                            <span>→</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  </article>
                );
              }))}
            </div>

            {/* RIGHT COLUMN: SIDEBAR CARDS (4 Cols) */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* SIDEBAR CARD 1: Laundry Subscription Promo */}
              <div className="bg-gradient-to-br from-[#EBF5EE] via-[#F6FBF7] to-[#FFF9E6] rounded-2xl border border-[#E5E3DC] p-6 shadow-xs relative overflow-hidden">
                <div className="relative z-10">
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#225944] bg-[#225944]/10 px-2.5 py-1 rounded-md mb-3">
                    LAUNDRY SUBSCRIPTION
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#225944] leading-snug">
                    Clean Clothes Every Week
                  </h3>
                  <p className="text-sm text-[#6B6B63] mt-2 mb-4 leading-relaxed">
                    Get weekly or monthly plans at special prices
                  </p>
                  <button
                    type="button"
                    className="bg-[#225944] hover:bg-[#194434] text-white font-bold text-sm px-5 py-2.5 rounded-lg inline-flex items-center space-x-2 transition-all shadow-xs"
                  >
                    <span>View Plans</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Towels Stack Graphic & Smiley Note */}
                <div className="mt-4 pt-2 relative flex items-center justify-end">
                  <div className="w-44 h-28 rounded-xl bg-[#225944] text-white flex flex-col items-center justify-center p-3 shadow-md border-2 border-white">
                    <span className="material-symbols-outlined text-3xl mb-1 text-[#EECA3A]">dry_cleaning</span>
                    <span className="text-xs font-bold text-center">Doorstep Wash & Press</span>
                  </div>
                </div>
              </div>

              {/* SIDEBAR CARD 2: Trust & Value Grid */}
              <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-xs">
                <div className="grid grid-cols-2 gap-5 text-center">
                  
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#E9F2EE] flex items-center justify-center text-[#225944] mb-2.5">
                      🚚
                    </div>
                    <span className="text-xs font-semibold text-[#171A18] leading-tight">Free Pickup & Delivery</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#E9F2EE] flex items-center justify-center text-[#225944] mb-2.5">
                      👕
                    </div>
                    <span className="text-xs font-semibold text-[#171A18] leading-tight">Safe for All Fabrics</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#E9F2EE] flex items-center justify-center text-[#225944] mb-2.5">
                      ⏱️
                    </div>
                    <span className="text-xs font-semibold text-[#171A18] leading-tight">On-Time Delivery</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#E9F2EE] flex items-center justify-center text-[#225944] mb-2.5">
                      🛡️
                    </div>
                    <span className="text-xs font-semibold text-[#171A18] leading-tight">Trusted & Verified</span>
                  </div>

                </div>
              </div>

              {/* SIDEBAR CARD 3: Schedule a Pickup Prompt */}
              <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-xs flex items-center justify-between hover:border-[#225944]/40 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E9F2EE] flex items-center justify-center text-[#225944] shrink-0 font-bold text-xl">
                    📅
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#171A18] group-hover:text-[#225944] transition-colors">
                      Schedule a Pickup Now
                    </h4>
                    <p className="text-xs text-[#6B6B63] mt-0.5">
                      Get your clothes cleaned without leaving home.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-[#225944] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#194434] transition-all transform group-hover:translate-x-0.5"
                >
                  →
                </button>
              </div>

            </aside>

          </div>
        </div>
      </main>
    </div>
  );
};

export default LaundryPage;
