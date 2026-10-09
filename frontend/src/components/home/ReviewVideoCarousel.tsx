import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, CheckCircle, X, Volume2, VolumeX } from 'lucide-react';
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
  /** Optional: real video URL (mp4, YouTube embed, etc.) */
  videoUrl?: string;
  /** Optional: thumbnail image URL */
  thumbnailUrl?: string;
};

/* ─────────────────────────────────────────────────────── */
/* STATIC REVIEW DATA (with placeholder video slots)       */
/* ─────────────────────────────────────────────────────── */

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
    videoUrl: '',   // ← paste real video URL here when available
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
    videoUrl: '',
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
    videoUrl: '',
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
    videoUrl: '',
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
    videoUrl: '',
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
    videoUrl: '',
  },
  {
    id: 'review-7',
    studentName: 'Kunal Dewangan',
    college: 'CSIT Durg • IT 1st Year',
    duration: '0:45',
    badgeTitle: 'Walking distance from campus',
    reviewQuote:
      "The proximity radar is awesome. Filtered stays under 400m from college gate. I walk to class in 5 minutes and don't need auto fare every day.",
    cardBg: 'bg-[#E2ECE5]',
    textColor: 'text-[#171A18]',
    subColor: 'text-[#55554E]',
    badgeBg: 'bg-white',
    badgeTextColor: 'text-[#225944]',
    tag: '📍 Hyperlocal',
    city: 'Durg',
    accentIcon: '🚶',
    videoUrl: '',
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
    videoUrl: '',
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
    videoUrl: '',
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
    videoUrl: '',
  },
];

/* ─────────────────────────────────────────────────────── */
/* VIDEO MODAL                                             */
/* ─────────────────────────────────────────────────────── */

interface VideoModalProps {
  card: ReviewVideoCard;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ card, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Auto-play when modal opens
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const isYouTube = card.videoUrl && (card.videoUrl.includes('youtube.com') || card.videoUrl.includes('youtu.be'));
  const isVimeo   = card.videoUrl && card.videoUrl.includes('vimeo.com');

  const getEmbedUrl = () => {
    if (!card.videoUrl) return '';
    if (isYouTube) {
      const match = card.videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
      const id = match ? match[1] : '';
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    }
    if (isVimeo) {
      const match = card.videoUrl.match(/vimeo\.com\/(\d+)/);
      const id = match ? match[1] : '';
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return '';
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); setPlaying(true); }
    else { vid.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setMuted(vid.muted);
  };

  const isEmbed = isYouTube || isVimeo;
  const hasVideo = !!card.videoUrl;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(12px)',
        animation: 'ehFadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          background: '#171A18',
          borderRadius: '20px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'ehSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close video"
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
        >
          <X size={18} />
        </button>

