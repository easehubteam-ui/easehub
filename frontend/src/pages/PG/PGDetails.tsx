import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  ShieldCheck,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageSquare,
  ArrowRight,
  Wifi,
  Bed,
  Utensils,
  Shirt,
  Shield,
  Bike,
  Navigation,
  CheckCircle2,
  Users,
  IndianRupee,
} from 'lucide-react';

import { pgApi, PGProperty } from '../../services/pgApi';
import { savedApi } from '../../services/savedApi';
import { useAuth } from '../../context/AuthContext';
import { BookingModal, BookingModalItem } from '../../components/common/BookingModal';
import { paymentConfig } from '../../config/paymentConfig';
import LocationMap from '../../components/common/LocationMap';
import PlaceholderImage from '../../components/common/PlaceholderImage';
import NotFound from '../NotFound/NotFound';

export const PGDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [pg, setPg] = useState<PGProperty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentImgIdx, setCurrentImgIdx] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingModalItem, setBookingModalItem] = useState<BookingModalItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    pgApi.getById(id)
      .then((data) => {
        if (!isMounted) return;
        setPg(data);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setPg(null);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Check Wishlist status
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && user && id) {
      savedApi.getSavedItems().then((items) => {
        if (!isMounted) return;
        const exists = items.some((item) => item.item_type === 'pg' && item.item_id === id);
        setIsSaved(exists);
      }).catch(() => {
        if (isMounted) setIsSaved(false);
      });
    }
    return () => { isMounted = false; };
  }, [isAuthenticated, user, id]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: `/pg/${id}` } });
      return;
    }

    if (!id || isSaving) return;

    try {
      setIsSaving(true);
      if (isSaved) {
        await savedApi.removeSavedItem('pg', id);
        setIsSaved(false);
      } else {
        await savedApi.saveItem('pg', id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pg?.name || 'EaseHub PG',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleBookNowClick = () => {
    if (!pg || !id) return;
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: `/pg/${id}` } });
      return;
    }

    setBookingModalItem({
      id: pg.id || id,
      name: pg.name,
      type: 'PG',
      price: pg.monthlyRent,
      location: pg.location.address || pg.corridor || 'Bhilai, Chhattisgarh',
      images: pg.images,
      amenities: pg.amenities,
    });
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="h-6 w-64 bg-[#E5E1D6] rounded-md animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-[420px] bg-[#E5E1D6] rounded-3xl animate-pulse"></div>
          <div className="lg:col-span-5 h-[420px] bg-white border border-[#E5E1D6] rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="h-8 w-3/4 bg-[#E5E1D6] rounded-md"></div>
            <div className="h-4 w-1/2 bg-[#E5E1D6] rounded-md"></div>
            <div className="h-10 w-full bg-[#E5E1D6] rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pg) {
    return (
      <NotFound
        title="PG Property Not Found"
        message="The accommodation listing you are looking for does not exist or may have been unlisted."
      />
    );
  }

  const imagesList = pg.images && pg.images.length > 0 ? pg.images : [];
  const currentImage = imagesList[currentImgIdx] || null;

  const whatsappPhone = pg.landlordPhone && pg.landlordPhone !== '—' ? pg.landlordPhone.replace(/\D/g, '') : '916201614778';
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Hello, I am interested in booking ${pg.name} on EaseHub.`)}`;

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] font-sans antialiased pb-16">
      
      {/* Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        
        {/* 1. Breadcrumb Trail */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#6B6B63] overflow-x-auto py-1">
          <Link to="/" className="hover:text-[#225944] transition-colors shrink-0">Home</Link>
          <span>›</span>
          <Link to="/pg" className="hover:text-[#225944] transition-colors shrink-0">PG / Hostels</Link>
          <span>›</span>
          <span className="text-[#171A18] font-extrabold truncate">{pg.name}</span>
        </nav>

        {/* 2. Top Master Grid (Left Gallery 7 cols, Right Property Card 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Image Gallery */}
          <div className="lg:col-span-7 space-y-3">
            {/* Main Stage Image */}
            <div className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] rounded-3xl overflow-hidden shadow-xs bg-[#FAF9F5] border border-[#E5E1D6] group">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={`${pg.name} view ${currentImgIdx + 1}`}
                  className="w-full h-full object-cover select-none transition-all duration-300"
                />
              ) : (
                <PlaceholderImage type="pg" title={pg.name} />
              )}

              {/* Prev / Next Arrows */}
              {imagesList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentImgIdx((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all shadow-md z-10"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentImgIdx((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all shadow-md z-10"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Top-Right Action Badges (Wishlist & Share) */}
              <div className="absolute top-4 right-4 flex items-center gap-2.5 z-10">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  disabled={isSaving}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#171A18] flex items-center justify-center shadow-md transition-transform active:scale-95"
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-[#171A18]'}`} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#171A18] flex items-center justify-center shadow-md transition-transform active:scale-95 relative"
                  title="Share Property"
                >
                  <Share2 className="w-5 h-5" />
                  {shareCopied && (
                    <span className="absolute -bottom-8 right-0 bg-[#171A18] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                      Link Copied!
                    </span>
                  )}
                </button>
              </div>

              {/* Bottom-Right Image Counter Badge */}
              {imagesList.length > 0 && (
                <div className="absolute bottom-4 right-4 z-10 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                  <span>{currentImgIdx + 1} / {imagesList.length}</span>
                </div>
              )}
            </div>

            {/* Horizontal Thumbnails Strip */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImgIdx(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 transition-all ${
                      currentImgIdx === idx
                        ? 'ring-2 ring-[#225944] border-2 border-white scale-102 shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Property Details Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5E1D6] p-6 sm:p-8 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              {/* Top Status & Category Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-[#225944]/10 text-[#225944] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  {pg.gender} PG / Hostel
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Available</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight leading-tight mb-2">
                {pg.name}
              </h1>

              {/* Rating & Review Row */}
              <div className="flex items-center gap-2 text-xs font-bold text-[#171A18] mb-3">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-[#EECA3A] text-[#EECA3A]" />
                  <span>{pg.rating || 4.6}</span>
                </div>
                <span className="text-[#6B6B63] font-normal">({pg.reviewCount || 124} Reviews)</span>
                <span className="text-[#E5E1D6]">|</span>
                <div className="flex items-center gap-1 text-[#225944]">
                  <ShieldCheck className="w-4 h-4 text-[#225944]" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Location Row */}
              <div className="flex items-start gap-2 text-xs text-[#6B6B63] mb-5">
                <MapPin className="w-4 h-4 text-[#225944] shrink-0 mt-0.5" />
                <span className="font-semibold text-[#171A18]">
                  {pg.location.address || pg.location.landmark || pg.corridor || 'Bhilai, Chhattisgarh'}
                </span>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] space-y-1 mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#171A18]">
                    ₹{pg.monthlyRent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold text-[#6B6B63]">/ month</span>
                </div>
                <p className="text-[11px] text-[#225944] font-bold">
                  Including basic amenities &amp; maintenance
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2 border-t border-[#E5E1D6]">
              {/* Primary Book Now Button */}
              <button
                type="button"
                onClick={handleBookNowClick}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#225944] hover:bg-[#184232] text-white text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2 group btn-interaction"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#EECA3A]" />
              </button>

              {/* Contact & WhatsApp Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${pg.landlordPhone && pg.landlordPhone !== '—' ? pg.landlordPhone : '+916201614778'}`}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#F7F5EF] text-[#171A18] border border-[#E5E1D6] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-[#225944]" />
                  <span>Contact Owner</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Save to Wishlist Link */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={isSaving}
                className="w-full py-2 text-center text-xs font-bold text-[#225944] hover:underline flex items-center justify-center gap-1.5"
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-[#225944]'}`} />
                <span>{isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* 3. Amenities Strip */}
        <div className="bg-white rounded-3xl border border-[#E5E1D6] p-5 sm:p-6 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center divide-x-0 sm:divide-x divide-[#E5E1D6]">
            
            <div className="flex flex-col items-center p-2">
              <div className="p-2.5 rounded-xl bg-[#225944]/10 text-[#225944] mb-2">
                <Wifi className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#171A18]">WiFi</span>
              <span className="text-[11px] text-[#6B6B63] font-medium">High Speed</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="p-2.5 rounded-xl bg-[#EECA3A]/20 text-[#171A18] mb-2">
                <Bed className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#171A18]">Furnished</span>
              <span className="text-[11px] text-[#6B6B63] font-medium">Bed, Wardrobe</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="p-2.5 rounded-xl bg-[#225944]/10 text-[#225944] mb-2">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#171A18]">Meals</span>
              <span className="text-[11px] text-[#6B6B63] font-medium">Optional Tiffin</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="p-2.5 rounded-xl bg-[#EECA3A]/20 text-[#171A18] mb-2">
                <Shirt className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#171A18]">Laundry</span>
              <span className="text-[11px] text-[#6B6B63] font-medium">Available</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="p-2.5 rounded-xl bg-[#225944]/10 text-[#225944] mb-2">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#171A18]">Security</span>
              <span className="text-[11px] text-[#6B6B63] font-medium">24/7 CCTV</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="p-2.5 rounded-xl bg-[#EECA3A]/20 text-[#171A18] mb-2">
                <Bike className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#171A18]">Parking</span>
              <span className="text-[11px] text-[#6B6B63] font-medium">Two Wheeler</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="p-2.5 rounded-xl bg-[#225944]/10 text-[#225944] mb-2">
                <Navigation className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#171A18]">Prime Location</span>
              <span className="text-[11px] text-[#6B6B63] font-medium">Near Campus</span>
            </div>

          </div>
        </div>

        {/* 4. Bottom Grid (Left: About This PG, Right: Location Map) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* About This PG Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E1D6] p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-lg font-extrabold text-[#171A18] tracking-tight">
              About This PG
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B63] leading-relaxed font-medium">
              {pg.corridor || `${pg.name} offers a safe, comfortable, and student-friendly living environment with all essential amenities. Located in Bhilai, Chhattisgarh, it provides easy access to college campuses, local markets, and daily transport.`}
            </p>

            {/* Highlights Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#225944] text-white flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171A18]">Student Friendly</h4>
                  <p className="text-[10px] text-[#6B6B63]">Peaceful Environment</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#225944] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171A18]">Safe &amp; Secure</h4>
                  <p className="text-[10px] text-[#6B6B63]">24/7 CCTV &amp; Guard</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EECA3A] text-[#171A18] flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171A18]">Affordable</h4>
                  <p className="text-[10px] text-[#6B6B63]">Best for Students</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map Card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5E1D6] p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#171A18] tracking-tight">
                Location
              </h3>
            </div>

            {/* Map Canvas */}
            <LocationMap
              latitude={pg.location.latitude}
              longitude={pg.location.longitude}
              title={pg.name}
              address={pg.location.address || pg.corridor}
              className="w-full h-64 rounded-2xl overflow-hidden border border-[#E5E1D6]"
            />
          </div>

        </div>

      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        item={bookingModalItem}
      />

    </div>
  );
};

export default PGDetails;
