import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, CheckCircle } from 'lucide-react';
import { reviewApi } from '../../services/reviewApi';

export type ReviewVideoCard = {
  id: string;
  studentName: string;
  college: string;
  duration: string;
  badgeTitle: string;
  reviewQuote: string;
  cardBg: string;
  textColor: string;
  subColor: string;
  badgeBg: string;
  badgeTextColor: string;
  tag: string;
  city: string;
  accentIcon: string;
};

const REVIEW_CARDS: ReviewVideoCard[] = [
  {
    id: 'review-1',
    studentName: 'Aman Verma',
    college: 'BIT Durg • CSE 2nd Year',
    duration: '0:48',
    badgeTitle: 'Found my stay in 15 mins',
    reviewQuote:
      'EaseHub verified the PG owner, booked my single room 400m from BIT Gate 2, and waived all brokerage fees. Smoothest college move ever.',
    cardBg: 'bg-[#9D76F7]',
    textColor: 'text-white',
    subColor: 'text-white/90',
    badgeBg: 'bg-white',
    badgeTextColor: 'text-[#171A18]',
    tag: '🛏️ Verified PG',
    city: 'Durg',
    accentIcon: '🏠',
  },
  {
    id: 'review-2',
    studentName: 'Sneha Agrawal',
    college: 'NIT Raipur • Architecture',
    duration: '0:55',
    badgeTitle: 'Food arrives hot everyday',
    reviewQuote:
      'Subscribed to Maa Annapurna mess on EaseHub. The daily 2-meal plan reaches my hostel gate right on time, and I pause billing during semester breaks.',
    cardBg: 'bg-[#F0EDE6]',
    textColor: 'text-[#171A18]',
    subColor: 'text-[#55554E]',
    badgeBg: 'bg-white',
    badgeTextColor: 'text-[#171A18]',
    tag: '🍲 Daily Mess',
    city: 'Raipur',
    accentIcon: '🍛',
  },
  {
    id: 'review-3',
    studentName: 'Rohan Sharma',
    college: 'Rungta College • ECE 3rd Year',
    duration: '0:42',
    badgeTitle: 'Laundry picked from hostel door',
    reviewQuote:
      'Bag picked up Thursday evening from my room, returned clean, ironed, and folded on Saturday morning. Saves me 4 hours every single weekend.',
    cardBg: 'bg-[#E0F2FE]',
    textColor: 'text-[#171A18]',
    subColor: 'text-[#55554E]',
    badgeBg: 'bg-[#171A18]',
    badgeTextColor: 'text-white',
    tag: '🧺 Express Wash',
    city: 'Bhilai',
    accentIcon: '👕',
  },
  {
    id: 'review-4',
    studentName: 'Priya Patel',
    college: 'AIIMS Raipur • MBBS 2nd Year',
    duration: '1:12',
    badgeTitle: '100% verified, zero brokerage',
    reviewQuote:
      'Moving from Bilaspur as a girl, safety was everything. EaseHub showed 360° verified photos, biometric security, and connected me directly with the owner.',
    cardBg: 'bg-[#225944]',
    textColor: 'text-white',
    subColor: 'text-white/90',
    badgeBg: 'bg-[#EECA3A]',
    badgeTextColor: 'text-[#171A18]',
    tag: '🛡️ Safe Stays',
    city: 'Raipur',
    accentIcon: '🔒',
  },
  {
    id: 'review-5',
    studentName: 'Devendra Sahu',
    college: 'CCET Bhilai • Civil 3rd Year',
    duration: '0:38',
    badgeTitle: 'Vacation pause saved me ₹2,800',
    reviewQuote:
      'Went home for Diwali holidays for 18 days. One tap paused my tiffin billing and mess subscription. Saved genuine money without arguing with anyone.',
    cardBg: 'bg-[#EECA3A]',
    textColor: 'text-[#171A18]',
    subColor: 'text-[#171A18]/85',
    badgeBg: 'bg-[#171A18]',
    badgeTextColor: 'text-white',
    tag: '⚡ Smart Pause',
    city: 'Bhilai',
    accentIcon: '💰',
  },
  {
    id: 'review-6',
    studentName: 'Ananya Mishra',
    college: 'IIT Bhilai • Data Science',
    duration: '0:50',
    badgeTitle: 'One dashboard for everything',
    reviewQuote:
      'My stay rent, daily food subscription, and laundry schedule are all in one clean place. No scattered WhatsApp groups or missed cash payments.',
    cardBg: 'bg-[#171A18]',
    textColor: 'text-white',
    subColor: 'text-white/80',
    badgeBg: 'bg-[#225944]',
    badgeTextColor: 'text-white',
    tag: '📱 All-in-One',
    city: 'Bhilai',
    accentIcon: '⚡',
  },
  {
    id: 'review-7',
    studentName: 'Kunal Dewangan',
    college: 'CSIT Durg • IT 1st Year',
    duration: '0:45',
    badgeTitle: 'Walking distance from campus',
    reviewQuote:
      'The proximity radar is awesome. Filtered stays under 400m from college gate. I walk to class in 5 minutes and don\'t need auto fare every day.',
    cardBg: 'bg-[#E2ECE5]',
    textColor: 'text-[#171A18]',
    subColor: 'text-[#55554E]',
    badgeBg: 'bg-white',
    badgeTextColor: 'text-[#225944]',
    tag: '📍 Hyperlocal',
    city: 'Durg',
    accentIcon: '🚶',
  },
  {
    id: 'review-8',
    studentName: 'Muskan Soni',
    college: 'Shankaracharya • B.Tech CS',
    duration: '1:05',
    badgeTitle: 'Clean rooms & pure veg meals',
    reviewQuote:
      'Switched to EaseHub after poor food at my previous hostel. Food quality is genuinely homely, clean RO water, and very hygienic kitchens.',
    cardBg: 'bg-[#FFE4E6]',
    textColor: 'text-[#171A18]',
    subColor: 'text-[#55554E]',
    badgeBg: 'bg-white',
    badgeTextColor: 'text-[#E11D48]',
    tag: '🥗 Homely Food',
    city: 'Bhilai',
    accentIcon: '🍲',
  },
  {
    id: 'review-9',
    studentName: 'Tushar Jain',
    college: 'Rungta R1 • Mechanical',
    duration: '0:35',
    badgeTitle: 'Electrician arrived in 30 mins',
    reviewQuote:
      'My room study light and cooler switch stopped working right before semester exams. Booked quick repair on EaseHub — technician arrived in 30 minutes.',
    cardBg: 'bg-[#FEF3C7]',
    textColor: 'text-[#171A18]',
    subColor: 'text-[#55554E]',
    badgeBg: 'bg-white',
    badgeTextColor: 'text-[#B45309]',
    tag: '🔧 Quick Repair',
    city: 'Bhilai',
    accentIcon: '🛠️',
  },
  {
    id: 'review-10',
    studentName: 'Shreya Gupta',
    college: 'BIT Durg • MBA',
    duration: '0:58',
    badgeTitle: 'Best student support in town',
    reviewQuote:
      'Had an issue with room deposit refund. EaseHub student support team stepped in and resolved it with the owner within 24 hours. Incredible backing.',
    cardBg: 'bg-[#184232]',
    textColor: 'text-white',
    subColor: 'text-white/85',
    badgeBg: 'bg-[#EECA3A]',
    badgeTextColor: 'text-[#171A18]',
    tag: '🤝 24/7 Support',
    city: 'Durg',
    accentIcon: '⭐',
  },
];

