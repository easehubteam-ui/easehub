import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/bookingApi';
import { savedApi } from '../../services/savedApi';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Profile Form States
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [emailInput, setEmailInput] = useState(user?.email || '');

  // DB States
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setPhoneInput(user.phone || '');
      setEmailInput(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && user && user.role === 'customer') {
      setLoadingBookings(true);
      bookingApi.getMyBookings()
        .then((bList) => {
          if (isMounted) setUserBookings(Array.isArray(bList) ? bList : []);
        })
        .catch(() => {
          if (isMounted) setUserBookings([]);
        })
        .finally(() => {
          if (isMounted) setLoadingBookings(false);
        });

      savedApi.getSavedItems()
        .then((items) => {
          if (isMounted) setSavedCount(items.length);
        })
        .catch(() => {
          if (isMounted) setSavedCount(0);
        });
    }
    return () => { isMounted = false; };
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[#E5E1D6] text-center shadow-xs">
        <div className="w-10 h-10 border-4 border-[#225944] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-[#225944]">Loading account...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin' || user.role === 'superadmin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditProfileOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Account Page Banner */}
      <div className="bg-gradient-to-r from-[#225944] via-[#184232] to-[#02412e] rounded-3xl p-6 sm:p-8 text-white shadow-xs relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#EECA3A]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EECA3A] text-[#171A18] font-black text-2xl flex items-center justify-center shadow-xs">
              {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#EECA3A] mb-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#EECA3A] animate-ping"></span>
                <span>Verified Customer Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.name || 'Customer Profile'}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                {user?.email || ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold text-xs backdrop-blur-xs border border-rose-500/30 transition flex items-center gap-1.5 self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Account Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-[#E5E1D6] shadow-xs overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: 'profile', label: 'Profile Settings', icon: 'person' },
            { id: 'bookings', label: 'My Bookings', icon: 'calendar_month', badge: userBookings.length > 0 ? String(userBookings.length) : undefined },
            { id: 'payments', label: 'Payments', icon: 'account_balance_wallet' },
            { id: 'saved', label: 'Saved Wishlist', icon: 'favorite', badge: savedCount > 0 ? String(savedCount) : undefined },
            { id: 'support', label: 'Help & Support', icon: 'support_agent' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isActive ? 'bg-[#225944] text-white shadow-xs' : 'text-[#6B6B63] hover:bg-[#F7F5EF] hover:text-[#171A18]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-[#EECA3A] text-[#171A18]'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Section */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D6]">
            <div>
              <h2 className="text-base font-extrabold text-[#171A18]">Customer Account Profile</h2>
              <p className="text-xs text-[#6B6B63]">Manage your registered contact and account information</p>
            </div>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-bold text-xs transition"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F7F5EF] space-y-1">
              <span className="text-[#6B6B63] font-semibold">Full Name:</span>
              <p className="font-extrabold text-[#171A18] text-sm">{user?.name || 'Not specified'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] space-y-1">
              <span className="text-[#6B6B63] font-semibold">Phone Number:</span>
              <p className="font-extrabold text-[#171A18] text-sm">{user?.phone || 'Not provided'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] space-y-1">
              <span className="text-[#6B6B63] font-semibold">Email Address:</span>
              <p className="font-extrabold text-[#171A18] text-sm">{user?.email || ''}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] space-y-1">
              <span className="text-[#6B6B63] font-semibold">Account Role:</span>
              <p className="font-extrabold text-[#225944] text-sm uppercase">Customer Resident</p>
            </div>
          </div>
        </div>
      )}

      {/* My Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
            <h2 className="text-base font-extrabold text-[#171A18]">My Bookings</h2>
            <Link to="/bookings" className="text-xs font-bold text-[#225944] hover:underline">Open Full Bookings Console →</Link>
          </div>

          {loadingBookings ? (
            <div className="p-8 text-center text-xs text-[#6B6B63]">Loading bookings...</div>
          ) : userBookings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-[#225944]">calendar_month</span>
              <p className="font-bold text-xs text-[#171A18]">No bookings found</p>
              <p className="text-[11px] text-[#6B6B63]">You have no active orders or bookings registered yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userBookings.map((b: any) => (
                <div key={b._id || b.id || b.bookingNumber} className="p-4 rounded-2xl bg-[#F7F5EF] flex items-center justify-between text-xs border border-[#E5E1D6]">
                  <div>
                    <div className="font-bold text-[#171A18]">{b.serviceName || b.roomType || 'EaseHub Order'}</div>
                    <div className="text-[10px] text-[#6B6B63]">{b.bookingNumber || b.id} • {b.serviceType || 'Service'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-[#225944]">₹{b.amount || 0}</div>
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">{b.status || 'Active'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
            <h2 className="text-base font-extrabold text-[#171A18]">Payments &amp; Escrow</h2>
            <Link to="/payment" className="px-3.5 py-1.5 rounded-xl bg-[#EECA3A] hover:bg-[#e0bd2c] text-[#171A18] font-extrabold text-xs transition">
              + Pay UPI
            </Link>
          </div>
          <p className="text-xs text-[#6B6B63]">All payments are protected by EaseHub 100% Escrow Guard.</p>
          
          {userBookings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-[#225944]">receipt_long</span>
              <p className="font-bold text-xs text-[#171A18]">No payment transaction history</p>
              <p className="text-[11px] text-[#6B6B63]">Your verified UPI deposit history will appear here once you make a payment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userBookings.map((b: any) => (
                <div key={b._id || b.id} className="p-4 rounded-2xl bg-[#F7F5EF] flex items-center justify-between text-xs border border-[#E5E1D6]">
                  <div>
                    <p className="font-bold text-[#171A18]">{b.serviceName || 'EaseHub Payment'}</p>
                    <p className="text-[10px] text-[#6B6B63]">ID: {b.bookingNumber || b.id}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ₹{b.amount || 0} Paid
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved Wishlist Tab */}
      {activeTab === 'saved' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
            <div>
              <h2 className="text-base font-extrabold text-[#171A18]">Saved Stays &amp; Meal Plans</h2>
              <p className="text-xs text-[#6B6B63]">{savedCount} items in your shortlist</p>
            </div>
            <Link
              to="/wishlist"
              className="px-4 py-2 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-rose-400">favorite</span>
              <span>Open Shortlist Console →</span>
            </Link>
          </div>
        </div>
      )}

      {/* Help & Support Tab */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
            <h2 className="text-base font-extrabold text-[#171A18]">24/7 Student Support</h2>
            <Link to="/support" className="px-3.5 py-1.5 rounded-xl bg-[#225944] text-white font-extrabold text-xs">
              Contact Desk
            </Link>
          </div>
          <p className="text-xs text-[#6B6B63]">Need help with your room, meals, or laundry? Reach out to EaseHub Resident Care.</p>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
              <h3 className="font-extrabold text-base text-[#171A18]">Edit Customer Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="w-8 h-8 rounded-full bg-[#F7F5EF] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#171A18] mb-1">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] font-bold text-[#171A18]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171A18] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] font-bold text-[#171A18]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171A18] mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={emailInput}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 border border-[#E5E1D6] font-bold text-[#6B6B63] cursor-not-allowed"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E1D6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F7F5EF] font-bold text-[#171A18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#225944] text-white font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
