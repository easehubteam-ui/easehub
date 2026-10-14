import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldCheck,
  Shirt,
  Sparkles,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { pgApi, type PGProperty } from '../../services/pgApi';
import { mealApi, type MealProvider } from '../../services/mealApi';
import { laundryApi, type LaundryProvider } from '../../services/laundryApi';
import { serviceApi, type ExtraServiceItem } from '../../services/serviceApi';
import { useServiceExperience } from '../../context/ServiceExperienceContext';
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
  const { settings: serviceSettings } = useServiceExperience();
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

  const featuredStay = pgListings[0];
  const featuredMeal = mealProviders[0];
  const featuredLaundry = laundryProviders[0];
  const featuredService = extraServices[0];
  const formatPrice = (price?: number) => price && price > 0 ? `₹${price.toLocaleString('en-IN')}` : null;
  const visibleCarouselCards = carouselCards.filter((card) => {
    if (card.href === '/meals') return Boolean(serviceSettings?.old_meals_enabled || serviceSettings?.new_meals_enabled);
    if (card.href === '/laundry') return Boolean(serviceSettings?.old_laundry_enabled || serviceSettings?.new_laundry_enabled);
    if (card.href === '/services') return Boolean(serviceSettings?.extra_services_enabled);
    return true;
  });

  return (
    <div className="min-h-screen overflow-x-clip bg-[#F7F5EF] font-sans text-[#171A18] antialiased selection:bg-[#EECA3A] selection:text-[#171A18]">
      <section className="relative isolate flex min-h-[85vh] sm:min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F7F5EF]">
        {/* Full-cover animated hero text */}
        <div className="relative w-full flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.6 }}
            className="w-full"
          >
            <TemplateMotionHero />
          </motion.div>
        </div>
      </section>

      {/* ── AUTO-SCROLL CAROUSEL ─────────────────────────────────────── */}
      <section
        id="campus-services"
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F7F5EF] py-12"
      >
        {/* ── Carousel ── */}
        <div className="relative z-10 w-full overflow-hidden">
          <style>{`
            @keyframes carousel-bidirectional {
              0%   { transform: translateX(0); }
              100% { transform: translateX(calc(-100% + 100vw)); }
            }
            .carousel-reel {
              display: flex;
              width: max-content;
              animation: carousel-bidirectional 28s linear infinite alternate;
              will-change: transform;
            }
          `}</style>

          <div className="carousel-reel" style={{ gap: '20px', padding: '24px 20px' }}>
            {visibleCarouselCards.map((card, i) => (
              <Link
                key={i}
                to={card.href}
                className="group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E5E1D6] bg-white p-5 sm:p-7 shadow-xs transition-all duration-200 hover:border-[#D5D0C2] hover:shadow-md hover:-translate-y-0.5"
                style={{ width: 'calc(100vw / 3 - 16px)', minWidth: '320px', maxWidth: '460px', height: '62vh', minHeight: '500px' }}
              >
                {/* 1. Center Visual Art / Media Frame */}
                <div className="flex-1 w-full flex items-center justify-center p-2 sm:p-4">
                  <div className={`relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-xl sm:rounded-2xl ${card.previewBg} overflow-hidden border border-black/8 group-hover:scale-[1.02] transition-transform duration-300`}>
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-md bg-white/95 shadow-xs text-[11px] font-bold text-[#171A18] tracking-tight border border-black/10">
                      {card.badge}
                    </span>
                  </div>
                </div>

                {/* 2. Bottom Meta Strip: Circular Brand Icon + Feature Title + Subtitle */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-[#E5E1D6]/70">
                  <div className="w-10 h-10 rounded-xl bg-[#171A18] overflow-hidden shrink-0 border border-black/10 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="EaseHub"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-xs font-black text-[#EECA3A]">EH</span>';
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-[#171A18] tracking-tight truncate leading-snug group-hover:text-[#225944] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#7A7A73] font-medium leading-none mt-0.5">
                      {card.creator}
                    </p>
                  </div>
                </div>
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
          {/* CARD 1: STAYS */}
          <div className="sticky top-0 h-screen flex items-center justify-center" style={{ zIndex: 10 }}>
            <div className="relative w-full h-[560px] sm:h-[580px] rounded-2xl sm:rounded-3xl border border-[#E5E1D6] bg-white p-5 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-block rounded-md bg-[#225944]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#225944] mb-3">
                  Stays
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171A18]">
                  Find your place near campus
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#6B6B63] leading-relaxed">
                  Compare rooms, amenities, and rent before you book a visit.
                </p>
              </div>

              <div className="my-4 overflow-hidden rounded-2xl bg-[#F7F5EF]">
                {featuredStay?.images?.[0] ? (
                  <img src={featuredStay.images[0]} alt={featuredStay.name} className="h-40 sm:h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-40 sm:h-48 items-center justify-center bg-[#E9EEE8] text-[#225944]">
                    <Building2 className="h-12 w-12" strokeWidth={1.4} />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-bold text-[#171A18]">{featuredStay?.name || 'Explore stays around campus'}</h4>
                    <p className="mt-1 truncate text-xs text-[#6B6B63]">{featuredStay?.corridor || featuredStay?.location?.city || 'Browse rooms by location'}</p>
                  </div>
                  {formatPrice(featuredStay?.monthlyRent) && (
                    <p className="shrink-0 text-sm font-extrabold text-[#225944]">
                      {formatPrice(featuredStay?.monthlyRent)}<span className="font-medium text-[#6B6B63]"> / mo</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B6B63] pt-2 border-t border-[#E5E1D6]/60">
                <span>01 / 04</span>
                <Link to="/pg" className="inline-flex items-center gap-1.5 font-bold text-[#225944] hover:underline">Browse stays <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </div>
          </div>

          {/* Screen Lock Pause after Card 1 */}
          <div className="h-[30vh] pointer-events-none" />

          {(serviceSettings?.old_meals_enabled || serviceSettings?.new_meals_enabled) && <>
          {/* CARD 2: MEALS */}
          <div className="sticky top-0 h-screen flex items-center justify-center" style={{ zIndex: 20 }}>
            <div className="relative w-full h-[560px] sm:h-[580px] rounded-2xl sm:rounded-3xl border border-[#E5E1D6] bg-[#F4F0E7] p-5 sm:p-8 shadow-sm flex flex-col justify-between text-[#171A18]">
              <div>
                <span className="inline-block rounded-md bg-[#EECA3A]/35 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#171A18] mb-3">
                  Meals &amp; mess
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171A18]">
                  Good food, on your schedule
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#6B6B63] leading-relaxed">
                  Find nearby kitchens, check their menus, and choose a plan that works for you.
                </p>
              </div>

              <div className="my-4 overflow-hidden rounded-2xl bg-white">
                {featuredMeal?.image ? (
                  <img src={featuredMeal.image} alt={featuredMeal.name} className="h-36 sm:h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-36 sm:h-40 items-center justify-center bg-[#F8EBC2] text-[#725D18]">
                    <Utensils className="h-12 w-12" strokeWidth={1.4} />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="truncate text-base font-bold">{featuredMeal?.name || 'Explore meal plans'}</h4>
                    {formatPrice(featuredMeal?.monthlyPrice) && <span className="shrink-0 text-sm font-bold text-[#225944]">{formatPrice(featuredMeal?.monthlyPrice)} / mo</span>}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#E5E1D6] pt-3 text-[11px]">
                    {[
                      ['Breakfast', featuredMeal?.breakfastMenu],
                      ['Lunch', featuredMeal?.lunchMenu],
                      ['Dinner', featuredMeal?.dinnerMenu],
                    ].map(([meal, menu]) => (
                      <div key={meal} className="min-w-0">
                        <p className="font-bold text-[#225944]">{meal}</p>
                        <p className="mt-1 truncate text-[#6B6B63]">{menu && menu !== '—' ? menu : 'Menu details'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B6B63] pt-2 border-t border-[#E5E1D6]">
                <span>02 / 04</span>
                <Link to="/meals" className="inline-flex items-center gap-1.5 font-bold text-[#225944] hover:underline">See meal plans <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </div>
          </div>

          {/* Screen Lock Pause after Card 2 */}
          <div className="h-[30vh] pointer-events-none" />
          </>}

          {(serviceSettings?.old_laundry_enabled || serviceSettings?.new_laundry_enabled) && <>
          {/* CARD 3: LAUNDRY */}
          <div className="sticky top-0 h-screen flex items-center justify-center" style={{ zIndex: 30 }}>
            <div className="relative w-full h-[560px] sm:h-[580px] rounded-2xl sm:rounded-3xl border border-[#DCE5DE] bg-[#EAF0EB] p-5 sm:p-8 shadow-sm flex flex-col justify-between text-[#171A18]">
              <div>
                <span className="inline-block rounded-md bg-[#225944] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white mb-3">
                  Laundry
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171A18]">
                  Laundry, without losing a day
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#6B6B63] leading-relaxed">
                  Find a local laundry, check the services and pricing, then arrange pickup.
                </p>
              </div>

              <div className="my-4 overflow-hidden rounded-2xl bg-white">
                {featuredLaundry?.image ? (
                  <img src={featuredLaundry.image} alt={featuredLaundry.name} className="h-40 sm:h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-40 sm:h-48 items-center justify-center bg-[#DCE8DF] text-[#225944]">
                    <Shirt className="h-12 w-12" strokeWidth={1.4} />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-base font-bold">{featuredLaundry?.name || 'Find a laundry nearby'}</h4>
                      <p className="mt-1 truncate text-xs text-[#6B6B63]">{featuredLaundry?.corridor || 'Pickup options vary by provider'}</p>
                    </div>
                    {formatPrice(featuredLaundry?.pricePerKg) && <p className="shrink-0 text-sm font-bold text-[#225944]">{formatPrice(featuredLaundry?.pricePerKg)} / kg</p>}
                  </div>
                  {featuredLaundry?.services?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {featuredLaundry.services.slice(0, 3).map((service) => (
                        <span key={service.name} className="rounded-full border border-[#DCE5DE] px-3 py-1 text-[11px] font-semibold text-[#225944]">{service.name}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 border-t border-[#E5E1D6] pt-3 text-xs text-[#6B6B63]">Wash, fold, and ironing options on the provider page.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#171A18]/70 pt-2 border-t border-[#171A18]/10">
                <span>03 / 04</span>
                <Link to="/laundry" className="inline-flex items-center gap-1.5 font-bold text-[#225944] hover:underline">Find laundry <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </div>
          </div>

          {/* Screen Lock Pause after Card 3 */}
          <div className="h-[30vh] pointer-events-none" />
          </>}

          {serviceSettings?.extra_services_enabled && <>
          {/* CARD 4: EVERYDAY SERVICES */}
          <div className="sticky top-0 h-screen flex items-center justify-center" style={{ zIndex: 40 }}>
            <div className="relative w-full h-[560px] sm:h-[580px] rounded-2xl sm:rounded-3xl border border-[#184232] bg-[#225944] p-5 sm:p-8 shadow-sm flex flex-col justify-between text-white">
              <div>
                <span className="inline-block rounded-md bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white mb-3">
                  Everyday help
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Get the little things fixed
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-white/70 leading-relaxed">
                  Find help for room repairs, cleaning, and other everyday needs around your campus.
                </p>
              </div>

              <div className="my-4 rounded-2xl bg-[#184232] p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <Wrench className="h-9 w-9 text-[#EECA3A]" strokeWidth={1.4} />
                  <p className="max-w-[190px] text-right text-xs leading-relaxed text-white/70">Local providers for the jobs you don’t want to put off.</p>
                </div>
                <div className="space-y-0">
                  {(featuredService
                    ? [featuredService, ...extraServices.slice(1, 3)].map((service) => service.name)
                    : ['Repairs & electrical', 'Room cleaning', 'Campus moving help']
                  ).map((serviceName) => (
                    <div key={serviceName} className="flex items-center justify-between border-t border-white/15 py-3 text-sm font-semibold">
                      <span>{serviceName}</span>
                      <ArrowRight className="h-4 w-4 text-[#EECA3A]" />
                    </div>
                  ))}
                </div>
                {featuredService && formatPrice(featuredService.basePrice) && (
                  <p className="mt-2 text-xs text-white/70">From {formatPrice(featuredService.basePrice)} {featuredService.priceUnit}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/10">
                <span>04 / 04</span>
                <Link to="/services" className="font-bold text-[#EECA3A] hover:underline inline-flex items-center gap-1.5">
                  Browse services <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Screen Lock Pause after Card 4 */}
          <div className="h-[38vh] pointer-events-none" />
          </>}
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
