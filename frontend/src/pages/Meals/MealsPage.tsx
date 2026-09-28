import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import LocationMap from '../../components/common/LocationMap';
import { PGLocationData } from '../PG/PGPage';
import { mealApi, MealProvider as ApiMealProvider } from '../../services/mealApi';
import { savedApi } from '../../services/savedApi';
import { useAuth } from '../../context/AuthContext';

import { BookingModal, BookingModalItem } from '../../components/common/BookingModal';
import { paymentConfig } from '../../config/paymentConfig';
import PlaceholderImage from '../../components/common/PlaceholderImage';
import { SkeletonCard } from '../../components/common/SkeletonCard';

interface MealProvider {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewsCount: number;
  pricePerMeal: number;
  image: string;
  badge: { text: string; color: string };
  tags: string[];
  mealsPerDay: string;
  deliveryAvailable: boolean;
  opensAt: string;
  isVeg: boolean;
  locationData?: PGLocationData;
}

export const MealsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [providersList, setProvidersList] = useState<MealProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<MealProvider | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingModalItem, setBookingModalItem] = useState<BookingModalItem | null>(null);

  const loadMeals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await mealApi.getAll();
      if (Array.isArray(data)) {
        const mapped: MealProvider[] = data.map((m: ApiMealProvider) => {
          const safeTags = Array.isArray(m.tags) ? m.tags : [];
          const lat = m.location?.latitude;
          const lng = m.location?.longitude;

          return {
            id: m._id || m.code || String(m.id),
            name: m.name || 'Verified Mess Partner',
            location: m.location?.address ? `${m.location.address}, ${m.location.city}` : `${m.corridor || 'Bhilai'}, Chhattisgarh`,
            rating: m.rating || 4.9,
            reviewsCount: m.reviewCount || 24,
            pricePerMeal: m.dailyPrice || 120,
            image: m.image || '',
            badge: { text: m.isVeg ? 'Pure Veg' : 'Veg & Non-Veg', color: 'bg-[#225944] text-white' },
            tags: safeTags,
            mealsPerDay: 'Breakfast, Lunch & Dinner',
            deliveryAvailable: true,
            opensAt: '7:00 AM',
            isVeg: m.isVeg ?? true,
            locationData: {
              address: m.location?.address || m.corridor || 'Bhilai',
              landmark: m.location?.landmark || m.distance || '',
              city: m.location?.city || 'Bhilai',
              state: m.location?.state || 'Chhattisgarh',
              pincode: m.location?.pincode || '',
              latitude: lat ?? undefined,
              longitude: lng ?? undefined,
            },
          };
        });
        setProvidersList(mapped);
        if (mapped.length > 0) setSelectedProvider(mapped[0]);
      }
    } catch (err: any) {
      console.error('Failed to load meal providers from API:', err);
      setError('Unable to load meal providers. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeals();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'customer') {
      savedApi.getSavedItems().then((records) => {
        const mealSavedIds = records.filter((r) => r.item_type === 'meals').map((r) => r.item_id);
        setFavorites(mealSavedIds);
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
      setFavorites((prev) => prev.filter((item) => item !== id));
      await savedApi.removeSavedItem('meals', id);
    } else {
      setFavorites((prev) => [...prev, id]);
      await savedApi.saveItem('meals', id);
    }
  };

  const filteredProviders = providersList.filter((provider) => {
    if (activeFilter === 'Veg' && !provider.isVeg) return false;
    if (activeFilter === 'Non-Veg' && provider.isVeg) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        (provider.name || '').toLowerCase().includes(q) ||
        (provider.location || '').toLowerCase().includes(q) ||
        (provider.tags || []).some((t) => typeof t === 'string' && t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="bg-[#F7F5EF] text-[#171A18] font-sans antialiased min-h-screen flex flex-col selection:bg-[#EECA3A] selection:text-[#171A18]">
      <main className="flex-grow">
        {/* HERO DISCOVERY SECTION (Exact Match to Spec & Reference) */}
        <section className="relative pt-8 pb-14 overflow-hidden border-b border-[#E5E1D6]/60 bg-gradient-to-b from-[#F7F5EF] via-[#FFFDF7] to-[#F7F5EF]">
          
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Copywriting */}
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E5E1D6]/50 text-xs font-semibold text-[#171A18] tracking-wide">
                  <span>Good Food. Better Days.</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#171A18] leading-[1.12] tracking-tight">
                  Tasty & Healthy <span className="text-[#EECA3A]">Meals</span> Near You
                </h1>

                <p className="text-base sm:text-lg text-[#6B6B63] max-w-lg font-normal">
                  Home-like food from trusted messes and kitchens
                </p>
              </div>

              {/* Right Column: Thali Dish Showcase Visual */}
              <div className="lg:col-span-6 relative flex items-center justify-end">
                <div className="relative w-full max-w-lg">
                  
                  {/* Handwritten Tags */}
                  <div className="absolute -top-4 left-6 z-20 flex flex-col items-start select-none transform -rotate-6">
                    <span className="font-handwriting text-3xl font-bold text-[#225944] leading-5">Fresh</span>
                    <span className="font-handwriting text-2xl font-bold text-[#EECA3A] ml-3">Healthy</span>
                    <span className="font-handwriting text-2xl font-bold text-[#171A18] ml-6">Affordable</span>
                  </div>

                  {/* Main Thali Presentation Circle */}
                  <div className="relative z-10 w-80 sm:w-96 h-80 sm:h-96 mx-auto rounded-full p-6 bg-gradient-to-br from-[#225944] via-[#1a4535] to-[#113125] shadow-2xl backdrop-blur-sm border-4 border-[#EECA3A]/50 flex flex-col items-center justify-center text-center text-white">
                    <span className="material-symbols-outlined text-6xl text-[#EECA3A] mb-2 animate-bounce">skillet</span>
                    <h3 className="text-2xl font-black">Homestyle Meals</h3>
                    <p className="text-xs text-white/80 mt-1 max-w-[200px]">Fresh, nutritious daily breakfast, lunch & dinner</p>
                  </div>

                  {/* Badge 1: Affordable Plans */}
                  <div className="absolute right-0 top-6 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-[#E5E1D6] flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#FFF3C4] flex items-center justify-center text-[#171A18] font-bold text-sm">
                      ₹
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171A18]">Affordable</p>
                      <p className="text-[11px] text-[#6B6B63] font-medium">Plans</p>
                    </div>
                  </div>

                  {/* Badge 2: Home-like Taste */}
                  <div className="absolute right-4 bottom-8 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-[#E5E1D6] flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-[#2F7D55]">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171A18]">Home-like</p>
                      <p className="text-[11px] text-[#6B6B63] font-medium">Taste</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* MULTI-PARAM SEARCH CONSOLE */}
            <div className="mt-8 relative z-30">
              <div className="bg-white rounded-2xl shadow-lg border border-[#E5E1D6] p-3 flex flex-col md:flex-row items-center gap-2.5">
                
                {/* Search Input */}
                <div className="flex items-center flex-1 w-full px-3 py-1.5 border-b md:border-b-0 md:border-r border-[#E5E1D6]">
                  <svg className="w-5 h-5 text-[#225944] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meals, mess or area (e.g. Civic Center, Junwani)"
                    className="w-full bg-transparent border-none text-[#171A18] placeholder-[#6B6B63] focus:outline-none text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchQuery('Civic Center, Bhilai')}
                    className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold text-[#225944] bg-[#FFF3C4]/60 hover:bg-[#FFF3C4] px-2.5 py-1.5 rounded-lg ml-2 whitespace-nowrap transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3 0 1.306.835 2.417 2 2.829V17a1 1 0 102 0v-3.171c1.165-.412 2-1.523 2-2.829 0-1.657-1.343-3-3-3z" />
                    </svg>
                    <span>Use current location</span>
                  </button>
                </div>

                {/* Service Type Selector */}
                <div className="flex items-center justify-between w-full md:w-56 px-4 py-1.5 border-b md:border-b-0 md:border-r border-[#E5E1D6]">
                  <div className="flex items-center space-x-2.5">
                    <svg className="w-5 h-5 text-[#225944]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span className="text-sm font-bold text-[#171A18]">Meals</span>
                  </div>
                  <svg className="w-4 h-4 text-[#6B6B63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Submit Search Button */}
                <button
                  type="button"
                  className="w-full md:w-auto px-8 py-3.5 bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] font-bold rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </button>

              </div>
            </div>

          </div>
        </section>

        {/* FILTER CATEGORY STRIP */}
        <section className="py-5 bg-[#F7F5EF] border-b border-[#E5E1D6]">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar pb-1">
              
              {[
                { name: 'All', icon: '🍲', activeBg: 'bg-[#FFF3C4] border-2 border-[#EECA3A]' },
                { name: 'Breakfast', icon: '🥣' },
                { name: 'Lunch', icon: '☀️' },
                { name: 'Dinner', icon: '🌙' },
                { name: 'Veg', icon: '🟢' },
                { name: 'Non-Veg', icon: '🔴' },
                { name: 'Thali', icon: '🍛' },
                { name: 'Monthly Plan', icon: '📅' },
                { name: 'Delivery', icon: '🛵' },
                { name: 'Self Pickup', icon: '🛍️' },
                { name: 'More', icon: '▾' }
              ].map((filter) => {
                const isActive = activeFilter === filter.name;
                return (
                  <button
                    key={filter.name}
                    type="button"
                    onClick={() => setActiveFilter(filter.name)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#FFF3C4] border-2 border-[#EECA3A] text-[#171A18] font-bold shadow-xs'
                        : 'bg-white border border-[#E5E1D6] text-[#171A18] hover:bg-[#FFF3C4]/40'
                    }`}
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.name}</span>
                  </button>
                );
              })}

            </div>
          </div>
        </section>

        {/* MAIN CONTENT SECTION: PROVIDERS & SIDEBAR */}
        <section className="py-8">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: PROVIDERS LISTING (Width ~ 7/12) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Result Header */}
                <div className="flex items-center justify-between pb-1">
                  <h2 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight">
                    {filteredProviders.length} Meal Providers near you
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-medium text-[#6B6B63]">Sort by:</span>
                    <button className="flex items-center space-x-1 text-xs sm:text-sm font-bold text-[#171A18] bg-white px-3 py-1.5 rounded-lg border border-[#E5E1D6] shadow-xs hover:bg-[#F7F5EF]">
                      <span>Recommended</span>
                      <svg className="w-3.5 h-3.5 text-[#6B6B63] ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Provider Cards */}
                {loading ? (
                  <div className="space-y-5">
                    {[1, 2, 3, 4].map((n) => (
                      <SkeletonCard key={n} layout="horizontal" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center text-red-700 shadow-xs font-semibold text-sm space-y-3">
                    <p>{error}</p>
                    <button
                      type="button"
                      onClick={loadMeals}
                      className="px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#194434] transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredProviders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#E5E1D6] p-12 text-center shadow-xs">
                    <div className="w-16 h-16 bg-[#225944]/10 text-[#225944] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl">restaurant_menu</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#171A18]">No meal providers available yet.</h3>
                    <p className="text-sm text-[#6B6B63] mt-2 font-medium">
                      Verified mess and tiffin services will appear here once added from the Admin Panel.
                    </p>
                  </div>
                ) : (
                  filteredProviders.map((provider) => {
                  const isFav = favorites.includes(provider.id);

                  return (
                    <article
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider)}
                      onMouseEnter={() => setSelectedProvider(provider)}
                      className={`bg-white rounded-2xl border transition-all duration-200 p-4 shadow-sm hover:shadow-md flex flex-col sm:flex-row gap-4 relative cursor-pointer ${
                        selectedProvider?.id === provider.id ? 'ring-2 ring-[#225944] border-[#225944]' : 'border-[#E5E1D6]'
                      }`}
                    >
                      {/* Food Image + Badges */}
                      <div className="relative w-full sm:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-[#F7F5EF]">
                        {provider.image ? (
                          <img
                            src={provider.image}
                            alt={provider.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PlaceholderImage type="meals" title={provider.name} />
                        )}
                        <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${provider.badge.color}`}>
                          {provider.badge.text}
                        </span>

                        <button
                          type="button"
                          aria-label="Add to favorites"
                          onClick={(e) => toggleFavorite(provider.id, e)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#171A18] hover:text-red-500 transition-colors shadow-xs"
                        >
                          <svg className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>

                        <span className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-md text-xs font-bold bg-black/80 text-white backdrop-blur-sm">
                          ₹{provider.pricePerMeal}/meal
                        </span>
                      </div>

                      {/* Details Content */}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          {/* Title & Rating */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-[#171A18] truncate">
                              {provider.name}
                            </h3>
                            <div className="flex items-center space-x-1 text-xs font-bold text-[#171A18] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 whitespace-nowrap">
                              <span className="text-amber-500">★</span>
                              <span>{provider.rating}</span>
                              <span className="text-[#6B6B63] font-normal text-[11px]">({provider.reviewsCount} reviews)</span>
                            </div>
                          </div>

                          {/* Location */}
                          <p className="flex items-center text-xs text-[#6B6B63] font-medium mt-1">
                            <svg className="w-3.5 h-3.5 text-[#6B6B63] mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {provider.location}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {provider.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-[#F7F5EF] text-[#171A18] border border-[#E5E1D6]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-3 text-xs text-[#6B6B63] font-medium">
                            <div className="flex items-center">
                              <svg className="w-3.5 h-3.5 text-[#225944] mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                              {provider.mealsPerDay}
                            </div>
                            <span>•</span>
                            <div className="flex items-center text-emerald-700">
                              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Delivery Available
                            </div>
                            <span>•</span>
                            <div className="flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1 text-[#6B6B63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              Opens at {provider.opensAt}
                            </div>
                          </div>
                        </div>

                        {/* Action CTAs */}
                        <div className="flex items-center space-x-2.5 mt-4 pt-3 border-t border-[#E5E1D6]/60">
                          <button
                            type="button"
                            onClick={() => {
                              setBookingModalItem({
                                id: provider.id,
                                name: provider.name,
                                type: 'Meal',
                                price: provider.pricePerMeal,
                                priceUnit: '/ meal',
                                location: provider.location,
                                image: provider.image,
                              });
                              setIsBookingModalOpen(true);
                            }}
                            className="flex-1 py-2 text-xs font-bold rounded-xl border border-[#225944] text-[#225944] bg-white hover:bg-[#225944] hover:text-white transition-colors"
                          >
                            Try Today
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBookingModalItem({
                                id: provider.id,
                                name: `${provider.name} (Monthly Tiffin)`,
                                type: 'Meal',
                                price: provider.pricePerMeal * 30,
                                priceUnit: '/ month',
                                location: provider.location,
                                image: provider.image,
                              });
                              setIsBookingModalOpen(true);
                            }}
                            className="flex-1 py-2 text-xs font-extrabold rounded-xl bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] transition-colors shadow-xs"
                          >
                            1 Month Plan
                          </button>
                        </div>
                      </div>

                    </article>
                  );
                })
              )}

              </div>

              {/* RIGHT COLUMN: STICKY SIDEBARS, MAP & PROMOS (Width ~ 5/12) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
                
                {/* Widget 1: Monthly Meal Plans Promo Banner */}
                <div className="relative overflow-hidden bg-[#225944] text-white rounded-2xl p-6 shadow-md">
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="inline-flex self-start px-2.5 py-1 rounded-md bg-[#EECA3A] text-[#171A18] text-[11px] font-extrabold uppercase tracking-wide">
                      Monthly Meal Plans
                    </div>
                    <div className="my-4 max-w-[240px]">
                      <h3 className="text-2xl font-black leading-tight">
                        Healthy Food Happier You
                      </h3>
                      <p className="text-xs text-white/80 mt-1.5 font-normal leading-relaxed">
                        Home-style meals at special monthly rates
                      </p>
                    </div>
                    <div>
                      <a
                        href="#monthly-plans"
                        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] text-xs font-bold shadow-xs transition-colors"
                      >
                        <span>View Meal Plans</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>

                  {/* Corner Thali Graphic */}
                  <div className="absolute -right-10 -bottom-8 w-44 h-44 rounded-full bg-[#EECA3A]/20 border-4 border-[#EECA3A]/40 flex items-center justify-center text-[#EECA3A]">
                    <span className="material-symbols-outlined text-6xl">lunch_dining</span>
                  </div>
                  <div className="absolute right-4 top-3 select-none pointer-events-none">
                    <span className="font-handwriting text-2xl text-[#EECA3A] rotate-6 block">Eat Good,</span>
                    <span className="font-handwriting text-xl text-white ml-2 block">Feel Good</span>
                  </div>
                </div>

                {/* Widget 2: Live Dynamic Interactive Map for Selected/Hovered Meal Provider */}
                {(() => {
                  if (!selectedProvider) {
                    return (
                      <div className="bg-white rounded-2xl border border-[#E5E1D6] p-8 text-center shadow-xs">
                        <span className="material-symbols-outlined text-4xl text-[#6B6B63] mb-2">map</span>
                        <p className="text-sm font-bold text-[#171A18]">Map preview unavailable</p>
                        <p className="text-xs text-[#6B6B63] mt-1">Mess provider location coordinates will display on map once added by Admin.</p>
                      </div>
                    );
                  }
                  const lat = selectedProvider.locationData?.latitude;
                  const lng = selectedProvider.locationData?.longitude;

                  return (
                    <div className="bg-white rounded-2xl border border-[#E5E1D6] p-3 shadow-md space-y-3 transition-all duration-300">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-rose-500 text-[20px] animate-pulse">location_on</span>
                          <div>
                            <h4 className="text-xs font-extrabold text-[#225944] leading-none">{selectedProvider.name}</h4>
                            <span className="text-[10px] text-[#6B6B63] font-bold">{selectedProvider.location}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EECA3A] text-[#171A18] font-black uppercase">
                          Live GPS Map
                        </span>
                      </div>

                      <LocationMap
                        latitude={lat}
                        longitude={lng}
                        title={selectedProvider.name}
                        address={selectedProvider.locationData?.address || selectedProvider.location}
                        zoom={16}
                        className="w-full h-72 rounded-xl overflow-hidden border border-[#E5E1D6] relative shadow-inner"
                      />

                      <div className="flex items-center justify-between pt-1 px-1">
                        <span className="text-[11px] text-[#6B6B63] font-semibold">
                          {typeof lat === 'number' && typeof lng === 'number' && lat > 0 && lng > 0
                            ? `Exact GPS Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`
                            : 'Location set via Admin Console'}
                        </span>
                        <a
                          href={lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProvider.name + ' ' + selectedProvider.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#225944] hover:underline flex items-center gap-1"
                        >
                          <span>Open in Google Maps</span>
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* Widget 3: Decision Helper Card */}
                <div className="bg-white rounded-2xl border border-[#E5E1D6] p-5 shadow-xs flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF3C4] flex-shrink-0 flex items-center justify-center text-3xl shadow-xs border border-[#EECA3A]/30">
                    👨‍🍳
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-[#171A18] leading-snug">
                      Not sure what to choose?
                    </h4>
                    <p className="text-xs text-[#6B6B63] mt-1 leading-relaxed">
                      Explore popular cuisines, trusted messes and monthly plans near you.
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="inline-flex items-center space-x-1 text-xs font-bold text-[#171A18] border border-[#E5E1D6] bg-[#F7F5EF] hover:bg-white px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                      >
                        <span>Explore Now</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* STUDENT LIVING CROSS-SELL BANNER */}
        <section className="py-10 bg-white border-t border-[#E5E1D6] mt-10">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#F7F5EF] rounded-3xl p-6 sm:p-8 border border-[#E5E1D6] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl text-center md:text-left">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#225944]">Complete Student Living</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171A18]">
                  Need Accommodation & Laundry too?
                </h3>
                <p className="text-sm text-[#6B6B63]">
                  EaseHub combines verified student PGs, verified tiffin providers, and on-demand laundry pickups into one unified monthly subscription.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/pg"
                  className="px-5 py-3 rounded-xl bg-[#225944] text-white text-xs sm:text-sm font-bold hover:bg-[#1a4535] transition-colors"
                >
                  Explore Verified PGs
                </Link>
                <Link
                  to="/laundry"
                  className="px-5 py-3 rounded-xl bg-white border border-[#E5E1D6] text-[#171A18] text-xs sm:text-sm font-bold hover:bg-[#FFF3C4] transition-colors"
                >
                  Book Laundry Service
                </Link>
              </div>
            </div>
          </div>
        </section>

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

export default MealsPage;
