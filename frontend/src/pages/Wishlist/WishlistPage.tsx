import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

interface ShortlistItem {
  id: string;
  name: string;
  category: 'pg' | 'meals' | 'services';
  tagline: string;
  location: string;
  rating: number;
  reviewsCount: number;
  price: number;
  pricePeriod: string;
  priceBadge?: string;
  image: string;
  badge1: { text: string; icon?: string; color: string };
  badge2?: { text: string; color: string };
  specs: { text: string; icon: string }[];
  dateSaved: string;
  ctaText?: string;
  secondaryCtaText?: string;
}

const initialItems: ShortlistItem[] = [
  {
    id: '1',
    name: 'Shree Krishna PG',
    category: 'pg',
    tagline: 'Luxury Single AC Room with En-suite Washroom',
    location: 'Junwani • 400m to BIT Gate 2',
    rating: 4.8,
    reviewsCount: 120,
    price: 6500,
    pricePeriod: '/ month',
    priceBadge: 'Bills Included',
    image: '',
    badge1: { text: 'Verified Owner', icon: 'verified', color: 'bg-[#225944] text-white' },
    badge2: { text: 'Zero Brokerage', color: 'bg-[#EECA3A] text-[#171A18]' },
    specs: [
      { text: 'High-Speed Wi-Fi', icon: 'wifi' },
      { text: '3 Meals Included', icon: 'restaurant' },
      { text: 'Study Desk', icon: 'desk' },
      { text: '24x7 Power Backup', icon: 'bolt' }
    ],
    dateSaved: '2025-05-10'
  },
  {
    id: '2',
    name: 'Comfort Stay Boys Hostel',
    category: 'pg',
    tagline: 'Double Sharing Room with Individual Steel Wardrobes',
    location: 'Smriti Nagar • 1.2km to Campus',
    rating: 4.6,
    reviewsCount: 95,
    price: 4800,
    pricePeriod: '/ month',
    priceBadge: 'Food Included',
    image: '',
    badge1: { text: 'Double Sharing', icon: 'groups', color: 'bg-white text-[#225944]' },
    specs: [
      { text: '3-Times Homestyle Food', icon: 'lunch_dining' },
      { text: 'RO Water Chiller', icon: 'water_drop' },
      { text: 'CCTV 24/7 Monitored', icon: 'videocam' }
    ],
    dateSaved: '2025-05-08'
  },
  {
    id: '3',
    name: 'Grace Girls Residency',
    category: 'pg',
    tagline: 'Biometric Access with Strict Night Warden Protocol',
    location: 'Nehru Nagar (East)',
    rating: 4.9,
    reviewsCount: 140,
    price: 5500,
    pricePeriod: '/ month',
    priceBadge: 'Curfew: 9:30 PM',
    image: '',
    badge1: { text: 'Girls Only', color: 'bg-[#EECA3A] text-[#171A18]' },
    badge2: { text: 'Female Warden', color: 'bg-[#225944] text-white' },
    specs: [
      { text: 'Biometric Entry', icon: 'fingerprint' },
      { text: 'In-house Laundry', icon: 'local_laundry_service' },
      { text: 'Induction Pantry', icon: 'kitchen' }
    ],
    dateSaved: '2025-05-11'
  },
  {
    id: '4',
    name: 'Royal Annapurna Veg Thali',
    category: 'meals',
    tagline: 'Complete Lunch + Dinner Plan (Delivered Hot Twice Daily)',
    location: 'Delivered to Room Doorstep',
    rating: 4.7,
    reviewsCount: 310,
    price: 2400,
    pricePeriod: '/ month (60 meals)',
    priceBadge: '₹40/meal',
    image: '',
    badge1: { text: 'Pure Veg', icon: 'eco', color: 'bg-[#225944] text-white' },
    badge2: { text: 'Hostel Delivery', color: 'bg-[#EECA3A] text-[#171A18]' },
    specs: [
      { text: 'Unlimited Rotis', icon: 'bakery_dining' },
      { text: 'Exam Pause Guarantee', icon: 'pause_circle' },
      { text: 'Fresh Daily Salad', icon: 'nutrition' }
    ],
    dateSaved: '2025-05-09',
    ctaText: 'Start 3-Day Trial (₹199)'
  },
  {
    id: '5',
    name: 'FreshThread Semester Saver',
    category: 'services',
    tagline: '30 kg All-Inclusive Wash + Steam Iron Package',
    location: 'Civic Center • Covers Entire Bhilai',
    rating: 4.8,
    reviewsCount: 88,
    price: 1299,
    pricePeriod: '/ 4-month semester',
    priceBadge: '₹43/kg value',
    image: '',
    badge1: { text: 'Express 24h', icon: 'speed', color: 'bg-[#225944] text-white' },
    badge2: { text: 'Doorstep Pickup', color: 'bg-white text-[#225944]' },
    specs: [
      { text: 'Free Doorstep Pickup', icon: 'local_shipping' },
      { text: 'Steam Wrinkle-Free', icon: 'iron' },
      { text: '24h Express Turnaround', icon: 'schedule' }
    ],
    dateSaved: '2025-05-07',
    ctaText: 'Activate Package'
  }
];