export const ReviewVideoCarousel: React.FC = () => {
  const reelRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<ReviewVideoCard[]>(REVIEW_CARDS);

  useEffect(() => {
    reviewApi.getReviews().then((dbReviews) => {
      if (Array.isArray(dbReviews) && dbReviews.length > 0) {
        // Map backend reviews to carousel format while merging with template cards
        const dynamicCards: ReviewVideoCard[] = dbReviews.map((r: any, idx: number) => {
          const fallback = REVIEW_CARDS[idx % REVIEW_CARDS.length];
          return {
            id: r.id || r._id || `review-${idx}`,
            studentName: r.userName || fallback.studentName,
            college: r.college || fallback.college,
            duration: r.videoDuration || fallback.duration,
            badgeTitle: r.badgeTitle || fallback.badgeTitle,
            reviewQuote: r.reviewQuote || r.comment || fallback.reviewQuote,
            cardBg: r.cardBg || fallback.cardBg,
            textColor: fallback.textColor,
            subColor: fallback.subColor,
            badgeBg: fallback.badgeBg,
            badgeTextColor: fallback.badgeTextColor,
            tag: r.tag || fallback.tag,
            city: r.city || fallback.city,
            accentIcon: fallback.accentIcon,
          };
        });

        // Ensure at least 10 cards displayed
        if (dynamicCards.length < 10) {
          const needed = 10 - dynamicCards.length;
          const merged = [...dynamicCards, ...REVIEW_CARDS.slice(0, needed)];
          setCards(merged);
        } else {
          setCards(dynamicCards);
        }
      }
    }).catch(() => {
      // Keep initial 10 cards on any network error
    });
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (reelRef.current) {
      const scrollAmount = direction === 'left' ? -560 : 560;
      reelRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-[#F7F5EF] py-16 sm:py-24 overflow-hidden">
      {/* Section Heading — Full Screen Padding */}
      <div className="w-full px-6 sm:px-12 lg:px-20 mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="inline-block rounded-full bg-[#EAE7DC] px-4 py-1.5 text-xs sm:text-[13px] font-semibold text-[#171A18]">
              Student Video Reviews
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] text-[#171A18] leading-[1.06]">
              Real students.<br />Real experiences.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#6B6B63] max-w-xl">
              10 authentic video stories from students across Bhilai, Raipur, and Durg finding verified stays, tiffins, and everyday campus support.
            </p>
          </div>

          {/* Top-Right Navigation Arrows (Jitter Style) */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-[#E5E1D6] bg-white flex items-center justify-center text-[#171A18] hover:bg-black/5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-[#E5E1D6] bg-white flex items-center justify-center text-[#171A18] hover:bg-black/5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Bleed Edge-to-Edge 10-Card Carousel (Jitter Full-Screen Layout) */}
      <div
        ref={reelRef}
        className="w-full flex gap-6 sm:gap-8 overflow-x-auto scrollbar-none px-6 sm:px-12 lg:px-20 pb-8 pt-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className={`shrink-0 w-[88vw] sm:w-[460px] md:w-[520px] h-[580px] sm:h-[640px] md:h-[680px] rounded-[36px] sm:rounded-[44px] ${card.cardBg} p-7 sm:p-9 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.08)] snap-start transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.14)]`}
          >
            {/* Top Media / Video Showcase Box (Large Full-Screen Proportion) */}
            <div className="relative w-full h-[320px] sm:h-[370px] md:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden bg-white/95 p-5 shadow-sm border border-black/5 flex flex-col justify-between">
              {/* Video Top Status Bar */}
              <div className="flex items-center justify-between z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                  <Play className="h-3.5 w-3.5 fill-white" /> {card.duration}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#EECA3A]/30 px-3 py-1.5 text-xs font-bold text-[#171A18]">
                  <Star className="h-3.5 w-3.5 fill-[#EECA3A] text-[#EECA3A]" /> 5.0
                </span>
              </div>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 grid place-items-center">
                <div className="group/play cursor-pointer">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/85 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover/play:scale-115 group-hover/play:bg-[#225944]">
                    <Play className="h-7 w-7 sm:h-9 sm:w-9 fill-white ml-1" />
                  </div>
                </div>
              </div>

              {/* Bottom Student Profile Strip inside Media Box */}
              <div className="relative z-10 flex items-center justify-between pt-3 border-t border-black/5 bg-white/80 backdrop-blur-xs -mx-5 -mb-5 px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#171A18] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {card.studentName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#171A18] truncate flex items-center gap-1.5">
                      {card.studentName}
                      <CheckCircle className="h-3.5 w-3.5 text-[#225944] shrink-0" />
                    </p>
                    <p className="text-xs text-[#6B6B63] truncate">{card.college}</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#225944] bg-[#225944]/10 px-2.5 py-1 rounded-full shrink-0">
                  {card.city}
                </span>
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="mt-5">
              <span
                className={`inline-block ${card.badgeBg} ${card.badgeTextColor} px-4 py-2 rounded-xl font-bold text-base sm:text-lg shadow-2xs tracking-tight`}
              >
                {card.badgeTitle}
              </span>
              <p className={`mt-3.5 text-sm sm:text-base leading-relaxed ${card.subColor} line-clamp-3 sm:line-clamp-4`}>
                {card.reviewQuote}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewVideoCarousel;
