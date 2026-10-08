import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { pgApi, type PGProperty } from '../../services/pgApi';
import { mealApi, type MealProvider } from '../../services/mealApi';
import { laundryApi, type LaundryProvider } from '../../services/laundryApi';
import { serviceApi, type ExtraServiceItem } from '../../services/serviceApi';
import { AnimatedCityFooter } from '../../components/home/AnimatedCityFooter';
import { TemplateMotionHero } from '../../components/home/TemplateMotionHero';
import { ReviewVideoCarousel } from '../../components/home/ReviewVideoCarousel';

type Category = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  iconColor: string;
};

type FeaturedItem = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  href: string;
  icon: LucideIcon;
  kind: 'pg' | 'meal' | 'service';
};

const categories: Category[] = [
  {
    title: 'PGs & hostels',
    description: 'A comfortable place to call home',
    href: '/pg',
    icon: Building2,
    accent: 'bg-[#225944]/10',
    iconColor: 'text-[#225944]',
  },
  {
    title: 'Meals & mess',
    description: 'Good food, made part of your day',
    href: '/meals',
    icon: Utensils,
    accent: 'bg-[#EECA3A]/25',
    iconColor: 'text-[#171A18]',
  },
  {
    title: 'Laundry',
    description: 'Fresh clothes, without the hassle',
    href: '/laundry',
    icon: Shirt,
    accent: 'bg-[#4F7A65]/15',
    iconColor: 'text-[#225944]',
  },
  {
    title: 'Everyday help',
    description: 'Repairs and trusted local services',
    href: '/services',
    icon: Wrench,
    accent: 'bg-[#FFF9E6]',
    iconColor: 'text-[#6B6B63]',
  },
];

type CarouselCard = {
  title: string;
  creator: string;
  href: string;
  icon: LucideIcon;
  bg: string;
  previewBg: string;
  previewType: 'pg' | 'meal' | 'laundry' | 'service' | 'trust' | 'location' | 'fast';
  previewIcon: string;
  image: string;
  badge: string;
};