export const WishlistPage: React.FC = () => {
  const [items, setItems] = useState<ShortlistItem[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState<'all' | 'pg' | 'meals' | 'services'>('all');
  const [sortOption, setSortOption] = useState<string>('recent');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [copyBtnText, setCopyBtnText] = useState<string>('Copy Link');
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; icon: string } | null>(null);

  const parentInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (text: string, icon: string = 'check_circle') => {
    setToastMessage({ text, icon });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleRemoveItem = (id: string, name: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    triggerToast(`${name} removed from shortlist`, 'delete');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved items from your wishlist?')) {
      setItems([]);
      triggerToast('Shortlist cleared', 'delete_forever');
    }
  };

  const handleShareWhatsApp = () => {
    const shareText = encodeURIComponent(
      "Hey! Here is my shortlisted student stay & meal plan on EaseHub Bhilai:\n1. Shree Krishna PG (Near BIT Gate 2)\n2. Comfort Stay Boys Hostel\n3. Grace Girls Residency\n4. Annapurna Tiffin Subscription\nCheck verified details here: https://easehub.in/shortlist/bhilai-student-2025"
    );
    const cleanPhone = parentPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      window.open(`https://wa.me/91${cleanPhone}?text=${shareText}`, '_blank');
      triggerToast('Opening WhatsApp to send shortlist to parent...', 'send');
    } else {
      window.open(`https://wa.me/?text=${shareText}`, '_blank');
      triggerToast('Opening WhatsApp...', 'send');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyBtnText('Copied!');
    triggerToast('Shareable link copied to clipboard!', 'content_copy');
    setTimeout(() => {
      setCopyBtnText('Copy Link');
    }, 2500);
  };

  const openShareSection = () => {
    if (parentInputRef.current) {
      parentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      parentInputRef.current.focus();
      triggerToast('Enter a WhatsApp number below to share your shortlist', 'info');
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    if (sortOption === 'rating-desc') return b.rating - a.rating;
    return new Date(b.dateSaved).getTime() - new Date(a.dateSaved).getTime();
  });

  const categoryCounts = {
    all: items.length,
    pg: items.filter((i) => i.category === 'pg').length,
    meals: items.filter((i) => i.category === 'meals').length,
    services: items.filter((i) => i.category === 'services').length
  };

  return (
    <div className="bg-[#F8FAF6] text-[#191C1A] font-sans antialiased min-h-screen selection:bg-[#EECA3A] selection:text-[#171A18]">
      
      {/* Main Container */}
      <main className="w-full pt-6 pb-20 bg-[#F8FAF6]">
        <div className="relative w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
          
          {/* Subtle Ambient Glow Background Graphic */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#EECA3A]/20 blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-[#225944]/15 blur-3xl pointer-events-none"></div>

          {/* Header / Editorial Lead */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E1D6]">
            <div className="max-w-2xl flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EECA3A]/30 text-[#171A18] self-start shadow-xs">
                <span className="material-symbols-outlined text-[15px]">bookmark</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">SAVED & SHORTLISTED</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#225944] tracking-tight">
                Your Saved Stays & Plans
              </h1>
              <p className="text-sm sm:text-base text-[#6B6B63] max-w-xl leading-relaxed">
                Easily compare your favorite student PGs, meal plans, and laundry packages before confirming your booking in Bhilai & Durg.
              </p>
            </div>

            {/* Quick Shortlist Summary Micro-Widget */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E5E1D6] shadow-sm shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#225944] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[24px]">folder_special</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#6B6B63] uppercase tracking-wide font-bold">Ready for Review</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-[#225944]">{items.length}</span>
                  <span className="text-xs text-[#6B6B63]">items locked in shortlist</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar: Category Tabs, Sorter, Action Buttons */}
          <div className="relative z-10 mt-6 p-2 bg-white rounded-2xl border border-[#E5E1D6] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0" id="filter-tabs">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-[#225944] text-white shadow-sm'
                    : 'text-[#6B6B63] hover:text-[#191C1A] hover:bg-[#F3F4F0]'
                }`}
              >
                <span>All Saved</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeCategory === 'all' ? 'bg-[#96CEB3] text-[#002115]' : 'bg-[#E1E3DF] text-[#6B6B63]'}`}>
                  {categoryCounts.all}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('pg')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeCategory === 'pg'
                    ? 'bg-[#225944] text-white shadow-sm'
                    : 'text-[#6B6B63] hover:text-[#191C1A] hover:bg-[#F3F4F0]'
                }`}
              >
                <span>PG & Hostels</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeCategory === 'pg' ? 'bg-[#96CEB3] text-[#002115]' : 'bg-[#E1E3DF] text-[#6B6B63]'}`}>
                  {categoryCounts.pg}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('meals')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeCategory === 'meals'
                    ? 'bg-[#225944] text-white shadow-sm'
                    : 'text-[#6B6B63] hover:text-[#191C1A] hover:bg-[#F3F4F0]'
                }`}
              >
                <span>Meal Plans</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeCategory === 'meals' ? 'bg-[#96CEB3] text-[#002115]' : 'bg-[#E1E3DF] text-[#6B6B63]'}`}>
                  {categoryCounts.meals}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('services')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeCategory === 'services'
                    ? 'bg-[#225944] text-white shadow-sm'
                    : 'text-[#6B6B63] hover:text-[#191C1A] hover:bg-[#F3F4F0]'
                }`}
              >
                <span>Laundry & Services</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeCategory === 'services' ? 'bg-[#96CEB3] text-[#002115]' : 'bg-[#E1E3DF] text-[#6B6B63]'}`}>
                  {categoryCounts.services}
                </span>
              </button>
            </div>

            {/* Utilities: Sort & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#F3F4F0] px-3.5 py-1.5 rounded-full border border-[#E5E1D6]">
                <span className="material-symbols-outlined text-[18px] text-[#6B6B63]">sort</span>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    triggerToast(`Shortlist reordered: ${e.target.value.replace('-', ' ')}`);
                  }}
                  className="bg-transparent text-xs font-semibold text-[#191C1A] focus:outline-none cursor-pointer border-none p-0 pr-2"
                >
                  <option value="recent">Recently Saved</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Rating: High to Low</option>
                </select>
              </div>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-semibold text-[#6B6B63] hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                <span>Clear All</span>
              </button>

              <button
                onClick={openShareSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#EECA3A] text-[#171A18] hover:bg-[#e0bd2c] shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span>Share Shortlist</span>
              </button>
            </div>
          </div>

          {/* Active Shortlist Cards Grid */}
          {sortedItems.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => (
                <article
                  key={item.id}
                  className="relative flex flex-col bg-white rounded-2xl border border-[#E5E1D6] shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  {/* Media Container */}
                  <div className="relative h-56 w-full overflow-hidden bg-[#E5E1D6]/40 flex items-center justify-center">
                    {item.image ? (
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={item.name}
                        src={item.image}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#225944]">
                        <span className="material-symbols-outlined text-4xl mb-1">bookmark</span>
                        <span className="text-xs font-bold text-center">{item.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                    {/* Top Micro Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs backdrop-blur-md ${item.badge1.color}`}>
                        {item.badge1.icon && <span className="material-symbols-outlined text-[13px]">{item.badge1.icon}</span>}
                        {item.badge1.text}
                      </span>
                      {item.badge2 && (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${item.badge2.color}`}>
                          {item.badge2.text}
                        </span>
                      )}
                    </div>

                    {/* Favorite Heart Delete Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      aria-label="Remove from saved"
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-red-500 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[20px]">favorite</span>
                    </button>

                    {/* Bottom Image Overlay Meta */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
                        {item.location}
                      </span>
                      <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
                        <span className="material-symbols-outlined text-[#EECA3A] text-[16px]">star</span>
                        <span className="text-xs font-bold">{item.rating}</span>
                        <span className="text-[10px] opacity-80">({item.reviewsCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between">
                        <h2 className="text-lg font-bold text-[#225944] group-hover:text-[#184232] transition-colors truncate">
                          {item.name}
                        </h2>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#225944]/10 text-[#225944] uppercase font-bold">
                          {item.category === 'pg' ? 'Hostel Stay' : item.category === 'meals' ? 'Meal Plan' : 'Laundry Service'}
                        </span>
                      </div>

                      <p className="text-xs text-[#6B6B63] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-[#707973]">info</span>
                        {item.tagline}
                      </p>

                      {/* Feature Tags */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.specs.map((spec, sIdx) => (
                          <span key={sIdx} className="px-2 py-1 rounded-md bg-[#F3F4F0] text-[11px] font-medium text-[#6B6B63] flex items-center gap-1 border border-[#E5E1D6]">
                            <span className="material-symbols-outlined text-[14px] text-[#225944]">{spec.icon}</span>
                            {spec.text}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & CTAs */}
                    <div className="pt-3 border-t border-[#E5E1D6] flex flex-col gap-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xl font-extrabold text-[#225944]">₹{item.price.toLocaleString()}</span>
                          <span className="text-xs text-[#6B6B63] ml-1">{item.pricePeriod}</span>
                        </div>
                        {item.priceBadge && (
                          <span className="text-[10px] text-[#225944] bg-[#225944]/10 px-2 py-0.5 rounded-full font-bold">
                            {item.priceBadge}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {item.ctaText ? (
                          <button
                            onClick={() => triggerToast(`Initiated for ${item.name}`, 'check_circle')}
                            className="col-span-2 h-10 px-4 rounded-full bg-[#225944] text-white hover:bg-[#184232] text-xs font-bold transition-all text-center shadow-xs flex items-center justify-center gap-1"
                          >
                            <span>{item.ctaText}</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => triggerToast(`Visit scheduled for ${item.name}`, 'calendar_month')}
                              className="h-10 px-3 rounded-full bg-[#F3F4F0] text-[#225944] hover:bg-[#225944]/10 text-xs font-bold transition-all text-center flex items-center justify-center gap-1 border border-[#E5E1D6]"
                            >
                              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                              <span>Visit Free</span>
                            </button>
                            <Link
                              to="/pg"
                              className="h-10 px-3 rounded-full bg-[#225944] text-white hover:bg-[#184232] text-xs font-bold transition-all text-center shadow-xs flex items-center justify-center gap-1"
                            >
                              <span>Book Now</span>
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State Container */
            <div className="my-16 p-12 rounded-3xl bg-white border border-[#E5E1D6] text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#F3F4F0] flex items-center justify-center text-[#6B6B63]">
                <span className="material-symbols-outlined text-[32px]">bookmark_border</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#225944]">No saved items found</h3>
                <p className="text-xs text-[#6B6B63] mt-1">
                  Your shortlist is currently empty. Browse verified student stays and tiffin plans across Bhilai.
                </p>
              </div>
              <Link
                to="/pg"
                className="px-6 py-2.5 rounded-full bg-[#225944] text-white text-xs font-bold hover:bg-[#184232] transition-all shadow-sm"
              >
                Explore PG & Hostels
              </Link>
            </div>
          )}

          {/* Quick Comparison & Parent Sharing Matrix Banner */}
          <section className="mt-16 p-8 md:p-10 rounded-3xl bg-[#225944] text-white relative overflow-hidden shadow-xl">
            {/* Decorative Backdrop Circles */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#EECA3A]/20 blur-xl pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Content Left */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EECA3A] text-[#171A18] self-start text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  <span className="material-symbols-outlined text-[15px]">send_and_archive</span>
                  FAMILY & ROOMMATE COLLABORATION
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Need your parents’ or roommates’ opinion?
                </h3>
                <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
                  Export or send your verified shortlist via WhatsApp in 1 click. Includes detailed price breakdowns, verified owner badges, and campus proximity markers for peace of mind.
                </p>

                {/* Key Trust Markers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#EECA3A] text-[20px]">verified_user</span>
                    <span className="text-xs font-semibold text-white">100% Police Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#EECA3A] text-[20px]">currency_rupee</span>
                    <span className="text-xs font-semibold text-white">Locked Pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#EECA3A] text-[20px]">directions_walk</span>
                    <span className="text-xs font-semibold text-white">Verified Campus Radius</span>
                  </div>
                </div>
              </div>

              {/* Action Card Right */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-white text-[#191C1A] shadow-2xl flex flex-col gap-4 border border-[#E5E1D6]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#225944] text-[22px]">send_to_mobile</span>
                    <span className="text-sm font-extrabold text-[#225944]">Instant WhatsApp Share</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#EECA3A]/40 text-[#171A18] text-[10px] font-bold">
                    1-Click Link
                  </span>
                </div>

                <p className="text-xs text-[#6B6B63]">
                  Generate a clean, parent-friendly summary sheet of the saved listings with map directions directly to their phone.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#191C1A] font-semibold">Recipient Mobile Number</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 bg-[#F3F4F0] rounded-lg text-xs font-bold text-[#225944] border border-[#E5E1D6]">
                      +91
                    </span>
                    <input
                      ref={parentInputRef}
                      type="tel"
                      maxLength={10}
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter parent's 10-digit number"
                      className="w-full px-3 py-2 rounded-lg bg-[#F3F4F0] text-xs text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944] border border-[#E5E1D6]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 h-10 px-4 rounded-full bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    <span>Send via WhatsApp</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="h-10 px-4 rounded-full bg-[#F3F4F0] hover:bg-[#E5E1D6] text-[#225944] text-xs font-bold transition-all flex items-center justify-center gap-1 border border-[#E5E1D6]"
                  >
                    <span className="material-symbols-outlined text-[18px]">link</span>
                    <span>{copyBtnText}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Side-by-Side Comparison Feature Teaser */}
          <div className="mt-8 p-5 rounded-2xl bg-white border border-[#E5E1D6] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EECA3A]/40 flex items-center justify-center text-[#171A18] shrink-0 font-bold">
                <span className="material-symbols-outlined text-[22px]">compare_arrows</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#225944]">Compare Amenities Side-by-Side</h4>
                <p className="text-xs text-[#6B6B63]">See a tabular view of Wi-Fi speed, distance to BIT Durg, AC vs Non-AC, and tiffin meal times.</p>
              </div>
            </div>
            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className="px-5 h-10 rounded-full bg-[#F3F4F0] hover:bg-[#E5E1D6] text-[#225944] text-xs font-bold transition-all flex items-center gap-2 shrink-0 border border-[#E5E1D6]"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showMatrix ? 'close' : 'table_chart'}
              </span>
              <span>{showMatrix ? 'Hide Matrix' : 'View Amenities Matrix'}</span>
            </button>
          </div>

          {/* Hidden Quick Amenity Matrix Table */}
          {showMatrix && (
            <div className="mt-4 bg-white rounded-2xl border border-[#E5E1D6] shadow-md overflow-x-auto p-4 transition-all">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#6B6B63] font-bold uppercase tracking-wider border-b border-[#E5E1D6]">
                    <th className="py-3 px-4">Listing Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Monthly Cost</th>
                    <th className="py-3 px-4">Key Inclusions</th>
                    <th className="py-3 px-4">Campus Proximity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D6] text-[#191C1A]">
                  <tr className="hover:bg-[#F3F4F0] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#225944]">Shree Krishna PG</td>
                    <td className="py-3 px-4">Single AC Room</td>
                    <td className="py-3 px-4">Junwani</td>
                    <td className="py-3 px-4 font-bold">₹6,500</td>
                    <td className="py-3 px-4">3 Meals, Study Desk, Power Backup</td>
                    <td className="py-3 px-4 text-[#225944] font-bold">400m from BIT Gate 2</td>
                  </tr>
                  <tr className="hover:bg-[#F3F4F0] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#225944]">Comfort Stay Boys Hostel</td>
                    <td className="py-3 px-4">Double Sharing</td>
                    <td className="py-3 px-4">Smriti Nagar</td>
                    <td className="py-3 px-4 font-bold">₹4,800</td>
                    <td className="py-3 px-4">Homestyle Food, RO Chiller, CCTV</td>
                    <td className="py-3 px-4 text-[#6B6B63]">1.2 km from BIT</td>
                  </tr>
                  <tr className="hover:bg-[#F3F4F0] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#225944]">Grace Girls Residency</td>
                    <td className="py-3 px-4">Premium Girls Wing</td>
                    <td className="py-3 px-4">Nehru Nagar</td>
                    <td className="py-3 px-4 font-bold">₹5,500</td>
                    <td className="py-3 px-4">Biometric, Warden, In-house Laundry</td>
                    <td className="py-3 px-4 text-[#6B6B63]">2.1 km (Direct Bus)</td>
                  </tr>
                  <tr className="hover:bg-[#F3F4F0] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#225944]">Royal Annapurna Veg Thali</td>
                    <td className="py-3 px-4">Meal Subscription</td>
                    <td className="py-3 px-4">Hostel Delivery</td>
                    <td className="py-3 px-4 font-bold">₹2,400</td>
                    <td className="py-3 px-4">60 Meals/mo, Unlimited Rotis</td>
                    <td className="py-3 px-4 text-[#225944] font-bold">Free Doorstep Delivery</td>
                  </tr>
                  <tr className="hover:bg-[#F3F4F0] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#225944]">FreshThread Semester Saver</td>
                    <td className="py-3 px-4">Semester Laundry (30kg)</td>
                    <td className="py-3 px-4">Civic Center</td>
                    <td className="py-3 px-4 font-bold">₹1,299</td>
                    <td className="py-3 px-4">Doorstep Pickup, 24h Turnaround, Steam</td>
                    <td className="py-3 px-4 text-[#225944] font-bold">All Campus Hostels</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#2E312F] text-white shadow-2xl text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-[20px] text-[#EECA3A]">
            {toastMessage.icon}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

    </div>
  );
};

export default WishlistPage;
