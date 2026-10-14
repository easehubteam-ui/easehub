import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { AdminServiceBooking, serviceExperienceApi } from '../../services/serviceExperienceApi';

interface ServiceBookingQueueProps {
  bookingType: 'MEAL' | 'LAUNDRY' | 'SERVICE';
  title: string;
}

const statusOptions = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'];

const parseMetadata = (notes: string) => {
  try { return typeof notes === 'string' ? JSON.parse(notes) : (notes || {}); }
  catch { return { details: notes }; }
};

export const ServiceBookingQueue: React.FC<ServiceBookingQueueProps> = ({ bookingType, title }) => {
  const [rows, setRows] = useState<AdminServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await serviceExperienceApi.getAdminServiceBookings(bookingType));
      setError(null);
    } catch (err: any) {
      setError(err?.message || `Unable to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [bookingType, title]);

  useEffect(() => { void refresh(); }, [refresh]);

  const updateStatus = async (row: AdminServiceBooking, status: string) => {
    setUpdatingId(row.id);
    setError(null);
    try {
      await serviceExperienceApi.updateBookingStatus(row.id, status);
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Booking status was not saved.');
      await refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="mt-6 rounded-3xl border border-[#E5E1D6] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-extrabold uppercase tracking-wider text-[#225944]">Real InsForge bookings</p><h2 className="mt-1 text-xl font-black text-[#171A18]">{title} ({rows.length})</h2><p className="mt-1 text-xs text-[#6B6B63]">Only customer booking rows saved in the existing bookings table are shown here.</p></div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#E5E1D6] px-3 py-2 text-xs font-bold text-[#225944] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
      </div>
      {error && <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">{error}</div>}
      {loading ? <p role="status" className="mt-5 text-sm text-[#6B6B63]">Loading booking records…</p> : rows.length === 0 ? <p className="mt-5 rounded-xl bg-[#F7F5EF] p-5 text-sm text-[#6B6B63]">No customer bookings are stored for this service yet.</p> : (
        <div className="mt-5 space-y-3">
          {rows.map((row) => {
            const meta = parseMetadata(row.notes);
            return (
              <article key={row.id} className="grid gap-4 rounded-2xl border border-[#E5E1D6] p-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#225944]">{row.booking_number}</span><span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-800">{row.status}</span><span className="rounded-full bg-[#F7F5EF] px-2 py-0.5 text-[10px] font-bold text-[#404944]">Payment: {row.payment_status || 'Not submitted'}</span></div>
                  <h3 className="mt-2 font-extrabold text-[#171A18]">{meta.serviceName || 'Service request'}</h3>
                  <p className="mt-1 text-sm text-[#404944]">{row.users?.name || 'Customer'} · {row.users?.phone || row.users?.email || 'Contact unavailable'}</p>
                  <p className="mt-1 text-xs text-[#6B6B63]">{row.address} · {row.scheduled_date ? new Date(row.scheduled_date).toLocaleString('en-IN') : 'Schedule pending'}</p>
                  {meta.details && <p className="mt-2 whitespace-pre-wrap text-xs text-[#404944]">{meta.details}</p>}
                </div>
                <div className="flex flex-row items-center justify-between gap-3 border-t border-[#E5E1D6] pt-3 lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                  <p className="text-lg font-black text-[#225944]">₹{Number(row.amount).toLocaleString('en-IN')}</p>
                  <select aria-label={`Update ${row.booking_number} status`} value={row.status.toUpperCase()} disabled={updatingId === row.id} onChange={(event) => void updateStatus(row, event.target.value)} className="rounded-xl border border-[#E5E1D6] bg-[#F7F5EF] px-3 py-2 text-xs font-bold disabled:opacity-50">
                    {statusOptions.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ServiceBookingQueue;
