import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { paymentConfig } from '../../config/paymentConfig';
import {
  ServiceBookingRequest,
  ServiceBookingRecord,
  serviceExperienceApi,
} from '../../services/serviceExperienceApi';
import { ArrowRight, CalendarDays, MapPin, MessageSquare, X } from 'lucide-react';

export interface ServiceBookingOption {
  catalogType: ServiceBookingRequest['catalogType'];
  catalogId?: string;
  name: string;
  price: number;
  billingPeriod: string;
  description?: string;
  quantityLabel?: string;
  durationLabel?: string;
  customServiceName?: string;
}

interface ServiceBookingModalProps {
  option: ServiceBookingOption | null;
  onClose: () => void;
  onCreated?: (booking: ServiceBookingRecord) => void;
}

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({ option, onClose, onCreated }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [details, setDetails] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRecurring = option?.billingPeriod === 'monthly' || option?.billingPeriod === 'daily';
  const amountEstimate = useMemo(() => {
    if (!option) return 0;
    return option.price * (isRecurring ? duration : quantity);
  }, [duration, isRecurring, option, quantity]);

  if (!option) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated || !user || user.role !== 'customer') {
      const pendingServiceRequest = {
        catalogType: option.catalogType,
        catalogId: option.catalogId,
        planName: option.name,
        billingPeriod: option.billingPeriod,
        customServiceName: option.customServiceName,
      };
      onClose();
      navigate('/login', {
        state: {
          from: { pathname: location.pathname, search: location.search },
          pendingServiceRequest,
        },
      });
      return;
    }

    setSubmitting(true);
    try {
      const booking = await serviceExperienceApi.createBooking({
        catalogType: option.catalogType,
        catalogId: option.catalogId,
        bookingDate: new Date(`${date}T00:00:00`).toISOString(),
        scheduledTime: time,
        address: address.trim(),
        details: details.trim(),
        quantity,
        duration,
        billingPeriod: option.billingPeriod,
        customServiceName: option.customServiceName || option.name,
      });
      onCreated?.(booking);
      onClose();
      navigate(`/payment?bookingId=${encodeURIComponent(booking.id)}&source=service`, {
        state: {
          bookingId: booking.id,
          amount: Number(booking.amount),
          serviceName: option.name,
          address: booking.address,
          serviceBooking: true,
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Booking was not saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappUrl = paymentConfig.getWhatsAppLink(option.name);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-booking-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#E5E1D6] bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E1D6] pb-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#225944]">Service request</p>
            <h2 id="service-booking-title" className="mt-1 text-xl font-black text-[#171A18]">{option.name}</h2>
            {option.description && <p className="mt-1 text-sm text-[#6B6B63]">{option.description}</p>}
          </div>
          <button type="button" aria-label="Close booking form" onClick={onClose} className="rounded-xl p-2 text-[#6B6B63] hover:bg-[#F7F5EF]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F7F5EF] p-4">
          <div>
            <p className="text-xs font-bold text-[#6B6B63]">Admin-listed rate</p>
            <p className="text-2xl font-black text-[#225944]">{option.price > 0 ? `₹${option.price.toLocaleString('en-IN')}` : 'Request a quote'}
              {option.price > 0 && <span className="ml-1 text-sm font-semibold text-[#6B6B63]">/{option.billingPeriod.replace('_', ' ')}</span>}
            </p>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100">
            <MessageSquare className="h-4 w-4" /> WhatsApp
          </a>
        </div>

        {error && <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-bold text-[#171A18]">
            Pickup / service address
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#E5E1D6] px-3">
              <MapPin className="h-4 w-4 shrink-0 text-[#225944]" />
              <input required={isAuthenticated} minLength={5} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border-0 py-2.5 text-sm outline-none focus:ring-0" placeholder="Hostel, room, street and area" />
            </div>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm font-bold text-[#171A18]">
              {option.catalogType.startsWith('laundry') ? 'Pickup date' : 'Start date'}
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#E5E1D6] px-3">
                <CalendarDays className="h-4 w-4 shrink-0 text-[#225944]" />
                <input required={isAuthenticated} type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} className="w-full border-0 py-2.5 text-sm outline-none focus:ring-0" />
              </div>
            </label>
            <label className="block text-sm font-bold text-[#171A18]">
              Preferred time
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E1D6] px-3 py-2.5 text-sm" />
            </label>
          </div>

          {isRecurring ? (
            <label className="block text-sm font-bold text-[#171A18]">
              {option.durationLabel || 'Duration'}
              <input type="number" min={1} max={365} value={duration} onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))} className="mt-1 w-full rounded-xl border border-[#E5E1D6] px-3 py-2.5 text-sm" />
            </label>
          ) : option.catalogType !== 'custom_service' ? (
            <label className="block text-sm font-bold text-[#171A18]">
              {option.quantityLabel || 'Quantity'}
              <input type="number" min={0.1} max={1000} step="0.1" value={quantity} onChange={(e) => setQuantity(Math.max(0.1, Number(e.target.value)))} className="mt-1 w-full rounded-xl border border-[#E5E1D6] px-3 py-2.5 text-sm" />
            </label>
          ) : null}

          <label className="block text-sm font-bold text-[#171A18]">
            Order details
            <textarea required={isAuthenticated} rows={3} value={details} onChange={(e) => setDetails(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E1D6] px-3 py-2.5 text-sm" placeholder="Weight, item count, special care, room details, or request description" />
          </label>

          <div className="flex items-center justify-between border-t border-[#E5E1D6] pt-4">
            <div>
              <p className="text-xs text-[#6B6B63]">Estimated total</p>
              <p className="text-lg font-black text-[#225944]">{option.price > 0 ? `₹${amountEstimate.toLocaleString('en-IN')}` : 'Quote required'}</p>
            </div>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[#225944] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#184232] disabled:opacity-60">
              {submitting ? 'Saving request…' : isAuthenticated ? 'Book now' : 'Sign in to continue'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ServiceBookingModal;
