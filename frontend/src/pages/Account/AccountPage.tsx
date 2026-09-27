import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Profile Form States
  const [nameInput, setNameInput] = useState(user?.name || 'Aarav Sharma');
  const [phoneInput, setPhoneInput] = useState('+91 98271 44820');
  const [emailInput, setEmailInput] = useState(user?.email || 'user@easehub.local');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditProfileOpen(false);
    alert('Profile updated successfully!');
  };

  const bookingsList = [
    { id: '#EH-26-8941', service: 'Royal Luxury Boys PG Room Stay', type: 'PG Stay', date: '20 Sep 2026', amount: '₹6,500', status: 'Confirmed' },
    { id: '#EH-26-8939', service: 'Annapurna 30-Day Meal Plan', type: 'Meals', date: '18 Sep 2026', amount: '₹3,200', status: 'In Progress' },
    { id: '#EH-26-8940', service: '10kg Steam Wash Laundry', type: 'Laundry', date: '24 Sep 2026', amount: '₹249', status: 'Assigned' },
  ];

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
                <span>Verified Resident</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {nameInput}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                {emailInput} • Student ID: <span className="font-mono text-[#EECA3A]">#EH-BIT-2026</span>
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
            { id: 'bookings', label: 'My Bookings', icon: 'calendar_month' },
            { id: 'payments', label: 'Payments', icon: 'account_balance_wallet' },
            { id: 'notifications', label: 'Notifications', icon: 'notifications', badge: '3' },
            { id: 'saved', label: 'Saved Wishlist', icon: 'favorite' },
            { id: 'addresses', label: 'Saved Addresses', icon: 'pin_drop' },
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
              <h2 className="text-base font-extrabold text-[#171A18]">Student Resident Profile</h2>
              <p className="text-xs text-[#6B6B63]">Manage your account details and identity verification</p>
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
              <p className="font-extrabold text-[#171A18] text-sm">{nameInput}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] space-y-1">
              <span className="text-[#6B6B63] font-semibold">Phone Number:</span>
              <p className="font-extrabold text-[#171A18] text-sm">{phoneInput}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] space-y-1">
              <span className="text-[#6B6B63] font-semibold">Email Address:</span>
              <p className="font-extrabold text-[#171A18] text-sm">{emailInput}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] space-y-1">
              <span className="text-[#6B6B63] font-semibold">College / Campus:</span>
              <p className="font-extrabold text-[#171A18] text-sm">BIT Durg (Computer Science B.Tech)</p>
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
          <div className="space-y-3">
            {bookingsList.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-[#F7F5EF] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#171A18]">{b.service}</div>
                  <div className="text-[10px] text-[#6B6B63]">{b.id} • {b.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-[#225944]">{b.amount}</div>
                  <div className="text-[10px] font-bold text-emerald-800">{b.status}</div>
                </div>
              </div>
            ))}
          </div>
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
          <div className="p-4 rounded-2xl bg-[#F7F5EF] flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-[#171A18]">Latest PG Rent Deposit</p>
              <p className="text-[10px] text-[#6B6B63]">UTR: 6289410924 • 20 Sep 2026</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Verified
            </span>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
            <h2 className="text-base font-extrabold text-[#171A18]">Notifications &amp; Alerts</h2>
            <span className="text-xs text-[#225944] font-bold">3 Unread</span>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border-l-4 border-[#225944] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#171A18]">
                <span>Booking Confirmed!</span>
                <span className="text-[10px] text-[#6B6B63]">Today 09:30 AM</span>
              </div>
              <p className="text-xs text-[#6B6B63]">Shree Krishna PG AC Single Room booking is confirmed for October 1st.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border-l-4 border-[#EECA3A] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#171A18]">
                <span>Meal Plan Renewal</span>
                <span className="text-[10px] text-[#6B6B63]">Yesterday</span>
              </div>
              <p className="text-xs text-[#6B6B63]">Your Annapurna Veg Thali subscription expires in 4 days. Renew now for uninterrupted service.</p>
            </div>
          </div>
        </div>
      )}

      {/* Saved Wishlist Tab */}
      {activeTab === 'saved' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
            <div>
              <h2 className="text-base font-extrabold text-[#171A18]">Saved Stays &amp; Meal Plans</h2>
              <p className="text-xs text-[#6B6B63]">5 listings locked in your shortlist</p>
            </div>
            <Link
              to="/wishlist"
              className="px-4 py-2 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-rose-400">favorite</span>
              <span>Open Shortlist Console →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] flex items-center justify-between text-xs">
              <div>
                <p className="font-extrabold text-[#225944]">Shree Krishna PG</p>
                <p className="text-[10px] text-[#6B6B63]">Junwani • Near BIT Gate 2</p>
              </div>
              <span className="font-bold text-[#225944]">₹6,500/mo</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] flex items-center justify-between text-xs">
              <div>
                <p className="font-extrabold text-[#225944]">Royal Annapurna Veg Thali</p>
                <p className="text-[10px] text-[#6B6B63]">Hostel Doorstep Delivery</p>
              </div>
              <span className="font-bold text-[#225944]">₹2,400/mo</span>
            </div>
          </div>
        </div>
      )}

      {/* Saved Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
            <h2 className="text-base font-extrabold text-[#171A18]">Saved Addresses</h2>
            <button className="px-3.5 py-1.5 rounded-xl bg-[#225944] text-white font-extrabold text-xs">
              + Add Address
            </button>
          </div>
          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#225944] text-white font-bold text-[10px]">HOSTEL / PG</span>
              <span className="font-bold text-[#171A18]">BIT Durg Campus Area</span>
            </div>
            <p className="text-[#6B6B63]">Room 304, Block B, Shree Krishna PG, Junwani Road, Bhilai, CG 490006</p>
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
              <h3 className="font-extrabold text-base text-[#171A18]">Edit Resident Profile</h3>
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
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] font-bold text-[#171A18]"
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
