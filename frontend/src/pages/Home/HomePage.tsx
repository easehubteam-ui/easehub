import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Bed,
  Utensils,
  Shirt,
  Wrench,
  Check,
  Star,
  MapPin,
  ShieldCheck,
  Sparkles,
  Clock,
  Layers,
} from 'lucide-react';
import { pgApi, PGProperty } from '../../services/pgApi';
import { mealApi, MealProvider } from '../../services/mealApi';
import { laundryApi, LaundryProvider } from '../../services/laundryApi';
import { serviceApi, ExtraServiceItem } from '../../services/serviceApi';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Search Input State
  const [searchQuery, setSearchQuery] = useState('');

  // PostgreSQL Real Database States
  const [pgListings, setPgListings] = useState<PGProperty[]>([]);
  const [mealProviders, setMealProviders] = useState<MealProvider[]>([]);
  const [laundryProviders, setLaundryProviders] = useState<LaundryProvider[]>([]);
  const [extraServices, setExtraServices] = useState<ExtraServiceItem[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Mouse Parallax Motion States for Desktop
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseXSpring = useSpring(mousePos.x, { stiffness: 60, damping: 20 });
  const mouseYSpring = useSpring(mousePos.y, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Small normalized mouse delta (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    if (window.innerWidth > 768) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div className="bg-[#F7F5EF] text-[#171A18] font-sans antialiased min-h-screen overflow-x-hidden selection:bg-[#EECA3A] selection:text-[#171A18]">
      
      {/* ---------------------------------------------------- */}
      {/* HERO MASTER SECTION (Matching Provided Wireframe) */}
      {/* ---------------------------------------------------- */}
      <section className="relative pt-4 pb-12 md:pt-8 md:pb-20 overflow-hidden">
        
        {/* Subtle Background Organic Glows */}
        <div className="absolute top-0 right-[5%] w-[600px] h-[600px] bg-[#EECA3A]/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-[-5%] w-[500px] h-[500px] bg-[#225944]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Floating Natural Leaves (Layered Motion Elements) */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-12 left-4 md:left-12 opacity-80 pointer-events-none z-20 hidden sm:block"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#225944]/20 to-transparent backdrop-blur-xs flex items-center justify-center text-[#225944]">
            <Sparkles className="w-5 h-5 text-[#225944]" />
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -6, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute top-1/2 right-6 md:right-16 opacity-75 pointer-events-none z-20 hidden md:block"
        >
          <div className="w-12 h-12 rounded-full bg-[#EECA3A]/20 backdrop-blur-xs flex items-center justify-center text-[#171A18]">
            <span className="material-symbols-outlined text-2xl text-[#174532]">eco</span>
          </div>
        </motion.div>

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Hero Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT HERO COLUMN: Copy & Functional Search */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-6 space-y-6 z-10"
            >
              {/* Eyebrow Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#225944]/10 text-[#225944] text-xs font-extrabold tracking-wider uppercase border border-[#225944]/15"
              >
                <span>CAMPUS LIFE MADE SIMPLE</span>
                <span className="w-8 h-0.5 bg-[#EECA3A] rounded-full inline-block" />
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#171A18] tracking-tight leading-[1.12]"
              >
                All Your <br />
                Campus Needs <br />
                in{' '}
                <span className="relative inline-block text-[#225944]">
                  One Place
                  <svg
                    className="absolute -bottom-2.5 left-0 w-full h-3.5 text-[#EECA3A]"
                    viewBox="0 0 240 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 9C58 2 178 3 238 9"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </motion.h1>

              {/* Subtitle Description */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base sm:text-lg text-[#6B6B63] max-w-lg font-medium leading-relaxed"
              >
                Find the best PGs, Meals, Laundry, and Extra Services around your campus — fast, trusted, and affordable.
              </motion.p>

              {/* Large Functional Search Bar (Exact Wireframe Composition) */}
              <motion.form
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-full p-2 pl-5 sm:pl-6 shadow-xl border border-[#E5E1D6] flex items-center justify-between gap-3 focus-within:ring-2 focus-within:ring-[#225944] focus-within:border-[#225944] transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Search className="w-5 h-5 text-[#225944] shrink-0" />
                  <input
                    id="hero-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for PG, Meals, Laundry, Services..."
                    className="w-full bg-transparent border-0 text-sm sm:text-base font-semibold text-[#171A18] placeholder-[#6B6B63] focus:outline-none p-0"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#225944] hover:bg-[#174532] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-6 sm:px-8 py-3.5 rounded-full shadow-md transition-all flex items-center gap-2 shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            </motion.div>

            {/* RIGHT HERO COLUMN: Realistic Campus Scene & Floating Layers */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{
                x: mousePos.x * 6,
                y: mousePos.y * 6,
              }}
              className="lg:col-span-6 relative flex items-center justify-center"
            >
              {/* Main Visual Container matching Wireframe */}
              <div className="relative w-full max-w-lg lg:max-w-none rounded-[36px] overflow-hidden bg-gradient-to-br from-white via-[#FFFDF7] to-[#F7F5EF] p-3 sm:p-4 shadow-2xl border border-[#E5E1D6]">
                <div className="relative h-[340px] sm:h-[420px] md:h-[460px] w-full rounded-[28px] overflow-hidden group">
                  {/* Base Scene Image */}
                  <img
                    src="/hero-wireframe.jpg"
                    alt="EaseHub Campus Living Scene"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                  {/* Cursive / Handwritten Badge Text Overlay */}
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/40 -rotate-3 z-10">
                    <span className="font-handwriting text-xl sm:text-2xl text-[#225944] font-bold block leading-none">
                      Better Campus Life Together
                    </span>
                  </div>

                  {/* Live Status Micro Tag */}
                  <div className="absolute bottom-6 left-6 bg-[#225944]/95 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-10 border border-white/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EECA3A] animate-ping" />
                    <span className="text-xs font-extrabold tracking-wide">100% Verified Campus Living</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ---------------------------------------------------- */}
          {/* EXACT 4 SERVICE CARDS (Grid below Hero) */}
          {/* ---------------------------------------------------- */}
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            
            {/* Card 1: PG / Hostels */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-5 border border-[#E5E1D6] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              onClick={() => navigate('/pg')}
            >
              <div>
                <div className="h-40 w-full rounded-2xl overflow-hidden mb-4 relative bg-[#E9F2EE] flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80"
                    alt="PG Hostels"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-[#225944] flex items-center justify-center shadow-md">
                    <Bed className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-[#171A18] group-hover:text-[#225944] transition-colors">
                  PG / Hostels
                </h3>
                <p className="text-xs font-semibold text-[#6B6B63] mt-1">
                  Comfortable Stay
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5E1D6] flex items-center justify-between">
                <span className="text-xs font-bold text-[#225944]">Explore Hostels</span>
                <div className="w-9 h-9 rounded-full bg-[#225944] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* Card 2: Meals & Mess */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-5 border border-[#E5E1D6] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              onClick={() => navigate('/meals')}
            >
              <div>
                <div className="h-40 w-full rounded-2xl overflow-hidden mb-4 relative bg-[#FFF9E6] flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                    alt="Meals & Mess"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-[#171A18] flex items-center justify-center shadow-md">
                    <Utensils className="w-5 h-5 text-[#EECA3A]" />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-[#171A18] group-hover:text-[#225944] transition-colors">
                  Meals &amp; Mess
                </h3>
                <p className="text-xs font-semibold text-[#6B6B63] mt-1">
                  Healthy &amp; Tasty
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5E1D6] flex items-center justify-between">
                <span className="text-xs font-bold text-[#225944]">View Mess Plans</span>
                <div className="w-9 h-9 rounded-full bg-[#225944] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* Card 3: Laundry */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-5 border border-[#E5E1D6] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              onClick={() => navigate('/laundry')}
            >
              <div>
                <div className="h-40 w-full rounded-2xl overflow-hidden mb-4 relative bg-[#EBF3FA] flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80"
                    alt="Laundry Pickup"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-[#225944] flex items-center justify-center shadow-md">
                    <Shirt className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-[#171A18] group-hover:text-[#225944] transition-colors">
                  Laundry
                </h3>
                <p className="text-xs font-semibold text-[#6B6B63] mt-1">
                  Quick &amp; Reliable
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5E1D6] flex items-center justify-between">
                <span className="text-xs font-bold text-[#225944]">Book Pickup</span>
                <div className="w-9 h-9 rounded-full bg-[#225944] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* Card 4: Extra Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-5 border border-[#E5E1D6] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              onClick={() => navigate('/services')}
            >
              <div>
                <div className="h-40 w-full rounded-2xl overflow-hidden mb-4 relative bg-[#F4EFFB] flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80"
                    alt="Extra Services"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-[#225944] flex items-center justify-center shadow-md">
                    <Wrench className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-[#171A18] group-hover:text-[#225944] transition-colors">
                  Extra Services
                </h3>
                <p className="text-xs font-semibold text-[#6B6B63] mt-1">
                  All You Need
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5E1D6] flex items-center justify-between">
                <span className="text-xs font-bold text-[#225944]">Browse Services</span>
                <div className="w-9 h-9 rounded-full bg-[#225944] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* REAL POSTGRESQL DATABASE CATALOG SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="py-14 md:py-20 bg-white border-t border-[#E5E1D6]">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#225944] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Campus Marketplace</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#171A18] tracking-tight">
                Live Listings Near Your Campus
              </h2>
            </div>
            <p className="text-sm text-[#6B6B63] max-w-md font-medium">
              Explore real properties and services added directly from verified partners in PostgreSQL.
            </p>
          </div>

          {loadingDb ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#225944] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#225944]">Connecting to InsForge Database...</p>
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* Real PGs Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D6]">
                  <h3 className="text-lg font-extrabold text-[#171A18] flex items-center gap-2">
                    <Bed className="w-5 h-5 text-[#225944]" />
                    <span>Verified PG &amp; Hostels</span>
                  </h3>
                  <Link to="/pg" className="text-xs font-bold text-[#225944] hover:underline flex items-center gap-1">
                    <span>View All PGs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {pgListings.length === 0 ? (
                  <div className="bg-[#F7F5EF] rounded-2xl p-8 text-center border border-[#E5E1D6] text-xs font-semibold text-[#6B6B63]">
                    No PG listings added yet. Real properties created in the Admin Panel will render here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {pgListings.map((pg) => (
                      <div
                        key={pg.id || pg._id}
                        onClick={() => navigate('/pg')}
                        className="bg-[#F7F5EF] rounded-2xl p-4 border border-[#E5E1D6] shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="h-36 w-full rounded-xl overflow-hidden bg-gray-200">
                            {pg.images && pg.images[0] ? (
                              <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-[#6B6B63] font-bold">
                                No Image Uploaded
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#225944]/10 text-[#225944] uppercase">
                              {pg.gender} PG
                            </span>
                            <h4 className="font-extrabold text-sm text-[#171A18] mt-1 truncate">{pg.name}</h4>
                            <p className="text-xs text-[#6B6B63] truncate">{pg.corridor || pg.location?.address || 'Bhilai'}</p>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#E5E1D6] flex items-center justify-between text-xs">
                          <span className="font-black text-[#225944]">₹{pg.monthlyRent || 0}/mo</span>
                          <span className="font-bold text-[#171A18] hover:underline">Details →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real Meals Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D6]">
                  <h3 className="text-lg font-extrabold text-[#171A18] flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-[#EECA3A]" />
                    <span>Mess &amp; Tiffin Subscriptions</span>
                  </h3>
                  <Link to="/meals" className="text-xs font-bold text-[#225944] hover:underline flex items-center gap-1">
                    <span>View All Mess Plans</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {mealProviders.length === 0 ? (
                  <div className="bg-[#F7F5EF] rounded-2xl p-8 text-center border border-[#E5E1D6] text-xs font-semibold text-[#6B6B63]">
                    No meal providers added yet. Real tiffin providers created in the Admin Panel will render here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {mealProviders.map((meal) => (
                      <div
                        key={meal.id || meal._id}
                        onClick={() => navigate('/meals')}
                        className="bg-[#F7F5EF] rounded-2xl p-4 border border-[#E5E1D6] shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="h-36 w-full rounded-xl overflow-hidden bg-gray-200">
                            {meal.image ? (
                              <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-[#6B6B63] font-bold">
                                No Image Uploaded
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#225944] text-white uppercase">
                              {meal.isVeg ? 'Pure Veg' : 'Veg & Non-Veg'}
                            </span>
                            <h4 className="font-extrabold text-sm text-[#171A18] mt-1 truncate">{meal.name}</h4>
                            <p className="text-xs text-[#6B6B63] truncate">{meal.corridor || 'Bhilai'}</p>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#E5E1D6] flex items-center justify-between text-xs">
                          <span className="font-black text-[#225944]">₹{meal.dailyPrice || 80}/day</span>
                          <span className="font-bold text-[#171A18] hover:underline">View Menu →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