        {/* Video area */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', flexShrink: 0 }}>
          {hasVideo && isEmbed ? (
            <iframe
              src={getEmbedUrl()}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              title={`${card.studentName} review`}
            />
          ) : hasVideo && !isEmbed ? (
            <>
              <video
                ref={videoRef}
                src={card.videoUrl}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                playsInline
                onClick={togglePlay}
              />
              {/* Controls overlay */}
              {!playing && (
                <div
                  style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                  onClick={togglePlay}
                >
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={30} style={{ fill: '#171A18', color: '#171A18', marginLeft: 4 }} />
                  </div>
                </div>
              )}
              {/* Mute toggle */}
              <button
                onClick={toggleMute}
                style={{
                  position: 'absolute', bottom: 12, right: 12,
                  background: 'rgba(0,0,0,0.6)', border: 'none',
                  borderRadius: '999px', padding: '6px 12px',
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                {muted ? 'Unmute' : 'Mute'}
              </button>
            </>
          ) : (
            /* No video yet — placeholder state */
            <div style={{
              width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              background: 'linear-gradient(135deg,#1b4835,#225944)',
            }}>
              <div style={{ fontSize: '3rem' }}>{card.accentIcon}</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', maxWidth: '260px', lineHeight: 1.5 }}>
                Video coming soon — review from {card.studentName}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                Upload via Admin Panel → Reviews
              </span>
            </div>
          )}
        </div>

        {/* Info strip below video */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#225944', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
              {card.studentName.charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '0.88rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {card.studentName}
                <CheckCircle size={14} style={{ color: '#4F7A65' }} />
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', margin: 0 }}>{card.college}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <Star size={13} style={{ fill: '#EECA3A', color: '#EECA3A' }} />
            <span style={{ color: '#EECA3A', fontWeight: 800, fontSize: '0.82rem' }}>5.0</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginLeft: '0.3rem' }}>{card.city}</span>
          </div>
        </div>

        {/* Quote */}
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>
            "{card.reviewQuote}"
          </p>
        </div>
      </div>

      <style>{`
        @keyframes ehFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes ehSlideUp { from { transform:translateY(30px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/* MAIN CAROUSEL                                           */
/* ─────────────────────────────────────────────────────── */

export const ReviewVideoCarousel: React.FC = () => {
  const reelRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<ReviewVideoCard[]>(REVIEW_CARDS);
  const [activeCard, setActiveCard] = useState<ReviewVideoCard | null>(null);

  useEffect(() => {
    reviewApi.getReviews().then((dbReviews) => {
      if (Array.isArray(dbReviews) && dbReviews.length > 0) {
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
            videoUrl: r.videoUrl || r.video_url || fallback.videoUrl || '',
            thumbnailUrl: r.thumbnailUrl || r.thumbnail_url || '',
          };
        });
        if (dynamicCards.length < 10) {
          const needed = 10 - dynamicCards.length;
          setCards([...dynamicCards, ...REVIEW_CARDS.slice(0, needed)]);
        } else {
          setCards(dynamicCards);
        }
      }
    }).catch(() => { /* Keep static cards */ });
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (reelRef.current) {
      reelRef.current.scrollBy({ left: direction === 'left' ? -560 : 560, behavior: 'smooth' });
    }
  }, []);

  const openCard = useCallback((card: ReviewVideoCard) => {
    setActiveCard(card);
  }, []);

  const closeModal = useCallback(() => {
    setActiveCard(null);
  }, []);

  return (
    <>
      <section className="relative w-full bg-[#F7F5EF] py-16 sm:py-24 overflow-hidden">
        {/* Section Heading */}
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

            {/* Navigation arrows */}
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

        {/* Carousel */}
        <div
          ref={reelRef}
          className="w-full flex gap-6 sm:gap-8 overflow-x-auto scrollbar-none px-6 sm:px-12 lg:px-20 pb-8 pt-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className={`shrink-0 w-[88vw] sm:w-[440px] md:w-[480px] h-[540px] sm:h-[600px] md:h-[630px] rounded-2xl sm:rounded-3xl border border-black/10 ${card.cardBg} p-6 sm:p-8 flex flex-col justify-between shadow-xs snap-start transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              {/* Media / Video Showcase Box */}
              <div className="relative w-full h-[300px] sm:h-[350px] md:h-[370px] rounded-xl sm:rounded-2xl overflow-hidden bg-white p-4 sm:p-5 shadow-2xs border border-black/10 flex flex-col justify-between">

                {/* Top status bar */}
                <div className="flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-black/80 px-2.5 py-1 text-xs font-bold text-white">
                    <Play className="h-3 w-3 fill-white" /> {card.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#EECA3A]/25 px-2.5 py-1 text-xs font-bold text-[#171A18] border border-[#EECA3A]/40">
                    <Star className="h-3 w-3 fill-[#EECA3A] text-[#EECA3A]" /> 5.0
                  </span>
                </div>

                {/* Thumbnail (if available) */}
                {card.thumbnailUrl && (
                  <img
                    src={card.thumbnailUrl}
                    alt={`${card.studentName} review thumbnail`}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
                  />
                )}

                {/* Centre Play Button — opens modal */}
                <div className="absolute inset-0 grid place-items-center">
                  <button
                    onClick={() => openCard(card)}
                    aria-label={`Play ${card.studentName}'s review`}
                    style={{ cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }}
                    className="group/play"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/85 flex items-center justify-center text-white shadow-md transition-all duration-200 group-hover/play:scale-110 group-hover/play:bg-[#225944]">
                      <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-white ml-0.5" />
                    </div>
                  </button>
                </div>

                {/* Student profile strip */}
                <div className="relative z-10 flex items-center justify-between pt-3 border-t border-black/5 bg-white -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 px-4 sm:px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#171A18] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {card.studentName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#171A18] truncate flex items-center gap-1.5">
                        {card.studentName}
                        <CheckCircle className="h-3.5 w-3.5 text-[#225944] shrink-0" />
                      </p>
                      <p className="text-[11px] text-[#6B6B63] truncate">{card.college}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#225944] bg-[#225944]/10 px-2 py-0.5 rounded-md shrink-0 border border-[#225944]/15">
                    {card.city}
                  </span>
                </div>
              </div>

              {/* Bottom Content */}
              <div className="mt-4">
                <span
                  className={`inline-block ${card.badgeBg} ${card.badgeTextColor} px-3 py-1.5 rounded-lg font-bold text-sm sm:text-base border border-black/10 tracking-tight shadow-2xs`}
                >
                  {card.badgeTitle}
                </span>
                <p className={`mt-2.5 text-xs sm:text-sm leading-relaxed ${card.subColor} line-clamp-3 sm:line-clamp-4 font-normal`}>
                  {card.reviewQuote}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile scroll hint */}
        <p className="sm:hidden text-center text-[11px] text-[#6B6B63] mt-2">
          Swipe to see more reviews →
        </p>
      </section>

      {/* Video Modal */}
      {activeCard && <VideoModal card={activeCard} onClose={closeModal} />}
    </>
  );
};

export default ReviewVideoCarousel;
