import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Building2,
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
import PlaceholderImage from '../../components/common/PlaceholderImage';
import { AnimatedCityFooter } from '../../components/home/AnimatedCityFooter';
import { TemplateMotionHero } from '../../components/home/TemplateMotionHero';

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

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

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
    <div className="min-h-screen overflow-hidden bg-[#F7F5EF] font-sans text-[#171A18] antialiased selection:bg-[#EECA3A] selection:text-[#171A18]">
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

        {/* Scroll cue pinned to bottom */}
        <a
          href="#campus-services"
          className="relative z-10 mb-8 inline-flex items-center gap-2 text-xs font-bold text-[#6B6B63] transition-colors hover:text-[#225944]"
        >
          Discover your campus essentials
          <ArrowDown className="h-3.5 w-3.5" />
        </a>
      </section>


      <section id="campus-services" className="border-y border-[#E5E1D6] bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={reveal}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: reduceMotion ? 0 : 0.55 }}
            className="mx-auto mb-8 max-w-2xl text-center"
          >
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#4F7A65]">The EaseHub essentials</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#171A18] sm:text-4xl">Settle in. We’ll help with the rest.</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B6B63] sm:text-base">Everything you need to make a new campus feel like home.</p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.1 } } }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {categories.map(({ title, description, href, icon: Icon, accent, iconColor }, index) => (
              <motion.div
                key={href}
                variants={reveal}
                transition={{ duration: reduceMotion ? 0 : 0.5 }}
                whileHover={reduceMotion ? undefined : { y: -7 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                <Link to={href} className="group flex h-full min-h-48 flex-col rounded-2xl border border-[#E5E1D6] bg-white p-5 shadow-[0_8px_30px_rgba(23,26,24,0.04)] transition-shadow hover:shadow-[0_18px_45px_rgba(34,89,68,0.12)] sm:p-6">
                  <span className={`grid h-12 w-12 place-items-center rounded-xl ${accent} ${iconColor} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="mt-5 flex items-center justify-between gap-2 text-lg font-extrabold text-[#171A18]">
                    {title}
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#4F7A65] transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="mt-1 text-sm leading-relaxed text-[#6B6B63]">{description}</span>
                  <span className="mt-auto pt-4 text-[11px] font-bold uppercase tracking-wider text-[#4F7A65]">
                    {loading ? 'Explore nearby' : serviceCounts[index] > 0 ? `${serviceCounts[index]} featured options` : 'Explore options'}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#F7F5EF] py-14 sm:py-20">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#EECA3A]/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: reduceMotion ? 0 : 0.6 }}
            className="lg:col-span-5"
          >
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#4F7A65]">A smoother start</span>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#171A18] sm:text-4xl">Less searching.<br /><span className="text-[#225944]">More settling in.</span></h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#6B6B63] sm:text-base">Browse nearby options, compare what works for you, and find the everyday support that makes campus life easier.</p>
            <Link to="/pg" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#225944] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#184232]">
              Find your place
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: reduceMotion ? 0 : 0.65 }}
            className="grid gap-4 sm:grid-cols-2 lg:col-span-7"
          >
            {[
              { icon: ShieldCheck, title: 'A little more peace of mind', description: 'Clear details help you choose what fits your routine.', color: 'bg-[#225944]/10 text-[#225944]' },
              { icon: MapPin, title: 'Close to your campus', description: 'Explore services around Bhilai, Raipur and Durg.', color: 'bg-[#EECA3A]/25 text-[#171A18]' },
              { icon: Star, title: 'One easy starting point', description: 'Stay, meals and everyday help are all a few clicks away.', color: 'bg-[#4F7A65]/15 text-[#225944]' },
              { icon: Sparkles, title: 'Make it your own', description: 'Choose the services that make your day work better.', color: 'bg-[#FFF9E6] text-[#6B6B63]' },
            ].map(({ icon: Icon, title, description, color }, index) => (
              <motion.div
                key={title}
                whileHover={reduceMotion ? undefined : { y: -5, rotate: index % 2 === 0 ? -0.4 : 0.4 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-[#E5E1D6] bg-white p-5 shadow-sm sm:p-6"
              >
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-base font-extrabold text-[#171A18]">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#6B6B63]">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-[#E5E1D6] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#4F7A65]">Around your campus</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#171A18] sm:text-4xl">A few good places to start</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#6B6B63]">Explore current stay and meal options, or browse every service.</p>
          </div>

          {loading ? (
            <div className="grid gap-5 pt-7 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => <div key={category.href} className="h-72 animate-pulse rounded-2xl bg-[#F7F5EF]" />)}
            </div>
          ) : featuredItems.length > 0 ? (
            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } } }}
              className="grid gap-5 pt-7 sm:grid-cols-2 lg:grid-cols-4"
            >
              {featuredItems.map(({ id, title, subtitle, tag, href, icon: Icon, kind }) => (
                <motion.article
                  key={id}
                  variants={reveal}
                  transition={{ duration: reduceMotion ? 0 : 0.45 }}
                  whileHover={reduceMotion ? undefined : { y: -5 }}
                  className="overflow-hidden rounded-2xl border border-[#E5E1D6] bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <Link to={href} className="block">
                    <div className="relative grid h-40 place-items-center overflow-hidden bg-[#F7F5EF]">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#225944]/10 via-transparent to-[#EECA3A]/15" />
                      {kind === 'pg' ? <PlaceholderImage type="pg" title={title} /> : kind === 'meal' ? <PlaceholderImage type="meals" title={title} /> : <Icon className="h-12 w-12 text-[#4F7A65]" />}
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#225944]">{tag}</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-extrabold text-[#171A18]">{title}</h3>
                          <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#6B6B63]"><MapPin className="h-3 w-3 shrink-0 text-[#4F7A65]" />{subtitle}</p>
                        </div>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F7F5EF] text-[#225944]"><Icon className="h-4 w-4" /></span>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-[#225944]">Explore <ArrowRight className="h-3.5 w-3.5" /></span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <div className="grid gap-4 pt-7 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map(({ title, description, href, icon: Icon, accent, iconColor }) => (
                <Link key={href} to={href} className="rounded-2xl border border-[#E5E1D6] bg-[#F7F5EF] p-5 transition-transform hover:-translate-y-1">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${accent} ${iconColor}`}><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-extrabold text-[#171A18]">{title}</h3>
                  <p className="mt-1 text-sm text-[#6B6B63]">{description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-[#225944]">Browse <ArrowRight className="h-3.5 w-3.5" /></span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {categories.map(({ title, href }) => <Link key={href} to={href} className="rounded-full border border-[#E5E1D6] bg-[#F7F5EF] px-4 py-2 text-xs font-bold text-[#225944] transition-colors hover:border-[#225944] hover:bg-[#225944] hover:text-white">{title}</Link>)}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#225944] py-14 text-white sm:py-20">
        <motion.div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#EECA3A]/20 blur-3xl" animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#EECA3A]">Your campus chapter starts here</span>
          <h2 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">Find your rhythm.<br />Feel at home.</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">Start with the essentials and make the new place feel like yours.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/pg" className="inline-flex items-center gap-2 rounded-xl bg-[#EECA3A] px-5 py-3 text-sm font-extrabold text-[#171A18] transition-transform hover:-translate-y-0.5">Explore stays <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/services" className="inline-flex items-center gap-2 rounded-xl border border-white/35 px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-white/10">Browse services</Link>
          </div>
        </div>
      </section>

      <AnimatedCityFooter />
    </div>
  );
};

export default TemplateHomePage;
