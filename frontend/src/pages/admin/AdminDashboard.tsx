import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { bookingApi } from '../../services/bookingApi';

export const AdminDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | '7days' | 'month' | 'term'>('today');
  const [selectedCorridor, setSelectedCorridor] = useState('All Bhilai-Durg Nodes (5 Corridors)');
  const [searchTerm, setSearchTerm] = useState('');
  const [dbStats, setDbStats] = useState<any>(null);
  const [liveBookings, setLiveBookings] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getStats()
      .then((data) => {
        if (data) setDbStats(data.stats);
      })
      .catch((err) => console.error('Failed to load admin stats:', err));

    bookingApi.getBookings()
      .then((list) => {
        if (Array.isArray(list)) {
          const mapped = list.map((b: any) => ({
            id: b.bookingNumber || b._id,
            time: new Date(b.createdAt || Date.now()).toLocaleString('en-IN'),
            student: b.userName || b.user?.fullName || 'Student',
            campus: 'BIT Durg / CSVTU',
            vertical: b.serviceType || b.roomType || 'Service',
            verticalIcon: b.serviceType === 'PG Stay' ? 'night_shelter' : b.serviceType === 'Meals' ? 'restaurant' : b.serviceType === 'Laundry' ? 'local_laundry_service' : 'handyman',
            provider: b.serviceName || 'EaseHub Partner',
            location: b.address || 'Bhilai, Chhattisgarh',
            value: `₹${b.amount || 0}`,
            commission: `Comm: ₹${Math.round((b.amount || 0) * 0.1)}`,
            status: b.status || 'pending',
            statusStyle: 'bg-emerald-100 text-emerald-900 border-emerald-300',
            actions: 'verify',
          }));
          setLiveBookings(mapped);
        }
      })
      .catch((err) => console.error('Failed to load admin live bookings:', err));
  }, []);

  const filteredBookings = liveBookings.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.id.toLowerCase().includes(term) ||
      b.student.toLowerCase().includes(term) ||
      b.provider.toLowerCase().includes(term) ||
      b.vertical.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Interactive Top Action & Status Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E1D6] shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#225944] tracking-tight">
              Admin Live Business Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#225944]/10 text-[#225944] text-[10px] uppercase font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#225944] animate-pulse"></span>
              Live Sync • 32s ago
            </span>
          </div>
          <p className="text-xs text-[#6B6B63]">
            Real-time ecosystem intelligence across Junwani, Smriti Nagar, Nehru Nagar, Civic Center & BIT Durg campus corridors.
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#F3F4F0] rounded-xl p-1 border border-[#E5E1D6]">
            {(
              [
                { id: 'today', label: 'Today: 24 Oct 2026' },
                { id: '7days', label: 'Last 7 Days' },
                { id: 'month', label: 'This Month' },
                { id: 'term', label: 'Academic Term' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTimeframe(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all font-semibold ${
                  selectedTimeframe === t.id
                    ? 'bg-white text-[#225944] shadow-xs font-bold'
                    : 'text-[#6B6B63] hover:text-[#171A18]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#F3F4F0] border border-[#E5E1D6] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#171A18]">
            <span className="material-symbols-outlined text-[18px] text-[#225944] mr-1.5">share_location</span>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-bold text-[#171A18]"
            >
              <option>All Bhilai-Durg Nodes (5 Corridors)</option>
              <option>Junwani & BIT Durg Perimeter</option>
              <option>Smriti Nagar Student Quarter</option>
              <option>Nehru Nagar Tech Hub</option>
              <option>Civic Center & Sector 1-6</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => alert('Downloading EaseHub Business Audit CSV...')}
            className="flex items-center gap-1.5 bg-[#F3F4F0] text-[#171A18] border border-[#E5E1D6] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#E5E1D6] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Audit</span>
          </button>

          <Link
            to="/admin/support"
            className="flex items-center gap-1.5 bg-[#225944] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-[#184232] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Live Support Chat</span>
          </Link>
        </div>
      </div>

      {/* Row 1: Primary Ecosystem Infrastructure Counters (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E5E1D6] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6B63] uppercase tracking-wider">Total Active Users</span>
            <div className="w-8 h-8 rounded-lg bg-[#225944]/10 text-[#225944] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#171A18]">{dbStats?.totalUsers || 0}</span>
              <span className="text-[10px] text-[#225944] font-extrabold">Active</span>
            </div>
            <p className="text-[11px] text-[#6B6B63] mt-1 font-medium">Registered Accounts</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#225944] h-full rounded-full" style={{ width: dbStats?.totalUsers ? '100%' : '0%' }}></div>
          </div>
        </div>

        {/* Total Vendors */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E5E1D6] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6B63] uppercase tracking-wider">Vendors & Hubs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#171A18]">{dbStats?.totalVendors || 0}</span>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">Verified</span>
            </div>
            <p className="text-[11px] text-[#6B6B63] mt-1 font-medium">Partner Ecosystem</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: dbStats?.totalVendors ? '100%' : '0%' }}></div>
          </div>
        </div>

        {/* Active PGs & Hostels */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E5E1D6] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6B63] uppercase tracking-wider">Verified PGs / Hostels</span>
            <div className="w-8 h-8 rounded-lg bg-[#225944]/10 text-[#225944] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">night_shelter</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#171A18]">{dbStats?.totalPGs || 0}</span>
              <span className="text-[10px] text-[#225944] font-extrabold">{dbStats?.occupancyRate || 0}% Occ.</span>
            </div>
            <p className="text-[11px] text-[#6B6B63] mt-1 font-medium">{dbStats?.totalBeds || 0} total verified beds</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#225944] h-full rounded-full" style={{ width: `${dbStats?.occupancyRate || 0}%` }}></div>
          </div>
        </div>

        {/* Active Meal Providers */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E5E1D6] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6B63] uppercase tracking-wider">Meal Providers</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#171A18]">{dbStats?.totalMealProviders || 0}</span>
              <span className="text-[10px] text-[#225944] font-extrabold">Active</span>
            </div>
            <p className="text-[11px] text-[#6B6B63] mt-1 font-medium">Mess & Tiffin Subscriptions</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: dbStats?.totalMealProviders ? '100%' : '0%' }}></div>
          </div>
        </div>

        {/* Laundry Partners */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E5E1D6] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6B63] uppercase tracking-wider">Laundry Partners</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">local_laundry_service</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#171A18]">{dbStats?.totalLaundryProviders || 0}</span>
              <span className="text-[10px] text-blue-700 font-extrabold">Active</span>
            </div>
            <p className="text-[11px] text-[#6B6B63] mt-1 font-medium">Industrial Wash & Dry Hubs</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: dbStats?.totalLaundryProviders ? '100%' : '0%' }}></div>
          </div>
        </div>

        {/* Home & Hostel Technicians */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E5E1D6] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6B63] uppercase tracking-wider">Home Technicians</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">handyman</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#171A18]">{dbStats?.totalExtraServices || 0}</span>
              <span className="text-[10px] text-purple-700 font-extrabold">Active</span>
            </div>
            <p className="text-[11px] text-[#6B6B63] mt-1 font-medium">Plumbers, Electricians, AC</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: dbStats?.totalExtraServices ? '100%' : '0%' }}></div>
          </div>
        </div>
      </div>

      {/* Row 2: Live Operations & Daily Booking Health Pulse Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-1 gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#225944] text-[22px]">speed</span>
            <h2 className="text-base font-extrabold text-[#171A18]">Daily Booking Velocity & Fulfillment Health</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-[#6B6B63]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#225944]"></span> Completed ({liveBookings.length > 0 ? Math.round((liveBookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length / liveBookings.length) * 100) : 0}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EECA3A]"></span> Pending / In-Queue ({liveBookings.length > 0 ? Math.round((liveBookings.filter(b => b.status === 'pending').length / liveBookings.length) * 100) : 0}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Cancelled ({liveBookings.length > 0 ? Math.round((liveBookings.filter(b => b.status === 'cancelled').length / liveBookings.length) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Segmented Operations Bar */}
        <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
          <div className="bg-[#225944] h-full transition-all" style={{ width: `${liveBookings.length > 0 ? (liveBookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length / liveBookings.length) * 100 : 0}%` }} title="Completed"></div>
          <div className="bg-[#EECA3A] h-full transition-all" style={{ width: `${liveBookings.length > 0 ? (liveBookings.filter(b => b.status === 'pending').length / liveBookings.length) * 100 : 0}%` }} title="Pending"></div>
          <div className="bg-rose-500 h-full transition-all" style={{ width: `${liveBookings.length > 0 ? (liveBookings.filter(b => b.status === 'cancelled').length / liveBookings.length) * 100 : 0}%` }} title="Cancelled"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="bg-[#F8FAF6] rounded-2xl p-3 border border-[#E5E1D6] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B6B63]">Total Bookings</span>
              <div className="text-xl font-extrabold text-[#171A18]">{liveBookings.length}</div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#225944]/10 text-[#225944] text-[10px] font-extrabold">
              Live
            </span>
          </div>

          <div className="bg-[#F8FAF6] rounded-2xl p-3 border border-[#E5E1D6] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B6B63]">Pending Allotments</span>
              <div className="text-xl font-extrabold text-amber-700">{liveBookings.filter(b => b.status === 'pending').length}</div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
              In-Queue
            </span>
          </div>

          <div className="bg-[#F8FAF6] rounded-2xl p-3 border border-[#E5E1D6] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B6B63]">Completed &amp; Confirmed</span>
              <div className="text-xl font-extrabold text-[#225944]">{liveBookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length}</div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Active
            </span>
          </div>

          <div className="bg-[#F8FAF6] rounded-2xl p-3 border border-[#E5E1D6] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B6B63]">Cancelled / Voided</span>
              <div className="text-xl font-extrabold text-rose-600">{liveBookings.filter(b => b.status === 'cancelled').length}</div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
              Rate: {liveBookings.length > 0 ? Math.round((liveBookings.filter(b => b.status === 'cancelled').length / liveBookings.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Financial Health, Escrow & Compliance Safeguards (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* MTD Revenue Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E1D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B6B63]">Platform Escrow Volume</span>
            <span className="material-symbols-outlined text-[#225944] text-[20px]">currency_rupee</span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-[#225944] tracking-tight">₹{(dbStats?.escrowVolume || 0).toLocaleString('en-IN')}</div>
            <p className="text-xs text-[#6B6B63] mt-1 font-medium">
              <span className="text-[#225944] font-bold">₹{Math.round((dbStats?.escrowVolume || 0) * 0.1).toLocaleString('en-IN')}</span> Est. platform commission (10.0%)
            </p>
          </div>
          <div className="pt-2 border-t border-[#E5E1D6] flex items-center justify-between text-xs font-semibold">
            <span className="text-[#6B6B63]">Escrow Security</span>
            <span className="text-[#225944] font-extrabold">Active</span>
          </div>
        </div>

        {/* Student Escrow Balances */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E1D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B6B63]">Student Escrow Balances</span>
            <span className="material-symbols-outlined text-amber-600 text-[20px]">account_balance_wallet</span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-[#171A18] tracking-tight">₹{(dbStats?.escrowVolume || 0).toLocaleString('en-IN')}</div>
            <p className="text-xs text-[#6B6B63] mt-1 font-medium">Auto-disbursal on service OTP scan</p>
          </div>
          <div className="pt-2 border-t border-[#E5E1D6] flex items-center justify-between text-xs font-semibold">
            <span className="text-[#6B6B63]">Settlement Run</span>
            <span className="text-[#171A18] font-bold">Realtime</span>
          </div>
        </div>

        {/* Manual UPI/NEFT Reconciliations */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E1D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B6B63]">Pending Reconciliations</span>
            <span className="material-symbols-outlined text-[#715d00] text-[20px]">receipt_long</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-900 tracking-tight">{dbStats?.pendingPaymentsCount || 0}</span>
              <span className="text-xs font-semibold text-[#6B6B63]">Tickets Pending</span>
            </div>
            <p className="text-xs text-[#6B6B63] mt-1 font-medium">₹{(dbStats?.pendingPaymentsAmount || 0).toLocaleString('en-IN')} total pending amount</p>
          </div>
          <div className="pt-2 border-t border-[#E5E1D6] flex items-center justify-between text-xs font-semibold">
            <span className="text-[#6B6B63]">Verified Gateways</span>
            <span className="text-[#225944] font-extrabold">{dbStats?.verifiedPaymentsCount || 0} Txns</span>
          </div>
        </div>

        {/* Urgent SLA Dispute Tickets */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E1D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B6B63]">Total Platform Bookings</span>
            <span className="material-symbols-outlined text-rose-600 text-[20px]">emergency_home</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#171A18] tracking-tight">{dbStats?.totalBookingsCount || 0}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Database</span>
            </div>
            <p className="text-xs text-[#6B6B63] mt-1 font-medium">All student orders across Bhilai &amp; Durg</p>
          </div>
          <div className="pt-2 border-t border-[#E5E1D6] flex items-center justify-between text-xs font-semibold">
            <span className="text-[#6B6B63]">System Status</span>
            <span className="text-[#225944] font-extrabold">Healthy</span>
          </div>
        </div>
      </div>

      {/* Row 4: Visual Analytics (Charts 1 & 3) */}
      {/* Row 4: Visual Analytics (Charts 1 & 3) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Chart 1: Bookings Trajectory */}
        <div className="xl:col-span-8 bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E1D6] mb-4 gap-2">
            <div>
              <h3 className="text-base font-extrabold text-[#171A18]">Bookings Trajectory</h3>
              <p className="text-xs text-[#6B6B63]">Real-time booking volume across Bhilai &amp; Durg corridors</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-[#225944]">
                <span className="w-3 h-3 rounded bg-[#225944]"></span> Live Orders ({liveBookings.length})
              </span>
            </div>
          </div>

          {liveBookings.length > 0 ? (
            <div className="w-full h-64 flex items-end justify-between gap-2 p-4 bg-[#F8FAF6] rounded-2xl border border-[#E5E1D6]">
              {liveBookings.slice(0, 10).map((b, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-[#225944] rounded-t-lg transition-all" style={{ height: `${Math.min(100, Math.max(15, (Number(b.value?.replace(/\D/g, '') || 100) / 1000) * 100))}%` }}></div>
                  <span className="text-[10px] font-bold text-[#6B6B63] truncate w-full text-center">{b.id}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#F8FAF6] rounded-2xl border border-dashed border-[#E5E1D6]">
              <div className="w-12 h-12 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">ssid_chart</span>
              </div>
              <h4 className="text-sm font-extrabold text-[#171A18]">No Booking Trajectory Data Yet</h4>
              <p className="text-xs text-[#6B6B63] mt-1 max-w-sm font-medium">
                Real-time booking trends will render here automatically as students place orders across PGs, Meals, Laundry, and Services.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-[#6B6B63] text-xs font-semibold pt-3 border-t border-[#E5E1D6] mt-4">
            <span>Database Status: Active</span>
            <span className="text-[#225944] font-bold">{liveBookings.length} Total Bookings Recorded</span>
          </div>
        </div>

        {/* Chart 3: Service-Wise Bookings Distribution */}
        <div className="xl:col-span-4 bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6] mb-3">
            <h3 className="text-base font-extrabold text-[#171A18]">Service Distribution</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#F3F4F0] text-[#6B6B63] text-[10px] font-bold uppercase">
              Live Volume
            </span>
          </div>

          <div className="relative flex flex-col items-center justify-center my-4 py-4">
            <div className="w-36 h-36 rounded-full border-4 border-dashed border-[#E5E1D6] flex flex-col items-center justify-center bg-[#F8FAF6]">
              <span className="text-3xl font-extrabold text-[#171A18] leading-none">{liveBookings.length}</span>
              <span className="text-[10px] font-bold text-[#6B6B63] uppercase mt-1">Bookings</span>
            </div>
            <p className="text-xs font-semibold text-[#6B6B63] mt-3">
              {liveBookings.length > 0 ? 'Live category breakdown active' : 'No transaction data recorded yet'}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#225944]"></span>
                <span className="text-[#171A18] font-bold">PG &amp; Hostel Stays</span>
              </div>
              <span className="text-[#225944] font-extrabold">
                {liveBookings.filter(b => b.vertical?.includes('PG')).length} Bookings
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EECA3A]"></span>
                <span className="text-[#171A18] font-bold">Daily Meals &amp; Tiffins</span>
              </div>
              <span className="text-amber-800 font-extrabold">
                {liveBookings.filter(b => b.vertical?.includes('Meal')).length} Bookings
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-[#171A18] font-bold">Laundry &amp; Garment Care</span>
              </div>
              <span className="text-blue-700 font-extrabold">
                {liveBookings.filter(b => b.vertical?.includes('Laundry')).length} Bookings
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-[#171A18] font-bold">Doorstep Services</span>
              </div>
              <span className="text-purple-700 font-extrabold">
                {liveBookings.filter(b => b.vertical?.includes('Service') || b.vertical?.includes('Repair')).length} Bookings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Revenue Trajectory & Demand Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 2: Revenue Stream Trajectory */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6] mb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#171A18]">Revenue &amp; Net Take</h3>
              <p className="text-xs text-[#6B6B63]">Verified payment revenue from PostgreSQL</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#225944]/10 text-[#225944] text-[10px] font-bold">
              PostgreSQL Live
            </span>
          </div>

          <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-[#F8FAF6] rounded-2xl border border-dashed border-[#E5E1D6] my-2">
            <span className="text-3xl font-extrabold text-[#225944]">
              ₹{(dbStats?.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-[#6B6B63] mt-1.5">
              {(dbStats?.totalRevenue || 0) > 0 ? 'Total verified payment revenue' : 'No verified revenue recorded yet'}
            </span>
          </div>

          <div className="pt-2 border-t border-[#E5E1D6] flex items-center justify-between text-xs font-semibold text-[#6B6B63]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#225944]"></span> Verified Payments ({dbStats?.verifiedPaymentsCount || 0})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Pending ({dbStats?.pendingPaymentsCount || 0})
            </span>
          </div>
        </div>

        {/* Chart 4: User Demographics */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6] mb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#171A18]">Demographic Insights</h3>
              <p className="text-xs text-[#6B6B63]">User Demographic Insights</p>
            </div>
            <span className="material-symbols-outlined text-[#225944] text-[20px]">how_to_reg</span>
          </div>

          <div className="py-8 text-center space-y-2 my-auto">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-[#6B6B63] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-xl">groups</span>
            </div>
            <p className="text-xs font-extrabold text-[#171A18]">Demographic Data Unavailable</p>
            <p className="text-[11px] text-[#6B6B63] max-w-xs mx-auto font-medium">
              Student vs professional demographics will populate automatically as registered users complete campus profile verification.
            </p>
          </div>

          <div className="p-3 bg-[#F8FAF6] rounded-2xl border border-[#E5E1D6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#225944] text-[18px]">verified</span>
              <span className="text-xs font-bold text-[#171A18]">Registered Users</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#225944]/10 text-[#225944] text-[10px] font-extrabold">
              {dbStats?.totalUsers || 0} Accounts
            </span>
          </div>
        </div>

        {/* Chart 5: Campus Corridor Density */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6] mb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#171A18]">Campus Corridor Analytics</h3>
              <p className="text-xs text-[#6B6B63]">Corridor Demand Density</p>
            </div>
            <span className="material-symbols-outlined text-[#225944] text-[20px]">map</span>
          </div>

          <div className="py-8 text-center space-y-2 my-auto">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-[#6B6B63] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-xl">share_location</span>
            </div>
            <p className="text-xs font-extrabold text-[#171A18]">Corridor Location Analytics Unavailable</p>
            <p className="text-[11px] text-[#6B6B63] max-w-xs mx-auto font-medium">
              Location analytics will appear automatically after student bookings &amp; corridor order data are recorded.
            </p>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-[#E5E1D6] mt-2">
            <span className="text-[11px] font-semibold text-[#6B6B63]">Corridors: Junwani, Smriti Nagar, Nehru Nagar, Sector 1-6</span>
          </div>
        </div>
      </div>

      {/* Row 6: Operational Live Feed & Quick Action Dispatch Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#171A18]">Live Operational Dispatch & High-Value Bookings</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#225944]/10 text-[#225944] text-[10px] font-bold uppercase">
                Real-Time Queue
              </span>
            </div>
            <p className="text-xs text-[#6B6B63] mt-0.5">
              Stream of cross-vertical orders awaiting verification, escrow clearing, or warden confirmation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B63] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search Booking ID, Student, or Node..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F8FAF6] border border-[#E5E1D6] pl-9 pr-4 py-2 rounded-xl text-xs text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944] w-64 md:w-80 font-medium"
              />
            </div>
          </div>
        </div>

        {/* High Fidelity Operations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EDEEEB] text-[#6B6B63] text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 rounded-l-xl">Order Ref & Time</th>
                <th className="py-3.5 px-4">Student Resident</th>
                <th className="py-3.5 px-4">Category / Vertical</th>
                <th className="py-3.5 px-4">Partner Provider & Corridor</th>
                <th className="py-3.5 px-4">Value</th>
                <th className="py-3.5 px-4">Live Status</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Quick Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1D6] text-xs font-medium text-[#171A18]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B6B63]">
                    <span className="material-symbols-outlined text-[36px] text-[#c0c9c2] block mb-2">receipt_long</span>
                    <p className="font-bold text-sm text-[#171A18]">No live orders recorded yet.</p>
                    <p className="text-xs text-[#6B6B63] mt-1">Bookings created by students will appear in real time.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F8FAF6] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-[#225944]">{row.id}</div>
                      <div className="text-[10px] text-[#6B6B63]">{row.time}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#171A18]">{row.student}</div>
                      <div className="text-[10px] text-[#6B6B63]">{row.campus}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#225944]/10 text-[#225944] text-[10px] font-bold">
                        <span className="material-symbols-outlined text-[14px]">{row.verticalIcon}</span>
                        <span>{row.vertical}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#171A18]">{row.provider}</div>
                      <div className="text-[10px] text-[#6B6B63]">{row.location}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-[#171A18]">{row.value}</div>
                      <div className="text-[10px] text-[#225944] font-bold">{row.commission}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${row.statusStyle}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{row.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {row.actions === 'verify' && (
                          <button
                            onClick={() => alert(`Verified booking ${row.id}`)}
                            className="px-3 py-1 rounded-full bg-[#225944] text-white font-bold text-[10px] hover:bg-[#184232] transition-all shadow-xs"
                          >
                            Approve
                          </button>
                        )}
                        {row.actions === 'escrow' && (
                          <span className="text-[10px] font-bold text-[#225944]">Escrow Locked</span>
                        )}
                        {row.actions === 'track' && (
                          <button
                            onClick={() => alert(`Tracking laundry rider for ${row.id}`)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 font-bold text-[10px] text-[#171A18] hover:bg-slate-200 transition-all"
                          >
                            Track Hub
                          </button>
                        )}
                        {row.actions === 'neft' && (
                          <button
                            onClick={() => alert(`Checking NEFT UTR for ${row.id}`)}
                            className="px-3 py-1 rounded-full bg-[#225944] text-white font-bold text-[10px] hover:bg-[#184232] transition-all shadow-xs"
                          >
                            Verify UTR
                          </button>
                        )}
                        {row.actions === 'enroute' && (
                          <button
                            onClick={() => alert(`Escalated technician ticket ${row.id}`)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 font-bold text-[10px] text-[#171A18] hover:bg-slate-200 transition-all"
                          >
                            Escalate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Operations Drawer Footer */}
        <div className="pt-2 border-t border-[#E5E1D6] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B6B63] gap-2">
          <span>Showing {filteredBookings.length} Live Orders across Bhilai &amp; Durg Hubs</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Loading previous batch...')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-[#171A18] font-bold hover:bg-slate-200 transition-colors"
            >
              Previous Batch
            </button>
            <button
              onClick={() => alert('Loading next batch...')}
              className="px-3 py-1.5 rounded-xl bg-[#225944] text-white font-bold hover:bg-[#184232] transition-colors"
            >
              Next 20 Live Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
