import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../services/bookingApi';

interface CustomerBooking {
  id: string;
  category: 'PG' | 'Meals' | 'Laundry' | 'Service';
  serviceName: string;
  providerName: string;
  date: string;
  amount: number;
  paymentStatus: 'Escrow Held' | 'Paid UPI' | 'COD' | 'Pending Verification';
  bookingStatus: 'Pending' | 'Confirmed' | 'Assigned' | 'In Progress' | 'Ready' | 'Completed' | 'Cancelled';
  details: string;
}

const defaultBookings: CustomerBooking[] = [
  {
    id: '#EH-26-8941',
    category: 'PG',
    serviceName: 'Single Deluxe AC Studio Room',
    providerName: 'Sai Grace PG Villa',
    date: '20 Sep 2026',
    amount: 6500,
    paymentStatus: 'Escrow Held',
    bookingStatus: 'Confirmed',
    details: 'Room 204, Junwani Road, Near BIT Gate 2, Bhilai. Landlord: Ramakant Sahu (+91 98271 44820). Rent paid for September.',
  },
  {
    id: '#EH-26-8939',
    category: 'Meals',
    serviceName: '30-Day Lunch & Dinner North Veg Plan',
    providerName: 'Annapurna Student Mess',
    date: '18 Sep 2026',
    amount: 3200,
    paymentStatus: 'Escrow Held',
    bookingStatus: 'In Progress',
    details: 'Daily delivery at 1:15 PM (Lunch) & 8:15 PM (Dinner). Special request: Paneer Butter Masala on Wednesdays.',
  }
];

export const BookingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'PG' | 'Meals' | 'Laundry'>('All');
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);
  const [bookingsList, setBookingsList] = useState<CustomerBooking[]>(defaultBookings);

  const fetchBookings = async () => {
    try {
      const list = await bookingApi.getMyBookings();
      if (Array.isArray(list) && list.length > 0) {
        const mapped: CustomerBooking[] = list.map((b: any) => ({
          id: b.bookingNumber || b._id,
          category: (b.serviceType as any) || 'PG',
          serviceName: b.roomType || b.serviceName || 'EaseHub Booking',
          providerName: b.serviceName || 'EaseHub Partner',
          date: new Date(b.createdAt || b.scheduledDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: b.amount || 0,
          paymentStatus: b.paymentStatus === 'verified' ? 'Paid UPI' : 'Pending Verification',
          bookingStatus: (b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : 'Confirmed') as any,
          details: `${b.address || 'Bhilai'}. ${b.description || ''}`,
        }));
        setBookingsList(mapped);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookingsList.filter((b) => {
    if (activeTab === 'All') return true;
    return b.category === activeTab;
  });

  const getStatusBadge = (status: CustomerBooking['bookingStatus']) => {
    switch (status) {
      case 'Confirmed':
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20';
      case 'In Progress':
        return 'bg-[#225944]/10 text-[#225944] border-[#225944]/20';
      case 'Assigned':
      case 'Pending':
        return 'bg-amber-500/10 text-amber-800 border-amber-500/20';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-800 border-rose-500/20';
      default:
        return 'bg-[#F7F5EF] text-[#171A18]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#225944]">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <span>/</span>
          <span>My Bookings</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#171A18]">My Bookings &amp; Orders</h1>
        <p className="text-xs text-[#6B6B63]">
          Track active room stays, tiffin subscriptions, and doorstep laundry pick-ups.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-[#E5E1D6] shadow-xs flex items-center gap-2">
        {(['All', 'PG', 'Meals', 'Laundry'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === tab
                ? 'bg-[#225944] text-white shadow-xs'
                : 'text-[#6B6B63] hover:bg-[#F7F5EF] hover:text-[#171A18]'
            }`}
          >
            {tab === 'All' ? 'All Bookings' : tab}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      <div className="space-y-4">
        {filteredBookings.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 border border-[#E5E1D6] shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#225944]">{item.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(item.bookingStatus)}`}>
                  {item.bookingStatus}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#F7F5EF] text-[#6B6B63] font-bold text-[10px]">
                  {item.category}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-[#171A18]">{item.serviceName}</h3>
              <p className="text-xs text-[#6B6B63]">Provider: <strong className="text-[#171A18]">{item.providerName}</strong> • Date: {item.date}</p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E5E1D6]">
              <div className="text-right">
                <div className="font-extrabold text-base text-[#225944]">₹{item.amount}</div>
                <div className="text-[10px] text-[#715d00] font-bold">{item.paymentStatus}</div>
              </div>
              <button
                onClick={() => setSelectedBooking(item)}
                className="px-4 py-2 rounded-xl bg-[#F7F5EF] hover:bg-[#E5E1D6] text-[#171A18] font-bold text-xs transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
              <div>
                <span className="font-mono text-xs font-bold text-[#225944]">{selectedBooking.id}</span>
                <h3 className="font-extrabold text-base text-[#171A18]">{selectedBooking.serviceName}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-[#F7F5EF] text-[#6B6B63] hover:text-[#171A18] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F7F5EF] space-y-1">
                <div className="font-bold text-[#171A18]">Provider: {selectedBooking.providerName}</div>
                <div className="text-[#6B6B63]">Category: {selectedBooking.category} • Date: {selectedBooking.date}</div>
                <div className="text-[#225944] font-bold">Total Paid: ₹{selectedBooking.amount} ({selectedBooking.paymentStatus})</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F5EF] space-y-1 text-[#6B6B63]">
                <strong className="text-[#171A18]">Fulfillment Information:</strong>
                <p>{selectedBooking.details}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl bg-[#225944] text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
