import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { bookingApi } from '../../services/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { SkeletonCard } from '../../components/common/SkeletonCard';

interface CustomerBooking {
  id: string;
  originalId: string;
  category: 'PG' | 'Meals' | 'Laundry' | 'Service';
  serviceName: string;
  providerName: string;
  date: string;
  amount: number;
  paymentStatus: 'Escrow Held' | 'Paid UPI' | 'COD' | 'Pending Verification';
  bookingStatus: 'Pending' | 'Confirmed' | 'Assigned' | 'In Progress' | 'Ready' | 'Completed' | 'Cancelled';
  details: string;
}

export const BookingsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'All' | 'PG' | 'Meals' | 'Laundry'>('All');
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<CustomerBooking | null>(null);
  const [bookingsList, setBookingsList] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const list = await bookingApi.getMyBookings();
      if (Array.isArray(list)) {
        const mapped: CustomerBooking[] = list.map((b: any) => ({
          id: b.bookingNumber || b._id || b.id,
          originalId: b.id || b._id || b.bookingNumber,
          category: (b.serviceType as any) || (b.bookingType as any) || 'PG',
          serviceName: b.roomType || b.serviceName || 'EaseHub Booking',
          providerName: b.serviceName || 'EaseHub Verified Partner',
          date: new Date(b.createdAt || b.scheduledDate || Date.now()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          amount: b.amount || 0,
          paymentStatus: b.paymentStatus === 'verified' ? 'Paid UPI' : 'Pending Verification',
          bookingStatus: (b.status
            ? b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase()
            : 'Confirmed') as any,
          details: `${b.address || 'Bhilai'}. ${b.description || b.notes || ''}`,
        }));
        setBookingsList(mapped);
      } else {
        setBookingsList([]);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
      setBookingsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'customer') {
      fetchBookings();
    }
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[#E5E1D6] text-center shadow-xs">
        <div className="w-10 h-10 border-4 border-[#225944] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-[#225944]">Loading your bookings...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin' || user.role === 'superadmin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleDeleteConfirm = async () => {
    if (!deletingBooking) return;
    setDeleteLoading(true);
    try {
      await bookingApi.deleteBooking(deletingBooking.originalId);
      setBookingsList((prev) => prev.filter((b) => b.originalId !== deletingBooking.originalId && b.id !== deletingBooking.id));
      setDeletingBooking(null);
    } catch (err) {
      console.error('Failed to delete booking:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredBookings = bookingsList.filter((b) => {
    if (activeTab === 'All') return true;
    return b.category.toLowerCase() === activeTab.toLowerCase();
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
        return 'bg-[#F7F5EF] text-[#171A18] border-[#E5E1D6]';
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
          Track active room stays, tiffin subscriptions, doorstep laundry, and extra maintenance orders.
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

      {/* Bookings Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} layout="horizontal" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E5E1D6] text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#225944]/10 text-[#225944] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">calendar_month</span>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#171A18]">No bookings found</h3>
            <p className="text-xs text-[#6B6B63] mt-1 max-w-sm mx-auto">
              You have no active or previous bookings in this category. Book verified PGs, meals or laundry to get started.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Link to="/pg" className="px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#184232] transition">
              Browse PGs
            </Link>
            <Link to="/meals" className="px-4 py-2 rounded-xl bg-[#EECA3A] text-[#171A18] text-xs font-bold hover:bg-[#e0bd2c] transition">
              Explore Meals
            </Link>
          </div>
        </div>
      ) : (
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(item)}
                    className="px-4 py-2 rounded-xl bg-[#F7F5EF] hover:bg-[#E5E1D6] text-[#171A18] font-bold text-xs transition"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingBooking(item)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                    title="Delete booking"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <div className="text-[#225944] font-bold">Total Amount: ₹{selectedBooking.amount} ({selectedBooking.paymentStatus})</div>
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

      {/* Delete Confirmation Modal */}
      {deletingBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#171A18]">Delete this booking?</h3>
              <p className="text-xs text-[#6B6B63] mt-1">
                Are you sure you want to remove booking <strong className="text-[#171A18]">{deletingBooking.id}</strong> ({deletingBooking.serviceName})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingBooking(null)}
                className="px-5 py-2.5 rounded-xl border border-[#E5E1D6] text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
