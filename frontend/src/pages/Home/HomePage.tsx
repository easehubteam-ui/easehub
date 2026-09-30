import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Building2,
  Utensils,
  Shirt,
  Wrench,
  Star,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Compass,
  Zap,
  Clock,
  ExternalLink,
  ChevronRight,
  BadgeCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { pgApi, PGProperty } from '../../services/pgApi';
import { mealApi, MealProvider } from '../../services/mealApi';
import { laundryApi, LaundryProvider } from '../../services/laundryApi';
import { serviceApi, ExtraServiceItem } from '../../services/serviceApi';
import PlaceholderImage from '../../components/common/PlaceholderImage';
import { AnimatedCityFooter } from '../../components/home/AnimatedCityFooter';

// Client Marquee Logos (Exact match to jitter.video reference)
const clientLogos = [
  { name: 'Google', symbol: 'Google' },
  { name: 'Gamma', symbol: 'Gamma' },
  { name: 'Perplexity', symbol: 'Perplexity' },
  { name: 'DEPT', symbol: 'DEPT' },
  { name: 'Deliveroo', symbol: 'Deliveroo' },
  { name: 'TikTok', symbol: 'TikTok' },
  { name: 'Huge', symbol: 'Huge' },
  { name: 'Spotify', symbol: 'Spotify' },
  { name: 'AKQA', symbol: 'AKQA' },
  { name: 'Linktree', symbol: 'Linktree*' },
  { name: '27b', symbol: '27b' },
  { name: 'Ogilvy', symbol: 'Ogilvy' },
  { name: 'Webflow', symbol: 'Webflow' },
  { name: 'TBWA', symbol: 'TBWA\\' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion() ?? false;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pg' | 'meals' | 'laundry' | 'services'>('pg');

  // Database States
  const [pgListings, setPgListings] = useState<PGProperty[]>([]);
  const [mealProviders, setMealProviders] = useState<MealProvider[]>([]);
  const [laundryProviders, setLaundryProviders] = useState<LaundryProvider[]>([]);
  const [extraServices, setExtraServices] = useState<ExtraServiceItem[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Fetch InsForge API Data
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
    <div className="bg-white text-[#111827] font-sans antialiased min-h-screen selection:bg-[#A78BFA] selection:text-white overflow-x-hidden">
      
      {/* ---------------------------------------------------- */}
      {/* 1. HERO SECTION (JITTER.VIDEO VISUAL STYLE MATCH) */}
      {/* ---------------------------------------------------- */}
      <section className="relative bg-white pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-[#E5E7EB]">
        
        {/* Glow Effects */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#A78BFA]/20 via-[#225944]/5 to-transparent rounded-full blur-3xl"
            animate={reduceMotion ? undefined : { scale: [0.95, 1.05, 0.95], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Pill Tag Badge */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-xs sm:text-sm font-semibold text-[#111827] shadow-xs hover:border-[#A78BFA] transition-colors cursor-pointer"
          >
            <span className="font-extrabold">Superagents:</span>
            <span className="text-[#4B5563]">AI campus assistant, built right into EaseHub</span>
            <span className="text-[#8B5CF6] font-bold inline-flex items-center gap-1">
              Learn more <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </motion.div>

          {/* Headline Typography (Jitter Style) */}
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-8 text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-extrabold tracking-[-0.05em] leading-[0.95] text-[#111827]"
          >
            Campus life.
            <br />
            <span className="text-[#111827]">Now with AI.</span>
          </motion.h1>

          {/* Subheading Narrative */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl mx-auto text-base sm:text-xl text-[#4B5563] font-medium leading-relaxed"
          >
            Discover stays, home meals, express laundry, and trusted repair services—all unified for your campus experience.
          </motion.p>

          {/* Action CTA Pill Button */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center items-center gap-4"
          >
            <Link
              to="/pg"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#A78BFA] hover:bg-[#8B5CF6] text-white text-base font-extrabold shadow-lg shadow-[#8B5CF6]/25 hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Try EaseHub for free
            </Link>
          </motion.div>

          {/* Motion Hero Player Screen */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-14 max-w-5xl mx-auto relative rounded-3xl border border-[#E5E7EB] bg-[#0D0E12] p-4 shadow-2xl overflow-hidden text-left"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 text-white text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="ml-3 text-white/70">EaseHub Motion Showcase</span>
              </div>
              <div className="flex gap-1 bg-white/10 p-1 rounded-xl">
                {(['pg', 'meals', 'laundry', 'services'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold capitalize transition-colors ${
                      activeTab === tab ? 'bg-[#8B5CF6] text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 sm:p-12 min-h-[320px] flex items-center justify-center text-white">
              <AnimatePresence mode="wait">
                {activeTab === 'pg' && (
                  <motion.div
                    key="pg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                  >
                    <div className="md:col-span-7 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A78BFA]/20 text-[#A78BFA] text-xs font-extrabold uppercase">
                        <Building2 className="w-3.5 h-3.5" /> Verified Campus Stay
                      </div>
                      <h3 className="text-3xl font-extrabold">St. Xavier Student Hostel & PG</h3>
                      <p className="text-sm text-gray-300">
                        AC double sharing rooms with 3-time meals, high-speed Wi-Fi, biometric entry, and 24/7 CCTV security.
                      </p>
                      <div className="flex gap-4 items-center">
                        <span className="text-2xl font-extrabold text-[#A78BFA]">₹6,500 / mo</span>
                        <Link to="/pg" className="px-5 py-2.5 rounded-full bg-[#8B5CF6] text-white text-xs font-extrabold hover:bg-[#7C3AED]">
                          Explore Stay
                        </Link>
                      </div>
                    </div>
                    <div className="md:col-span-5 h-56 rounded-2xl bg-white/10 overflow-hidden">
                      <PlaceholderImage type="pg" title="St. Xavier PG" />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'meals' && (
                  <motion.div
                    key="meals"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                  >
                    <div className="md:col-span-7 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EECA3A]/20 text-[#EECA3A] text-xs font-extrabold uppercase">
                        <Utensils className="w-3.5 h-3.5" /> Home Tiffin Service
                      </div>
                      <h3 className="text-3xl font-extrabold">Annapurna Pure Veg Mess</h3>
                      <p className="text-sm text-gray-300">
                        Fresh North & South Indian meal boxes delivered to your room on a flexible monthly plan.
                      </p>
                      <div className="flex gap-4 items-center">
                        <span className="text-2xl font-extrabold text-[#EECA3A]">₹80 / meal</span>
                        <Link to="/meals" className="px-5 py-2.5 rounded-full bg-[#EECA3A] text-[#111827] text-xs font-extrabold hover:bg-white">
                          Subscribe Mess
                        </Link>
                      </div>
                    </div>
                    <div className="md:col-span-5 h-56 rounded-2xl bg-white/10 overflow-hidden">
                      <PlaceholderImage type="meals" title="Annapurna Mess" />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'laundry' && (
                  <motion.div
                    key="laundry"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                  >
                    <div className="md:col-span-7 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] text-xs font-extrabold uppercase">
                        <Shirt className="w-3.5 h-3.5" /> Express Pickup & Wash
                      </div>
                      <h3 className="text-3xl font-extrabold">FreshWash Laundry Hub</h3>
                      <p className="text-sm text-gray-300">
                        24-hour turnaround for washing, steam ironing, and door-to-door delivery.
                      </p>
                      <div className="flex gap-4 items-center">
                        <span className="text-2xl font-extrabold text-[#A78BFA]">₹49 / kg</span>
                        <Link to="/laundry" className="px-5 py-2.5 rounded-full bg-[#8B5CF6] text-white text-xs font-extrabold hover:bg-[#7C3AED]">
                          Schedule Wash
                        </Link>
                      </div>
                    </div>
                    <div className="md:col-span-5 h-56 rounded-2xl bg-white/10 overflow-hidden">
                      <PlaceholderImage type="laundry" title="FreshWash Hub" />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'services' && (
                  <motion.div
                    key="services"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                  >
                    <div className="md:col-span-7 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#225944]/30 text-[#4ADE80] text-xs font-extrabold uppercase">
                        <Wrench className="w-3.5 h-3.5" /> Everyday Campus Care
                      </div>
                      <h3 className="text-3xl font-extrabold">Quick Fix Electrical & Repair</h3>
                      <p className="text-sm text-gray-300">
                        Certified technicians available for AC repair, electrical fixes, and room cleaning in 30 mins.
                      </p>
                      <div className="flex gap-4 items-center">
                        <span className="text-2xl font-extrabold text-[#4ADE80]">₹149 / visit</span>
                        <Link to="/services" className="px-5 py-2.5 rounded-full bg-[#225944] text-white text-xs font-extrabold hover:bg-[#1b4736]">
                          Book Repair
                        </Link>
                      </div>
                    </div>
                    <div className="md:col-span-5 h-56 rounded-2xl bg-white/10 overflow-hidden">
                      <PlaceholderImage type="services" title="Quick Fix Repairs" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Client Logo Scroller Marquee */}
          <div className="mt-16 pt-8 border-t border-[#E5E7EB]">
            <p className="text-xs sm:text-sm font-semibold text-[#6B7280] uppercase tracking-wider">
              <strong>Over 20,000 creative teams & students use EaseHub</strong> to create stunning stays online.
            </p>

            <div className="mt-8 relative w-full overflow-hidden flex items-center justify-center">
              <div className="flex gap-12 sm:gap-16 items-center whitespace-nowrap animate-marquee">
                {clientLogos.concat(clientLogos).map((logo, idx) => (
                  <span
                    key={`${logo.name}-${idx}`}
                    className="text-xl sm:text-2xl font-extrabold text-[#111827]/40 hover:text-[#111827] transition-colors cursor-default"
                  >
                    {logo.symbol}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ---------------------------------------------------- */}
      {/* 2. TEMPLATES / POPULAR STAYS CAROUSEL SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="py-16 sm:py-24 bg-[#FAF9F5] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#F3F4F6] text-xs font-extrabold uppercase tracking-wider text-[#111827] border border-[#E5E7EB]">
              Templates & Popular Stays
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">
              Ready-to-move campus options
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] font-medium">
              Explore featured stays, home mess plans, and services with 1-click booking.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'The Track: Premium PG', subtitle: 'EaseHub Verified', tag: 'PG Stay', href: '/pg' },
              { title: 'Home Tiffin Mess Plan', subtitle: 'Fresh Meal Box', tag: 'Meals', href: '/meals' },
              { title: 'Express Laundry Service', subtitle: 'Wash & Steam Iron', tag: 'Laundry', href: '/laundry' },
              { title: 'Quick Repair Support', subtitle: '30-Min Technicians', tag: 'Services', href: '/services' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div className="relative aspect-[4/5] rounded-xl bg-[#F3F4F6] overflow-hidden flex items-center justify-center">
                  <PlaceholderImage type={item.tag === 'PG Stay' ? 'pg' : item.tag === 'Meals' ? 'meals' : item.tag === 'Laundry' ? 'laundry' : 'services'} title={item.title} />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold uppercase text-[#111827] shadow-xs">
                    {item.tag}
                  </span>
                  <Link
                    to={item.href}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <span className="px-4 py-2 rounded-full bg-white text-[#111827] text-xs font-extrabold shadow-md flex items-center gap-1">
                      Open option <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>

                <div className="mt-4 pt-2">
                  <h3 className="text-base font-extrabold text-[#111827] group-hover:text-[#8B5CF6] transition-colors truncate">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#6B7280] font-semibold">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ---------------------------------------------------- */}
      {/* 3. SCROLL APPEAR TEXT REVEAL SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="py-20 sm:py-32 bg-[#0D0E12] text-white border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-snug tracking-tight text-white/90">
            EaseHub helps creative teams and students design and ship polished campus living at scale. Kickstart stays and meal plans with AI, then take full creative control to fine-tune every detail until it’s unmistakably yours.
          </p>
        </div>
      </section>


      {/* ---------------------------------------------------- */}
      {/* 4. ACCESSIBILITY & STACKED FEATURE CARDS SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="py-20 sm:py-32 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#F3F4F6] text-xs font-extrabold uppercase tracking-wider text-[#111827] border border-[#E5E7EB]">
              Campus Living, Accelerated
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">
              From idea to comfort in seconds
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] font-medium">
              Turn static searching into animated campus booking in no time.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-[#FAF9F5] border border-[#E5E7EB] space-y-6 hover:shadow-xl transition-all">
              <div className="h-48 rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden flex items-center justify-center p-4">
                <PlaceholderImage type="pg" title="Book with Agents" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#111827]">Book with agents</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Skip the manual calls. Describe your preferences and let EaseHub AI find verified PGs, meal packages, and room amenities tailored for you.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-[#FAF9F5] border border-[#E5E7EB] space-y-6 hover:shadow-xl transition-all">
              <div className="h-48 rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden flex items-center justify-center p-4">
                <PlaceholderImage type="meals" title="Refine Control" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#111827]">Refine with full control</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Customize your weekly food menu, room sharing ratio, or laundry schedule with intuitive controls until it fits your exact routine.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-[#FAF9F5] border border-[#E5E7EB] space-y-6 hover:shadow-xl transition-all">
              <div className="h-48 rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden flex items-center justify-center p-4 text-center">
                <div className="text-4xl font-black text-[#8B5CF6]">5×</div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#111827]">Ship comfort at scale</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Book, manage, and settle fast in a unified portal with zero brokerage and instant digital confirmation.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ---------------------------------------------------- */}
      {/* 5. VERIFIED INSFORGE DATABASE CATALOG SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="py-20 sm:py-32 bg-[#FAF9F5] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#E5E7EB]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#225944]">
                InsForge Database Records
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                Current Campus Listings & Services
              </h2>
            </div>
            <Link
              to="/pg"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#8B5CF6] hover:underline"
            >
              <span>View All Listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingDb ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-72 rounded-2xl bg-white animate-pulse border border-[#E5E7EB]" />
              ))
            ) : pgListings.length > 0 ? (
              pgListings.map((pg) => (
                <div
                  key={pg.id || pg._id}
                  className="group rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-[#F3F4F6] overflow-hidden">
                    <PlaceholderImage type="pg" title={pg.name} />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-[#111827] shadow-xs">
                      ₹{pg.monthlyRent?.toLocaleString('en-IN') || '4,999'} / mo
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#111827] group-hover:text-[#8B5CF6] transition-colors truncate">
                        {pg.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#6B7280] font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#225944]" />
                        <span>{pg.corridor || pg.location?.address || 'Near Campus'}</span>
                      </p>
                    </div>
                    <Link
                      to="/pg"
                      className="w-full py-2.5 rounded-full bg-[#F3F4F6] group-hover:bg-[#8B5CF6] group-hover:text-white text-[#111827] text-xs font-extrabold text-center transition-colors block"
                    >
                      Book Stay
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 p-8 text-center bg-white rounded-2xl border border-[#E5E7EB]">
                <p className="text-sm font-semibold text-[#6B7280]">Explore campus stays and verified hostels.</p>
                <Link to="/pg" className="mt-4 inline-block px-5 py-2.5 rounded-full bg-[#8B5CF6] text-white text-xs font-extrabold">
                  Browse Stays
                </Link>
              </div>
            )}
          </div>

        </div>
      </section>


      {/* ---------------------------------------------------- */}
      {/* 6. ANIMATED CITY SKYLINE FOOTER */}
      {/* ---------------------------------------------------- */}
      <AnimatedCityFooter />

    </div>
  );
};

export default HomePage;
