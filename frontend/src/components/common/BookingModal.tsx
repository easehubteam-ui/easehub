import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/bookingApi';
import { paymentConfig } from '../../config/paymentConfig';
import { ShieldCheck, Phone, MessageSquare, X, Calendar, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export interface BookingModalItem {
  id: string;
  name: string;
  type: 'PG' | 'Meal' | 'Laundry' | 'Service' | 'pg' | 'meals' | 'laundry' | 'services';
  price: number;
  priceUnit?: string;
  location: string;
  image?: string;
  images?: string[];
  amenities?: string[];
  description?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BookingModalItem | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, item }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !item) return null;

  const handleBookNowClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      onClose();
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const created = await bookingApi.createBooking({
        serviceName: item.name,
        serviceType: item.type.toUpperCase(),
        amount: item.price,
        address: item.location,
        scheduledDate: scheduledDate,
        description: notes,
      });

      const bkId = created?.id || created?.bookingNumber || created?.booking_number || `BK${Date.now().toString().slice(-6)}`;

      onClose();

      navigate('/payment', {
        state: {
          bookingId: bkId,
          amount: item.price,
          serviceName: item.name,
          providerName: item.name,
          address: item.location,
        },
      });
    } catch (err: any) {
      console.error('Booking creation error:', err);
      setErrorMsg(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeImage = item.images && item.images.length > 0 ? item.images[0] : item.image;
  const whatsappUrl = paymentConfig.getWhatsAppLink(item.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5E1D6] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E1D6] bg-[#F7F5EF]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#225944]" />
            <h3 className="text-base font-extrabold text-[#171A18]">
              {isAuthenticated ? 'Booking & Payment Confirmation' : 'Property / Service Details'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E5E1D6] text-[#6B6B63] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Item Preview Card */}
          <div className="flex gap-4 p-3 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6]">
            {activeImage ? (
              <img
                src={activeImage}
                alt={item.name}
                className="w-24 h-24 rounded-xl object-cover shrink-0 bg-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-[#225944]/10 text-[#225944] flex flex-col items-center justify-center shrink-0 p-2 text-center">
                <span className="material-symbols-outlined text-3xl mb-1">domain</span>
                <span className="text-[10px] font-bold">EaseHub</span>
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#225944] text-white">
                  {item.type}
                </span>
                <h4 className="text-base font-bold text-[#171A18] truncate mt-1">{item.name}</h4>
                <p className="text-xs text-[#6B6B63] flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-[#225944] shrink-0" />
                  <span>{item.location}</span>
                </p>
              </div>

              <div className="mt-2">
                <span className="text-lg font-black text-[#171A18]">₹{item.price.toLocaleString('en-IN')}</span>
                <span className="text-xs text-[#6B6B63]"> {item.priceUnit || '/ month'}</span>
              </div>
            </div>
          </div>

          {/* Quick Direct Support CTAs */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={paymentConfig.getTelLink()}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-[#E5E1D6] hover:bg-[#F7F5EF] text-[#171A18] text-xs font-bold transition shadow-2xs"
            >
              <Phone className="w-4 h-4 text-[#225944]" />
              <span>Call Owner / Support</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] text-xs font-extrabold transition shadow-2xs"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Booking Form Details */}
          <form onSubmit={handleBookNowClick} className="space-y-4">
            
            {/* Customer Details Preview */}
            <div className="p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] space-y-1 text-xs">
              <span className="text-[10px] font-extrabold uppercase text-[#225944]">Customer Information</span>
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-[#171A18]">{user.name || 'Registered Customer'}</p>
                    <p className="text-[#6B6B63] text-[11px]">{user.email || user.phone}</p>
                  </div>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Logged In</span>
                  </span>
                </div>
              ) : (
                <div className="text-amber-900 font-semibold">
                  You are not logged in. Clicking <strong>Book Now</strong> will prompt you to sign in.
                </div>
              )}
            </div>

            {/* Scheduled Date Picker */}
            <div>
              <label className="block text-xs font-extrabold text-[#171A18] mb-1">
                Scheduled Start Date / Pickup Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E1D6] text-xs font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-extrabold text-[#171A18] mb-1">
                Special Requests / Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Room preference, dietary requests, or delivery time..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E1D6] text-xs font-medium text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Booking...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Booking &amp; Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};

export default BookingModal;
