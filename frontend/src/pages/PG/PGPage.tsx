import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import LocationMap from '../../components/common/LocationMap';
import { pgApi, PGProperty } from '../../services/pgApi';
import { savedApi } from '../../services/savedApi';
import { useAuth } from '../../context/AuthContext';

import { BookingModal, BookingModalItem } from '../../components/common/BookingModal';
import { paymentConfig } from '../../config/paymentConfig';
import PlaceholderImage from '../../components/common/PlaceholderImage';

export interface PGLocationData {
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export interface PGListing {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewsCount: number;
  price: number;
  images: string[];
  amenities: string[];
  featured?: boolean;
  mapEmbedUrl?: string;
  locationData?: PGLocationData;
}

export const PGPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [activeImageIdx, setActiveImageIdx] = useState<Record<string, number>>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hoveredListingId, setHoveredListingId] = useState<string>('');
  const [listings, setListings] = useState<PGListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingModalItem, setBookingModalItem] = useState<BookingModalItem | null>(null);

  const loadPGs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await pgApi.getAll();
      if (Array.isArray(data)) {
        const mapped: PGListing[] = data.map((p: PGProperty) => ({
          id: p._id || p.code,
          name: p.name,
          location: p.location?.address ? `${p.location.address}, ${p.location.city}` : `${p.corridor || 'Bhilai'}, Chhattisgarh`,
          rating: p.rating || 5.0,
          reviewsCount: p.reviewCount || 0,
          price: p.monthlyRent || 0,
          images: p.images?.length > 0 ? p.images : [],
          amenities: p.amenities || [],
          featured: p.verified ?? true,
          locationData: {
            address: p.location?.address || p.corridor || '',
            landmark: p.location?.landmark || p.distance || '',
            city: p.location?.city || 'Bhilai',
            state: p.location?.state || 'Chhattisgarh',
            pincode: p.location?.pincode || '',
            latitude: p.location?.latitude || 0,
            longitude: p.location?.longitude || 0,
          },
        }));
        setListings(mapped);
        if (mapped.length > 0) setHoveredListingId(mapped[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load PGs from API:', err);
      setError('Unable to load PG listings. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPGs();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'customer') {
      savedApi.getSavedItems().then((records) => {
        const pgSavedIds = records.filter((r) => r.item_type === 'pg').map((r) => r.item_id);
        setSavedIds(pgSavedIds);
      }).catch(() => setSavedIds([]));
    } else {
      setSavedIds([]);
    }
  }, [isAuthenticated, user]);

  const handleNextImg = (id: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % max
    }));
  };

  const handlePrevImg = (id: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) - 1 + max) % max
    }));
  };

  const toggleSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    const isSaved = savedIds.includes(id);
    if (isSaved) {
      setSavedIds((prev) => prev.filter((i) => i !== id));
      await savedApi.removeSavedItem('pg', id);
    } else {
      setSavedIds((prev) => [...prev, id]);
      await savedApi.saveItem('pg', id);
    }
  };

  return (
    <div className="bg-[#F7F5EF] text-[#171A18] font-sans antialiased min-h-screen flex flex-col selection:bg-[#EECA3A] selection:text-[#171A18]">

      {/* HERO BANNER SECTION (Exact Match to Reference Screenshot) */}
      <section className="relative bg-[#F7F5EF] pt-8 pb-10 overflow-hidden border-b border-[#E5E1D6]/60">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Hero Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Copy & Search */}
            <div className="lg:col-span-8">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-[#225944] tracking-tight leading-tight">
                Find your place <span className="text-[#EECA3A]">to stay</span>
              </h1>
              <p className="mt-2 text-lg sm:text-xl text-[#6B6B63] font-medium">
                Comfortable PGs & Hostels near you
              </p>

              {/* Floating White Search Box */}
              <div className="mt-6 bg-white p-2.5 sm:p-3 rounded-2xl shadow-md border border-[#E5E1D6] flex flex-wrap md:flex-nowrap items-center gap-3">
                
                {/* Search Input */}
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-transparent min-w-[200px]">
                  <svg className="w-5 h-5 text-[#225944] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search city, area or landmark"
                    defaultValue="Bhilai, Chhattisgarh"
                    className="w-full bg-transparent text-sm font-medium text-[#171A18] focus:outline-none placeholder-[#6B6B63]"
                  />
                </div>

                <div className="h-6 w-px bg-[#E5E1D6] hidden md:block" />

                {/* Current Location */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#171A18] hover:text-[#225944] shrink-0"
                >
                  <svg className="w-4 h-4 text-[#225944]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z" />
                  </svg>
                  <span>Use current location</span>
                </button>

                <div className="h-6 w-px bg-[#E5E1D6] hidden md:block" />

                {/* Category Dropdown */}
                <div className="flex items-center gap-2 px-3 py-2 min-w-[140px]">
                  <svg className="w-4 h-4 text-[#225944] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <select className="bg-transparent border-none text-xs font-bold text-[#171A18] focus:outline-none cursor-pointer w-full">
                    <option value="PG / Hostel">PG / Hostel</option>
                    <option value="Boys PG">Boys PG</option>
                    <option value="Girls PG">Girls PG</option>
                    <option value="Unisex PG">Unisex PG</option>
                  </select>
                </div>

                {/* Search Button */}
                <button
                  type="button"
                  className="bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </button>

              </div>
            </div>

            {/* Right Decorative Hero Banner */}
            <div className="lg:col-span-4 hidden lg:block relative">
              <div className="relative h-64 rounded-3xl overflow-hidden shadow-md border border-[#E5E1D6] bg-gradient-to-br from-[#225944] via-[#1a4535] to-[#123327] p-6 text-white flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-4xl text-[#EECA3A]">domain</span>
                  <h3 className="text-xl font-black mt-2">Verified Student PGs</h3>
                  <p className="text-xs text-white/80 mt-1">Single & sharing rooms near Bhilai campuses</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-xs font-bold text-[#EECA3A]">
                  Zero Brokerage • 100% Direct Booking
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FILTER BAR SECTION */}
      <section className="bg-[#F7F5EF] py-4 border-b border-[#E5E1D6]/80 sticky top-20 z-40">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E1D6] text-xs font-bold text-[#171A18] flex items-center gap-1.5 shrink-0 hover:bg-[#E5E1D6]/30 transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4 text-[#225944]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>All Filters</span>
          </button>

          {[
            { label: 'Boys', icon: '👦' },
            { label: 'Girls', icon: '👧' },
            { label: 'Unisex', icon: '👥' },
            { label: 'Single Room', icon: '🛏️' },
            { label: 'Double Sharing', icon: '🛋️' },
            { label: 'Under ₹8,000', icon: '🏷️' },
            { label: 'Food Included', icon: '🍽️' },
            { label: 'Wi-Fi', icon: '📶' },
            { label: 'More', icon: '▾' }
          ].map((item) => {
            const isActive = activeFilter === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveFilter(item.label)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#225944] text-white shadow-xs'
                    : 'bg-white border border-[#E5E1D6] text-[#171A18] hover:border-[#225944]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

        </div>
      </section>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-[#171A18]">
            {listings.length} PGs & Hostels near you
          </h2>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6B63]">
            <span>Sort by:</span>
            <select className="bg-white border border-[#E5E1D6] rounded-xl px-3 py-1.5 font-bold text-[#171A18] focus:outline-none cursor-pointer">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: LISTING CARDS (62% approx) */}
          <div className="lg:col-span-7 space-y-5">
            {loading ? (
              <div className="bg-white rounded-2xl border border-[#E5E1D6] p-12 text-center shadow-xs">
                <div className="w-10 h-10 border-4 border-[#225944] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-[#171A18]">Loading PGs & Hostels...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center text-red-700 shadow-xs font-semibold text-sm space-y-3">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={loadPGs}
                  className="px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#194434] transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E1D6] p-12 text-center shadow-xs">
                <div className="w-16 h-16 bg-[#225944]/10 text-[#225944] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-[#171A18]">No PGs available in this area yet.</h3>
                <p className="text-sm text-[#6B6B63] mt-2 font-medium">
                  Verified property listings will appear here once added from the Admin Panel.
                </p>
              </div>
            ) : (
              listings.map((listing) => {
              const currentImgIdx = activeImageIdx[listing.id] || 0;
              const isSaved = savedIds.includes(listing.id);
              const isHovered = hoveredListingId === listing.id;

              return (
                <div
                  key={listing.id}
                  onMouseEnter={() => setHoveredListingId(listing.id)}
                  className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 group cursor-pointer ${
                    isHovered ? 'border-[#225944] ring-2 ring-[#225944]/20' : 'border-[#E5E1D6]'
                  }`}
                >
                  {/* Left Gallery */}
                  <div className="w-full sm:w-60 h-48 rounded-xl relative overflow-hidden bg-gray-100 shrink-0">
                    {listing.images && listing.images.length > 0 && listing.images[currentImgIdx] ? (
                      <img
                        src={listing.images[currentImgIdx]}
                        alt={listing.name}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    ) : (
                      <PlaceholderImage type="pg" title={listing.name} />
                    )}

                    {/* Featured Badge */}
                    {listing.featured && (
                      <span className="absolute top-3 left-3 bg-[#225944] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-xs">
                        Featured
                      </span>
                    )}

                    {/* Wishlist Heart */}
                    <button
                      type="button"
                      onClick={(e) => toggleSave(listing.id, e)}
                      className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md shadow-xs transition-transform ${
                        isSaved ? 'bg-white text-red-500' : 'bg-black/30 text-white hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Prev / Next controls */}
                    {listing.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handlePrevImg(listing.id, listing.images.length, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleNextImg(listing.id, listing.images.length, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ›
                        </button>

                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {currentImgIdx + 1}/{listing.images.length}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Right Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title & Rating */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold text-[#171A18] group-hover:text-[#225944] transition-colors leading-snug">
                          {listing.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#171A18] shrink-0">
                          <span className="text-[#EECA3A]">★</span>
                          <span>{listing.rating}</span>
                          <span className="text-[#6B6B63] font-normal">({listing.reviewsCount} reviews)</span>
                        </div>
                      </div>

                      {/* Location Badge */}
                      <div className="flex items-center gap-1.5 text-xs text-[#225944] font-bold mt-1 bg-[#225944]/10 px-2.5 py-1 rounded-lg w-fit">
                        <span className="material-symbols-outlined text-[16px] text-rose-500 animate-bounce">location_on</span>
                        <span>{listing.location}</span>
                      </div>

                      {/* Price */}
                      <div className="mt-3">
                        <span className="text-xl font-extrabold text-[#171A18]">₹{listing.price.toLocaleString('en-IN')}</span>
                        <span className="text-xs font-medium text-[#6B6B63]"> / month</span>
                      </div>

                      {/* Amenity Chips */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {listing.amenities.map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-[#F7F5EF] border border-[#E5E1D6] text-[11px] font-semibold text-[#171A18]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Details & Book Now CTA */}
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <a
                        href={paymentConfig.getWhatsAppLink(listing.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1 transition-all border border-emerald-200"
                      >
                        <span>WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingModalItem({
                            id: listing.id,
                            name: listing.name,
                            type: 'PG',
                            price: listing.price,
                            location: listing.location,
                            images: listing.images,
                            amenities: listing.amenities,
                          });
                          setIsBookingModalOpen(true);
                        }}
                        className="bg-[#225944] hover:bg-[#184232] text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>Book Now</span>
                        <span>→</span>
                      </button>
                    </div>

                  </div>
                </div>
                );
              })
            )}
          </div>

          {/* RIGHT COLUMN: DYNAMIC LIVE MAP PREVIEW */}
          <div className="lg:col-span-5 space-y-5 sticky top-36">
            
            {/* Live Interactive Map Box linked to Hover State */}
            {(() => {
              const activePG = listings.find((l) => l.id === hoveredListingId) || listings[0];
              if (!activePG) {
                return (
                  <div className="bg-white rounded-2xl border border-[#E5E1D6] p-8 text-center shadow-xs">
                    <span className="material-symbols-outlined text-4xl text-[#6B6B63] mb-2">map</span>
                    <p className="text-sm font-bold text-[#171A18]">Map preview unavailable</p>
                    <p className="text-xs text-[#6B6B63] mt-1">Property location coordinates will display on map once added by Admin.</p>
                  </div>
                );
              }
              const lat = activePG.locationData?.latitude;
              const lng = activePG.locationData?.longitude;

              return (
                <div className="bg-white rounded-2xl border border-[#E5E1D6] p-3 shadow-md space-y-3 transition-all duration-300">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-500 text-[20px] animate-pulse">location_on</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#225944] leading-none">{activePG.name}</h4>
                        <span className="text-[10px] text-[#6B6B63] font-bold">{activePG.location}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EECA3A] text-[#171A18] font-black uppercase">
                      Live GPS Map
                    </span>
                  </div>

                  {/* Interactive Real Map Component */}
                  <LocationMap
                    latitude={lat}
                    longitude={lng}
                    title={activePG.name}
                    address={activePG.locationData?.address || activePG.location}
                    zoom={16}
                    className="w-full h-72 rounded-xl overflow-hidden border border-[#E5E1D6] relative shadow-inner"
                  />

                  <div className="flex items-center justify-between pt-1 px-1">
                    <span className="text-[11px] text-[#6B6B63] font-semibold">
                      Exact GPS Pin ({lat?.toFixed(4)}, {lng?.toFixed(4)})
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
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

            {/* Assistance Yellow Card */}
            <div className="bg-[#FFF9E6] border border-[#F3E8B8] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EECA3A]/30 text-2xl flex items-center justify-center shrink-0">
                  🏡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171A18]">Not sure about the area?</h4>
                  <p className="text-[11px] text-[#6B6B63] mt-0.5">Explore neighbourhoods, nearby colleges, transport and more.</p>
                </div>
              </div>
              <button
                type="button"
                className="bg-white border border-[#E5E1D6] hover:bg-gray-50 text-[#171A18] text-xs font-bold px-3 py-2 rounded-xl shrink-0 transition-all"
              >
                Explore Localities →
              </button>
            </div>

            {/* Why Find your PG Card */}
            <div className="bg-white rounded-2xl border border-[#E5E1D6] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#171A18] mb-4">
                Why find your PG on EaseHub?
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#171A18]">Verified Listings</h4>
                    <p className="text-[10px] text-[#6B6B63]">Real photos & details</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-xl">📊</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#171A18]">Easy Comparison</h4>
                    <p className="text-[10px] text-[#6B6B63]">Find the best fit</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-xl">👤</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#171A18]">No Login Required</h4>
                    <p className="text-[10px] text-[#6B6B63]">Browse freely</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-xl">💚</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#171A18]">Trusted by Students</h4>
                    <p className="text-[10px] text-[#6B6B63]">Across Chhattisgarh</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* PAGINATION SECTION (Exact Match to Reference Screenshot) */}
        <div className="mt-10 pt-6 border-t border-[#E5E1D6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-[#6B6B63]">
            Showing 1-3 of 342 properties
          </p>

          <div className="flex items-center gap-2">
            <button className="px-3.5 py-1.5 rounded-lg bg-[#225944] text-white font-extrabold text-xs shadow-xs">
              1
            </button>
            <button className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E5E1D6] text-[#171A18] font-bold text-xs hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E5E1D6] text-[#171A18] font-bold text-xs hover:bg-gray-50 transition-colors">
              3
            </button>
            <span className="text-xs text-[#6B6B63] px-1 font-bold">..</span>
            <button className="px-4 py-1.5 rounded-lg bg-white border border-[#E5E1D6] text-[#171A18] font-bold text-xs hover:bg-gray-50 transition-colors flex items-center gap-1">
              <span>Next</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* GREEN BANNER BOX: NEED MEALS OR LAUNDRY ALONGSIDE YOUR PG? (Exact Match to Screenshot) */}
        <div className="mt-10 bg-[#225944] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#EECA3A]">
              COMPLETE STUDENT LIVING
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 leading-snug">
              Need meals or laundry alongside your PG?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1.5 max-w-xl">
              EaseHub connects you with hygienic tiffin services and doorstep laundry pickups.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/meals"
              className="bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-xs"
            >
              Explore Meals
            </Link>
            <Link
              to="/laundry"
              className="bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-400/30 text-white font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-xs"
            >
              Book Laundry
            </Link>
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

export default PGPage;