const carouselCards: CarouselCard[] = [
  {
    title: 'PGs & Hostels: Campus Living',
    creator: 'EaseHub Stays',
    href: '/pg',
    icon: Building2,
    bg: 'bg-[#F2EFE9]',
    previewBg: 'bg-[#ECE8E0]',
    previewType: 'pg',
    previewIcon: '🏠',
    image: '/carousel/pg-stays.jpg',
    badge: 'Verified 400m from Gate',
  },
  {
    title: 'Daily Meals & Student Mess',
    creator: 'EaseHub Dining',
    href: '/meals',
    icon: Utensils,
    bg: 'bg-[#EECA3A]',
    previewBg: 'bg-[#E3BD26]',
    previewType: 'meal',
    previewIcon: '🍲',
    image: '/carousel/daily-meals.jpg',
    badge: 'Hostel Gate Delivery',
  },
  {
    title: 'Express Doorstep Laundry',
    creator: 'EaseHub Care',
    href: '/laundry',
    icon: Shirt,
    bg: 'bg-[#F0EDE6]',
    previewBg: 'bg-[#E5E1D8]',
    previewType: 'laundry',
    previewIcon: '🧺',
    image: '/carousel/express-laundry.jpg',
    badge: 'Clean & Ironed in 24h',
  },
  {
    title: 'Everyday Repairs & Help',
    creator: 'EaseHub Support',
    href: '/services',
    icon: Wrench,
    bg: 'bg-[#171A18]',
    previewBg: 'bg-[#262B28]',
    previewType: 'service',
    previewIcon: '⚡',
    image: '/carousel/repairs-help.jpg',
    badge: 'On-Demand Handyman',
  },
  {
    title: 'Zero Brokerage Guarantee',
    creator: 'EaseHub Direct',
    href: '/pg',
    icon: ShieldCheck,
    bg: 'bg-[#225944]',
    previewBg: 'bg-[#1B4A38]',
    previewType: 'trust',
    previewIcon: '🛡️',
    image: '/carousel/zero-brokerage.jpg',
    badge: '100% Direct Landlords',
  },
  {
    title: 'Campus-Near Corridor Map',
    creator: 'EaseHub Campus',
    href: '/pg',
    icon: MapPin,
    bg: 'bg-[#9D76F7]',
    previewBg: 'bg-[#8A5EE6]',
    previewType: 'location',
    previewIcon: '📍',
    image: '/carousel/campus-map.jpg',
    badge: 'Walking Distance Only',
  },
  {
    title: '1-Click Instant Room Hold',
    creator: 'EaseHub Fast',
    href: '/pg',
    icon: Sparkles,
    bg: 'bg-[#E0F2FE]',
    previewBg: 'bg-[#BAE6FD]',
    previewType: 'fast',
    previewIcon: '✨',
    image: '/carousel/instant-hold.jpg',
    badge: 'Zero Waiting Period',
  },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

/* ── Scroll-fill text (Jitter-style, word by word) ─────────── */
const FILL_TEXT =
  'EaseHub gives every campus student one place to find a stay, sort their meals, get laundry done, and fix everyday problems — so settling in feels simple, not stressful.';

function ScrollFillWord({
  word,
  progress,
  start,
  end,
}: {
  word: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const color = useTransform(progress, [start, end], ['#D0D0D0', '#171A18']);
  return (
    <motion.span style={{ color }} className="inline-block mr-[0.26em]">
      {word}
    </motion.span>
  );
}

function ScrollFillText({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.95', 'start 0.1'],
  });

  const words = FILL_TEXT.split(' ');

  if (reduceMotion) {
    return (
      <section ref={ref}>
        <p className="max-w-5xl text-4xl font-extrabold leading-tight tracking-tight text-[#171A18] sm:text-5xl lg:text-6xl" style={{ lineHeight: 1.15 }}>
          {FILL_TEXT}
        </p>
      </section>
    );
  }

  return (
    <section ref={ref}>
      <p
        className="max-w-5xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        style={{ lineHeight: 1.15 }}
      >
        {words.map((word, i) => (
          <ScrollFillWord
            key={i}
            word={word}
            progress={scrollYProgress}
            start={i / words.length}
            end={Math.min((i + 2) / words.length, 1)}
          />
        ))}
      </p>
    </section>
  );
}

export const TemplateHomePage: React.FC = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion() ?? false;
  const [pgListings, setPgListings] = useState<PGProperty[]>([]);
  const [mealProviders, setMealProviders] = useState<MealProvider[]>([]);
  const [laundryProviders, setLaundryProviders] = useState<LaundryProvider[]>([]);
  const [extraServices, setExtraServices] = useState<ExtraServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      pgApi.getAll().catch(() => [] as PGProperty[]),
      mealApi.getAll().catch(() => [] as MealProvider[]),
      laundryApi.getAll().catch(() => [] as LaundryProvider[]),
      serviceApi.getAll().catch(() => [] as ExtraServiceItem[]),
    ]).then(([pgs, meals, laundry, services]) => {
      if (!isMounted) return;
      setPgListings(Array.isArray(pgs) ? pgs.slice(0, 4) : []);
      setMealProviders(Array.isArray(meals) ? meals.slice(0, 4) : []);
      setLaundryProviders(Array.isArray(laundry) ? laundry.slice(0, 4) : []);
      setExtraServices(Array.isArray(services) ? services.slice(0, 4) : []);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredItems: FeaturedItem[] = [
    ...pgListings.map((pg) => ({
      id: `pg-${pg.id || pg._id}`,
      title: pg.name,
      subtitle: pg.corridor || pg.location?.address || 'Campus-area stay',
      tag: pg.monthlyRent ? `From ₹${pg.monthlyRent.toLocaleString('en-IN')} / month` : 'Explore stay',
      href: '/pg',
      icon: Building2,
      kind: 'pg' as const,
    })),
    ...mealProviders.map((meal) => ({
      id: `meal-${meal.id || meal._id}`,
      title: meal.name,
      subtitle: meal.corridor || meal.location?.address || 'Fresh meals near campus',
      tag: meal.dailyPrice ? `From ₹${meal.dailyPrice} / meal` : 'Explore meals',
      href: '/meals',
      icon: Utensils,
      kind: 'meal' as const,
    })),
  ].slice(0, 4);

  const serviceCounts = [pgListings.length, mealProviders.length, laundryProviders.length, extraServices.length];

  return (
    <div className="min-h-screen overflow-x-clip bg-[#F7F5EF] font-sans text-[#171A18] antialiased selection:bg-[#EECA3A] selection:text-[#171A18]">
      <section className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F7F5EF]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#4F7A65]/10 blur-3xl"
            animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, -18, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-32 top-28 h-96 w-96 rounded-full bg-[#EECA3A]/15 blur-3xl"
            animate={reduceMotion ? undefined : { x: [0, -24, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Full-cover animated hero text */}
        <div className="relative w-full flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.8 }}
            className="w-full"
          >
            <TemplateMotionHero />
          </motion.div>
        </div>

      </section>

      {/* ── AUTO-SCROLL CAROUSEL ─────────────────────────────────────── */}
      <section
        id="campus-services"
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F7F5EF]"
      >
        {/* ── Carousel ── */}
        <div className="relative z-10 w-full overflow-hidden">
          <style>{`
            @keyframes carousel-bounce {
              0%   { transform: translateX(0); }
              100% { transform: translateX(calc(-133.33vw - 8px)); }
            }
            .carousel-reel {
              display: flex;
              width: max-content;
              animation: carousel-bounce 22s ease-in-out infinite alternate;
            }
          `}</style>

          <div className="carousel-reel" style={{ gap: '20px', padding: '32px 10px' }}>
            {carouselCards.map((card, i) => (
              <Link
                key={i}
                to={card.href}
                className="group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[32px] sm:rounded-[40px] bg-[#EAE8E1]/90 hover:bg-[#EAE8E1] p-6 sm:p-8 shadow-[0_8px_40px_rgba(23,26,24,0.06)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(23,26,24,0.12)] hover:-translate-y-1"
                style={{ width: 'calc(100vw / 3 - 16px)', minWidth: '320px', maxWidth: '480px', height: '64vh', minHeight: '520px' }}
              >
                {/* 1. Center Visual Art / Media Frame (Like the shoe showcase in reference) */}
                <div className="flex-1 w-full flex items-center justify-center p-3 sm:p-5">
                  <div className={`relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl sm:rounded-3xl ${card.previewBg} shadow-[0_14px_34px_rgba(0,0,0,0.10)] overflow-hidden border border-black/8 group-hover:scale-[1.03] transition-transform duration-300`}>
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
                    <span className="absolute bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm text-[11px] font-bold text-[#171A18] tracking-tight border border-black/5">
                      {card.badge}
                    </span>
                  </div>
                </div>

                {/* 2. Bottom Meta Strip: Black Circle Logo + Video/Feature Title + Brand Author (Exact match to Jitter image) */}
                <div className="flex items-center gap-3.5 pt-4">
                  {/* EaseHub Circular Brand Logo Avatar */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#171A18] overflow-hidden shrink-0 shadow-sm border border-black/10 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="EaseHub"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-xs font-black text-[#EECA3A]">EH</span>';
                        }
                      }}
                    />
                  </div>

                  {/* Title & Creator Subtitle */}
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-[#171A18] tracking-tight truncate leading-snug group-hover:text-[#225944] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#7A7A73] font-medium leading-none mt-0.5">
                      {card.creator}
                    </p>
                  </div>
                </div>

                {/* Subtle Hover Sheen */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[32px] sm:rounded-[40px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)' }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCROLL-FILL TEXT SECTION ─────────────────────────────────── */}
      <section className="bg-[#F7F5EF] px-6 pt-20 pb-20 sm:px-12 sm:pt-28 sm:pb-28 lg:px-24">
        <ScrollFillText reduceMotion={reduceMotion} />
      </section>

      {/* ── STACKING CARDS ON SCROLL (JITTER STYLE) ────────────────── */}
      <section className="relative bg-[#F7F5EF] pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Section Heading — Exact Jitter Format */}
        <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20 px-4">
          {/* Giant Ultra-Bold Headline */}
          <h2 className="text-5xl sm:text-7xl lg:text-[80px] font-black tracking-[-0.035em] text-[#171A18] leading-[1.04]">
            Less searching.<br />
            More settling in.
          </h2>

          {/* 2 Short Punchy Subtitle Lines */}
          <div className="mt-5 text-base sm:text-lg text-[#55554E] leading-relaxed">
            <p>No brokers, no stress, no waiting.</p>
            <p className="mt-1">Start settling in instantly.</p>
          </div>

          {/* Jitter Dark Pill Button */}
          <div className="mt-7 flex justify-center">
            <Link
              to="/pg"
              className="inline-flex items-center justify-center rounded-full bg-[#171A18] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-xs transition-all duration-200 hover:bg-[#2B2F2D] hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started for free
            </Link>
          </div>
        </div>

        {/* Stacking Cards Deck (Larger Portrait Cards with Dedicated Calibrated Lock Pauses) */}
        <div className="relative mx-auto max-w-[520px] sm:max-w-[540px] px-4 pb-12">
          {/* CARD 1 */}
          <div className="sticky top-0 h-screen flex items-center justify-center" style={{ zIndex: 10 }}>
            <div className="relative w-full h-[560px] sm:h-[580px] rounded-[32px] sm:rounded-[36px] border border-[#E5E1D6] bg-white p-7 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col justify-between">
              <div>
                <span className="inline-block rounded-full bg-[#171A18] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white mb-3">
                  Verified & Safe Stays
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171A18]">
                  A little more peace of mind
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#6B6B63] leading-relaxed">
                  Clear details, verified owners, and transparent pricing help you choose what fits your routine without surprises.
                </p>
              </div>

              {/* Visual Showcase: Room Listing Card */}
              <div className="my-4 w-full rounded-2xl border border-[#E5E1D6] bg-[#F7F5EF] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#225944]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#225944]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Verified Property
                  </span>
                  <span className="text-xs font-bold text-[#171A18]">★ 4.9 (120+ reviews)</span>
                </div>
                <h4 className="mt-2.5 text-base sm:text-lg font-black text-[#171A18]">Shree Krishna Residency</h4>
                <p className="text-xs text-[#6B6B63]">Nehru Nagar, Bhilai • 400m from BIT Gate</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-[#171A18]">
                  <span className="rounded-lg bg-white px-2.5 py-1 border border-[#E5E1D6]">🛏️ Single / Double Room</span>
                  <span className="rounded-lg bg-white px-2.5 py-1 border border-[#E5E1D6]">📶 Wi-Fi 100M</span>
                  <span className="rounded-lg bg-white px-2.5 py-1 border border-[#E5E1D6]">🍽️ 3 Meals Daily</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#E5E1D6] pt-3">
                  <div>
                    <span className="text-[11px] text-[#6B6B63]">Starting from</span>
                    <p className="text-lg font-black text-[#171A18]">₹6,500 <span className="text-xs font-normal text-[#6B6B63]">/mo</span></p>
                  </div>
                  <Link to="/pg" className="inline-flex items-center gap-1.5 rounded-xl bg-[#225944] px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-[#184232]">
                    Book Visit <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B6B63] pt-2 border-t border-[#E5E1D6]/60">
                <span>01 / 04</span>
                <span className="font-bold text-[#225944]">Scroll down for next card ↓</span>
              </div>
            </div>
          </div>

          {/* Screen Lock Pause after Card 1 */}
          <div className="h-[30vh] pointer-events-none" />

          {/* CARD 2 */}
          <div className="sticky top-0 h-screen flex items-center justify-center" style={{ zIndex: 20 }}>
            <div className="relative w-full h-[560px] sm:h-[580px] rounded-[32px] sm:rounded-[36px] border border-[#1d4b39] bg-[#225944] p-7 sm:p-8 shadow-[0_-12px_36px_rgba(0,0,0,0.18),0_25px_50px_rgba(0,0,0,0.2)] flex flex-col justify-between text-white">
              <div>
                <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white mb-3">
                  Hyperlocal Proximity
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Close to your campus
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-white/80 leading-relaxed">
                  Stays, messes, and essentials mapped within walking or 5-minute cycling distance from college gates across Bhilai, Raipur & Durg.
                </p>
              </div>

              {/* Visual Showcase: Proximity Radar */}
              <div className="my-4 w-full rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#EECA3A]">📍 Campus Radius Active</span>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white">18 Spots Mapped</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🚶</span>
                      <div>
                        <p className="text-xs font-bold text-white">Main College Gate</p>
                        <p className="text-[10px] text-white/70">Walk time</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#EECA3A]">4 min (280m)</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🍛</span>
                      <div>
                        <p className="text-xs font-bold text-white">Maa Annapurna Mess</p>
                        <p className="text-[10px] text-white/70">Homestyle food</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#EECA3A]">2 min (140m)</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🧺</span>
                      <div>
                        <p className="text-xs font-bold text-white">Doorstep Express Wash</p>
                        <p className="text-[10px] text-white/70">Free pickup/drop</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#EECA3A]">3 min (220m)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/10">
                <span>02 / 04</span>
                <span className="font-bold text-[#EECA3A]">Keep scrolling ↓</span>
              </div>
            </div>
          </div>

          {/* Screen Lock Pause after Card 2 */}
          <div className="h-[30vh] pointer-events-none" />

          {/* CARD 3 */}
          <div className="sticky top-0 h-screen flex items-center justify-center" style={{ zIndex: 30 }}>
            <div className="relative w-full h-[560px] sm:h-[580px] rounded-[32px] sm:rounded-[36px] border border-[#EECA3A]/60 bg-[#EECA3A] p-7 sm:p-8 shadow-[0_-12px_36px_rgba(0,0,0,0.18),0_25px_50px_rgba(0,0,0,0.2)] flex flex-col justify-between text-[#171A18]">
              <div>
                <span className="inline-block rounded-full bg-[#171A18] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#EECA3A] mb-3">
                  All-in-One Hub
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171A18]">
                  One easy starting point
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#171A18]/80 leading-relaxed">
                  Hostels, daily meal subscriptions, and laundry pickups organized in one smooth platform — focus on studies, not chores.
                </p>
              </div>

              {/* Visual Showcase: Integrated Student Hub */}
              <div className="my-4 w-full rounded-2xl border border-[#171A18]/10 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E5E1D6] pb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#225944]">Student Life Hub</span>
                  <span className="rounded-full bg-[#225944]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#225944]">All Active ✅</span>
                </div>
                <div className="mt-2.5 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-[#F7F5EF] p-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#225944] text-white text-xs">🏠</span>
                      <div>
                        <p className="text-xs font-bold text-[#171A18]">Room 204 Stay</p>
                        <p className="text-[10px] text-[#6B6B63]">Rent: Paid for month</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#225944]">Active</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[#F7F5EF] p-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#EECA3A] text-[#171A18] text-xs">🍲</span>
                      <div>
                        <p className="text-xs font-bold text-[#171A18]">Daily 2-Meal Plan</p>
                        <p className="text-[10px] text-[#6B6B63]">Arriving at 8:15 PM</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#225944]">On Time</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[#F7F5EF] p-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#171A18] text-white text-xs">👕</span>
                      <div>
                        <p className="text-xs font-bold text-[#171A18]">Laundry Wash</p>
                        <p className="text-[10px] text-[#6B6B63]">7 clothes scheduled</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#225944]">Ready</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#171A18]/70 pt-2 border-t border-[#171A18]/10">
                <span>03 / 04</span>
                <span className="font-bold text-[#171A18]">Almost there ↓</span>
              </div>
            </div>
          </div>

          {/* Screen Lock Pause after Card 3 */}
          <div className="h-[30vh] pointer-events-none" />

          {/* CARD 4 */}
          <div className="sticky top-0 h-screen flex items-center justify-center" style={{ zIndex: 40 }}>
            <div className="relative w-full h-[560px] sm:h-[580px] rounded-[32px] sm:rounded-[36px] border border-white/10 bg-[#171A18] p-7 sm:p-8 shadow-[0_-12px_36px_rgba(0,0,0,0.25),0_25px_60px_rgba(0,0,0,0.35)] flex flex-col justify-between text-white">
              <div>
                <span className="inline-block rounded-full bg-[#225944] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white mb-3">
                  Flexible & Custom
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Make it your own
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-white/70 leading-relaxed">
                  Choose only the services that make your day work better. Pause mess plans during semester breaks, schedule laundry, and customize freely.
                </p>
              </div>

              {/* Visual Showcase: Smart Controls & Pause */}
              <div className="my-4 w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-xs font-bold text-[#EECA3A]">⚡ Smart Student Controls</span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">Customized</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5">
                    <div>
                      <p className="text-xs font-bold text-white">Vacation Pause</p>
                      <p className="text-[10px] text-white/60">Pauses mess billing for 14 days</p>
                    </div>
                    <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black text-black">Active</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5">
                    <div>
                      <p className="text-xs font-bold text-white">Exam Night Tea Boost</p>
                      <p className="text-[10px] text-white/60">Snack delivery during finals</p>
                    </div>
                    <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black text-black">Active</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[#225944]/40 border border-[#225944] p-2.5">
                    <p className="text-xs font-bold text-[#EECA3A]">💰 Smart Savings</p>
                    <span className="text-xs font-black text-white">₹1,450 Saved</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/10">
                <span>04 / 04</span>
                <Link to="/pg" className="font-extrabold text-[#EECA3A] hover:underline inline-flex items-center gap-1.5">
                  Start Exploring EaseHub <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Screen Lock Pause after Card 4 */}
          <div className="h-[38vh] pointer-events-none" />
        </div>
      </section>


      {/* ── 10-CARD STUDENT VIDEO REVIEWS CAROUSEL (EXACT JITTER STYLE) ── */}
      <ReviewVideoCarousel />

      {/* Campus Skyline Animated Panorama */}
      <AnimatedCityFooter />

      {/* ── PRE-FOOTER CTA SECTION (EXACT JITTER STYLE) ───────────── */}
      <section className="bg-[#F7F5EF] pt-16 pb-6 sm:pt-24 sm:pb-8 text-[#171A18]">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-5xl sm:text-7xl lg:text-[80px] font-black tracking-[-0.035em] text-[#171A18] leading-[1.04]">
            Try EaseHub today,
          </h2>
          <div className="mt-5 text-base sm:text-xl font-medium text-[#55554E] leading-relaxed">
            <p>No brokers, no stress, no waiting.</p>
            <p className="mt-1">Start settling in instantly.</p>
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              to="/pg"
              className="inline-flex items-center justify-center rounded-full bg-[#171A18] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-xs transition-all duration-200 hover:bg-[#2B2F2D] hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started for free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TemplateHomePage;
