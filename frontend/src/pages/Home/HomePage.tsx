import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Building2,
  Utensils,
  Shirt,
  Wrench,
  Star,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { pgApi, PGProperty } from '../../services/pgApi';
import { mealApi, MealProvider } from '../../services/mealApi';
import { laundryApi, LaundryProvider } from '../../services/laundryApi';
import { serviceApi, ExtraServiceItem } from '../../services/serviceApi';
import PlaceholderImage from '../../components/common/PlaceholderImage';
import { AnimatedCityFooter } from '../../components/home/AnimatedCityFooter';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Search Input State
  const [searchQuery, setSearchQuery] = useState('');

  // Real Database Data States
  const [pgListings, setPgListings] = useState<PGProperty[]>([]);
  const [mealProviders, setMealProviders] = useState<MealProvider[]>([]);
  const [laundryProviders, setLaundryProviders] = useState<LaundryProvider[]>([]);
  const [extraServices, setExtraServices] = useState<ExtraServiceItem[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Load Real PostgreSQL Database Records
  useEffect(() => {
    let isMounted = true;
    setLoadingDb(true);

    Promise.all([
      pgApi.getAll().catch(() => [] as PGProperty[]),
      mealApi.getAll().catch(() => [] as MealProvider[]),
      laundryApi.getAll().catch(() => [] as LaundryProvider[]),
      serviceApi.getAll().catch(() => [] as ExtraServiceItem[]),
    ]).then(([pgs, meals, laundries, services]) => {
      if (!isMounted) return;
      setPgListings(Array.isArray(pgs) ? pgs.slice(0, 4) : []);
      setMealProviders(Array.isArray(meals) ? meals.slice(0, 4) : []);
      setLaundryProviders(Array.isArray(laundries) ? laundries.slice(0, 4) : []);
      setExtraServices(Array.isArray(services) ? services.slice(0, 4) : []);
      setLoadingDb(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      navigate('/pg');
      return;
    }

    if (q.includes('meal') || q.includes('tiffin') || q.includes('food') || q.includes('mess')) {
      navigate('/meals');
    } else if (q.includes('laundry') || q.includes('wash') || q.includes('cloth')) {
      navigate('/laundry');
    } else if (q.includes('repair') || q.includes('clean') || q.includes('electric') || q.includes('plumb') || q.includes('service')) {
      navigate('/services');
    } else {
      navigate('/pg');
    }
  };

  return (
    <div className="bg-[#F7F5EF] text-[#171A18] font-sans antialiased min-h-screen">
      
      {/* ---------------------------------------------------- */}
      {/* 1. HOMEPAGE HERO (Clean Split Layout per Spec) */}
      {/* ---------------------------------------------------- */}
      <section className="bg-white border-b border-[#E5E1D6] py-10 md:py-16">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Copy & Search Bar */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-block px-3 py-1 rounded-md bg-[#225944]/10 text-[#225944] text-xs font-bold uppercase tracking-wider">
                CAMPUS LIFE MADE SIMPLE
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171A18] tracking-tight leading-tight">
                Everything you need for <br className="hidden sm:inline" />
                a better campus life.
              </h1>

              <p className="text-base sm:text-lg text-[#6B6B63] max-w-xl font-normal leading-relaxed">
                Find PGs, meals, laundry and everyday services around your campus.
              </p>

              {/* Clean Marketplace Search Console */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-[#F7F5EF] rounded-xl p-2 border border-[#E5E1D6] flex items-center gap-2 max-w-xl shadow-2xs"
              >
                <div className="flex items-center gap-2.5 flex-1 px-3">
                  <Search className="w-5 h-5 text-[#225944] shrink-0" />
                  <input
                    id="hero-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search PGs, meals, laundry or services..."
                    className="w-full bg-transparent border-0 text-sm font-semibold text-[#171A18] placeholder-[#6B6B63] focus:outline-none p-1"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#225944] hover:bg-[#184232] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right Column: One Realistic Photograph / Neutral Visual (No 3D/Cartoons) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#E5E1D6] shadow-sm bg-[#F7F5EF]">
                <img
                  src="/logo.png"
                  alt="EaseHub Campus Partners"
                  className="w-full h-72 sm:h-80 object-cover"
                />
                <div className="p-4 bg-white border-t border-[#E5E1D6] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#171A18]">Verified Student Housing &amp; Services</h4>
                    <p className="text-xs text-[#6B6B63]">Bhilai, Raipur &amp; Durg Hubs</p>
                  </div>
                  <span className="text-xs font-bold text-[#225944] bg-[#225944]/10 px-2.5 py-1 rounded-md">
                    Verified
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. SERVICE CATEGORIES ROW */}
      {/* ---------------------------------------------------- */}
      <section className="py-10 bg-[#F7F5EF] border-b border-[#E5E1D6]">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Category 1: PG / Hostels */}
            <div
              onClick={() => navigate('/pg')}
              className="bg-white rounded-xl p-5 border border-[#E5E1D6] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-start gap-4 group"
            >
              <div className="p-3 rounded-lg bg-[#225944]/10 text-[#225944] shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#171A18] group-hover:text-[#225944] transition-colors">
                  PG / Hostels
                </h3>
                <p className="text-xs text-[#6B6B63] mt-0.5 font-medium truncate">
                  Single &amp; sharing rooms near campuses
                </p>
              </div>
            </div>

            {/* Category 2: Meals & Mess */}
            <div
              onClick={() => navigate('/meals')}
              className="bg-white rounded-xl p-5 border border-[#E5E1D6] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-start gap-4 group"
            >
              <div className="p-3 rounded-lg bg-[#EECA3A]/20 text-[#171A18] shrink-0">
                <Utensils className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#171A18] group-hover:text-[#225944] transition-colors">
                  Meals &amp; Mess
                </h3>
                <p className="text-xs text-[#6B6B63] mt-0.5 font-medium truncate">
                  Hygienic daily tiffin &amp; mess plans
                </p>
              </div>
            </div>

            {/* Category 3: Laundry */}
            <div
              onClick={() => navigate('/laundry')}
              className="bg-white rounded-xl p-5 border border-[#E5E1D6] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-start gap-4 group"
            >
              <div className="p-3 rounded-lg bg-[#225944]/10 text-[#225944] shrink-0">
                <Shirt className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#171A18] group-hover:text-[#225944] transition-colors">
                  Laundry
                </h3>
                <p className="text-xs text-[#6B6B63] mt-0.5 font-medium truncate">
                  Doorstep wash, iron &amp; delivery
                </p>
              </div>
            </div>

            {/* Category 4: Extra Services */}
            <div
              onClick={() => navigate('/services')}
              className="bg-white rounded-xl p-5 border border-[#E5E1D6] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-start gap-4 group"
            >
              <div className="p-3 rounded-lg bg-gray-100 text-[#171A18] shrink-0">
                <Wrench className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#171A18] group-hover:text-[#225944] transition-colors">
                  Extra Services
                </h3>
                <p className="text-xs text-[#6B6B63] mt-0.5 font-medium truncate">
                  Electrician, plumbing &amp; repairs
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. REAL POSTGRESQL DATABASE CATALOG SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E5E1D6]">
            <div>
              <span className="text-xs font-bold text-[#225944] uppercase tracking-wider">
                REAL DATABASE LISTINGS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] mt-1">
                Verified Campus Catalog
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6B63]">
              Listings loaded from PostgreSQL Database
            </p>
          </div>

          {loadingDb ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#225944] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#6B6B63]">Loading real listings...</p>
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* PG Properties Catalog */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#171A18] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#225944]" />
                    <span>Featured Hostels &amp; PGs</span>
                  </h3>
                  <Link to="/pg" className="text-xs font-bold text-[#225944] hover:underline flex items-center gap-1">
                    <span>View All PGs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {pgListings.length === 0 ? (
                  <div className="bg-[#F7F5EF] rounded-xl p-8 text-center border border-[#E5E1D6] text-xs font-semibold text-[#6B6B63]">
                    No PG listings available yet. Listings added via Admin Panel will appear here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {pgListings.map((pg) => {
                      const imageSrc = pg.images && pg.images.length > 0 ? pg.images[0] : null;

                      return (
                        <article
                          key={pg.id || pg._id}
                          onClick={() => navigate('/pg')}
                          className="bg-white rounded-xl border border-[#E5E1D6] overflow-hidden shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer flex flex-col justify-between group"
                        >
                          <div>
                            <div className="h-44 w-full relative bg-[#F7F5EF]">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={pg.name}
                                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-200"
                                />
                              ) : (
                                <PlaceholderImage type="pg" title={pg.name} />
                              )}
                              {pg.gender && (
                                <span className="absolute top-2.5 left-2.5 bg-[#225944] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                                  {pg.gender} PG
                                </span>
                              )}
                            </div>

                            <div className="p-4 space-y-1.5">
                              <h4 className="font-bold text-sm text-[#171A18] group-hover:text-[#225944] transition-colors truncate">
                                {pg.name}
                              </h4>
                              <p className="text-xs text-[#6B6B63] flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-[#225944] shrink-0" />
                                <span>{pg.corridor || pg.location?.address || 'Bhilai, Chhattisgarh'}</span>
                              </p>
                              {pg.rating && (
                                <div className="flex items-center gap-1 text-xs font-bold text-[#171A18] pt-1">
                                  <Star className="w-3.5 h-3.5 fill-[#EECA3A] text-[#EECA3A]" />
                                  <span>{pg.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="px-4 py-3 bg-[#F7F5EF] border-t border-[#E5E1D6] flex items-center justify-between text-xs font-bold">
                            <span className="text-[#171A18]">₹{(pg.monthlyRent || 0).toLocaleString('en-IN')}<span className="text-[10px] text-[#6B6B63] font-normal"> / mo</span></span>
                            <span className="text-[#225944] group-hover:underline">View Details →</span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Meals Catalog */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#171A18] flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#EECA3A]" />
                    <span>Mess &amp; Daily Meal Partners</span>
                  </h3>
                  <Link to="/meals" className="text-xs font-bold text-[#225944] hover:underline flex items-center gap-1">
                    <span>View All Mess Partners</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {mealProviders.length === 0 ? (
                  <div className="bg-[#F7F5EF] rounded-xl p-8 text-center border border-[#E5E1D6] text-xs font-semibold text-[#6B6B63]">
                    No meal providers available yet. Listings added via Admin Panel will appear here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {mealProviders.map((meal) => (
                      <article
                        key={meal.id || meal._id}
                        onClick={() => navigate('/meals')}
                        className="bg-white rounded-xl border border-[#E5E1D6] overflow-hidden shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="h-44 w-full relative bg-[#F7F5EF]">
                            {meal.image ? (
                              <img
                                src={meal.image}
                                alt={meal.name}
                                className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-200"
                              />
                            ) : (
                              <PlaceholderImage type="meals" title={meal.name} />
                            )}
                            <span className="absolute top-2.5 left-2.5 bg-[#225944] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                              {meal.isVeg ? 'Pure Veg' : 'Veg & Non-Veg'}
                            </span>
                          </div>

                          <div className="p-4 space-y-1.5">
                            <h4 className="font-bold text-sm text-[#171A18] group-hover:text-[#225944] transition-colors truncate">
                              {meal.name}
                            </h4>
                            <p className="text-xs text-[#6B6B63] flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-[#225944] shrink-0" />
                              <span>{meal.corridor || meal.location?.address || 'Bhilai'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="px-4 py-3 bg-[#F7F5EF] border-t border-[#E5E1D6] flex items-center justify-between text-xs font-bold">
                          <span className="text-[#171A18]">₹{meal.dailyPrice || 120}<span className="text-[10px] text-[#6B6B63] font-normal"> / meal</span></span>
                          <span className="text-[#225944] group-hover:underline">View Menu →</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </section>

      {/* 4. ANIMATED CITY / CAMPUS FOOTER SCENE (HOMEPAGE ONLY) */}
      <AnimatedCityFooter />

    </div>
  );
};

export default HomePage;
