import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../services/bookingApi';

interface OrderBooking {
  id: string;
  timeAgo: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  customerCampus: string;
  parentPhone: string;
  category: 'PG Stay' | 'Meals' | 'Laundry' | 'Service';
  categoryLabel: string;
  serviceName: string;
  providerName: string;
  techOrDriver: string;
  providerPhone: string;
  distanceEta: string;
  address: string;
  roomNode: string;
  amount: number;
  paymentStatus: 'Escrow Held' | 'Paid UPI' | 'COD' | 'Refunded UPI';
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  studentNote: string;
  breakdown: { label: string; amount: string; isDiscount?: boolean }[];
  timeline: { title: string; time: string; done: boolean; active?: boolean }[];
  adminNotes: string[];
}

const defaultOrders: OrderBooking[] = [];

export const Bookings: React.FC = () => {
  const [orders, setOrders] = useState<OrderBooking[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderBooking | null>(null);

  const fetchOrders = async () => {
    try {
      const list = await bookingApi.getBookings();
      if (Array.isArray(list)) {
        const mapped: OrderBooking[] = list.map((b: any) => ({
          id: b.bookingNumber || b._id || b.id,
          timeAgo: 'Recently',
          timestamp: b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : '—',
          customerName: b.userName || b.user?.fullName || b.user?.name || '—',
          customerPhone: b.userPhone || b.user?.phone || '—',
          customerCampus: b.user?.city || '—',
          parentPhone: '—',
          category: (b.serviceType as any) || 'PG Stay',
          categoryLabel: b.serviceType || 'Service',
          serviceName: b.roomType || b.serviceName || '—',
          providerName: b.vendor || b.serviceName || '—',
          techOrDriver: b.vendor ? `Assigned: ${b.vendor}` : 'Pending Assignment',
          providerPhone: '—',
          distanceEta: '—',
          address: b.address || '—',
          roomNode: b.roomType || '—',
          amount: b.amount || 0,
          paymentStatus: b.paymentStatus === 'verified' ? 'Paid UPI' : 'Escrow Held',
          status: (b.status || 'pending') as any,
          studentNote: b.description || '—',
          breakdown: [{ label: 'Total Amount:', amount: `₹${b.amount || 0}` }],
          timeline: [{ title: `Status: ${b.status || 'pending'}`, time: b.createdAt ? new Date(b.createdAt).toLocaleTimeString() : '—', done: true }],
          adminNotes: [],
        }));
        setOrders(mapped);
        if (mapped.length > 0) {
          setSelectedOrder(mapped[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeVertical, setActiveVertical] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSelectOrder = (order: OrderBooking) => {
    setSelectedOrder(order);
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedOrder) return;
    const updated = orders.map((o) =>
      o.id === selectedOrder.id ? { ...o, adminNotes: [...o.adminNotes, newNote.trim()] } : o
    );
    setOrders(updated);
    setSelectedOrder({ ...selectedOrder, adminNotes: [...selectedOrder.adminNotes, newNote.trim()] });
    setNewNote('');
    setToastMsg('Internal staff note added to dispatch log!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Order ID,Customer,Phone,Campus,Category,Service,Provider,Amount,Payment Status,Fulfillment Status']
        .concat(
          orders.map(
            (o) =>
              `${o.id},"${o.customerName}",${o.customerPhone},"${o.customerCampus}",${o.category},"${o.serviceName}","${o.providerName}",${o.amount},${o.paymentStatus},${o.status}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EaseHub_Central_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg('Exported Central Bookings CSV successfully!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleReleaseEscrow = () => {
    if (!selectedOrder) return;
    const updated = orders.map((o) =>
      o.id === selectedOrder.id ? { ...o, status: 'completed' as const, paymentStatus: 'Paid UPI' as const } : o
    );
    setOrders(updated);
    setSelectedOrder({ ...selectedOrder, status: 'completed', paymentStatus: 'Paid UPI' });
    setToastMsg(`OTP Verified! Released escrow payout of ₹${selectedOrder.amount} to ${selectedOrder.providerName}.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCancelRefund = () => {
    if (!selectedOrder) return;
    const updated = orders.map((o) =>
      o.id === selectedOrder.id ? { ...o, status: 'cancelled' as const, paymentStatus: 'Refunded UPI' as const } : o
    );
    setOrders(updated);
    setSelectedOrder({ ...selectedOrder, status: 'cancelled', paymentStatus: 'Refunded UPI' });
    setToastMsg(`Cancelled ${selectedOrder.id} & issued full refund to ${selectedOrder.customerName}.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Filtering
  const filteredOrders = orders.filter((o) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'pending'
        ? o.status === 'pending'
        : activeTab === 'confirmed'
        ? o.status === 'confirmed'
        : activeTab === 'assigned'
        ? o.status === 'assigned'
        : activeTab === 'in_progress'
        ? o.status === 'in_progress'
        : activeTab === 'completed'
        ? o.status === 'completed'
        : activeTab === 'cancelled'
        ? o.status === 'cancelled'
        : true;

    const matchesVertical =
      activeVertical === 'all'
        ? true
        : activeVertical === 'pg'
        ? o.category === 'PG Stay'
        : activeVertical === 'meals'
        ? o.category === 'Meals'
        : activeVertical === 'laundry'
        ? o.category === 'Laundry'
        : activeVertical === 'service'
        ? o.category === 'Service'
        : true;

    const query = searchQuery.toLowerCase();
    const matchesQuery =
      o.id.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.customerPhone.toLowerCase().includes(query) ||
      o.serviceName.toLowerCase().includes(query) ||
      o.providerName.toLowerCase().includes(query) ||
      o.address.toLowerCase().includes(query);

    return matchesTab && matchesVertical && matchesQuery;
  });

  const totalGMV = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="space-y-6 text-[#191c1a]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-[#02412e] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-[#fcd747]">check_circle</span>
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Top Operational Banner & Breadcrumb Area */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-[#707973] font-medium">
          <span>Campus Operations Hub</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Central Fulfillment Engine</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#02412e] font-bold">Bookings &amp; Dispatch</span>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1a] tracking-tight">
                Central Bookings &amp; Orders Management
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#225944] text-white text-[11px] font-bold tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#fcd747] animate-ping"></span>
                <span>REALTIME SYNC • {orders.length} ORDERS TOTAL</span>
              </span>
            </div>
            <p className="text-sm text-[#404944] mt-1 max-w-3xl">
              Unified dispatch console across student PGs, daily tiffin subscriptions, 24-hr laundry pickups, and doorstep technicians in Bhilai &amp; Durg.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-full bg-[#edeeeb] hover:bg-[#e1e3df] text-[#191c1a] font-semibold text-xs transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-[#02412e]">cloud_download</span>
              <span>Export Orders CSV</span>
            </button>
            <button
              onClick={() => {
                setToastMsg('Escrow Settlement Run completed!');
                setTimeout(() => setToastMsg(null), 3500);
              }}
              className="px-4 py-2.5 rounded-full bg-[#edeeeb] hover:bg-[#e1e3df] text-[#191c1a] font-semibold text-xs transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-[#02412e]">account_balance</span>
              <span>Escrow Settlement Run</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#225944] hover:bg-[#02412e] text-white font-bold text-xs transition shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Manual Offline Order Booking</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Live Ribbon (4 Bento Strip Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Gross GMV Total</span>
            <div className="w-9 h-9 rounded-xl bg-[#225944]/10 text-[#02412e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#191c1a]">₹{totalGMV.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-xs text-[#707973] font-medium mt-1">Escrow System Active</div>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Active Dispatch Nodes</span>
            <div className="w-9 h-9 rounded-xl bg-[#fcd747]/20 text-[#715d00] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">near_me</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#191c1a]">{orders.filter(o => o.status === 'assigned' || o.status === 'in_progress').length} Active</span>
            </div>
            <div className="text-xs text-[#707973] font-medium mt-1">Live telemetry sync</div>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Escrow Security Rate</span>
            <div className="w-9 h-9 rounded-xl bg-[#225944]/10 text-[#02412e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#191c1a]">100% Guard</span>
              <span className="text-xs font-bold text-[#02412e]">Dual OTP</span>
            </div>
            <div className="text-xs text-[#707973] font-medium mt-1">Zero auto-leak incidents</div>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-[#fcd747]/20 text-[#715d00] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#191c1a]">{orders.length}</span>
              <span className="text-xs font-bold text-[#02412e]">Verified</span>
            </div>
            <div className="text-xs text-[#707973] font-medium mt-1">Database driven</div>
          </div>
        </div>
      </div>

      {/* Workflow Status Tabs */}
      <div className="bg-[#f8faf6] rounded-2xl p-2 border border-[#c0c9c2]/50 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: 'all', label: 'All', count: orders.length },
            { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'bg-amber-500/20 text-amber-800' },
            { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length, color: 'bg-[#edeeeb] text-[#191c1a]' },
            { id: 'assigned', label: 'Assigned', count: orders.filter(o => o.status === 'assigned').length, color: 'bg-[#edeeeb] text-[#191c1a]' },
            { id: 'in_progress', label: 'In Progress', count: orders.filter(o => o.status === 'in_progress').length, color: 'bg-[#225944]/10 text-[#02412e]' },
            { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length, color: 'bg-emerald-500/10 text-emerald-800' },
            { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, color: 'bg-rose-500/10 text-rose-800' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isActive ? 'bg-[#225944] text-white shadow-sm' : 'text-[#404944] hover:bg-[#edeeeb]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : tab.color || 'bg-[#edeeeb] text-[#707973]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Filter & Search Toolbar */}
      <div className="bg-[#f8faf6] rounded-2xl p-4 border border-[#c0c9c2]/50 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#707973] text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search by Order ID (#EH-26-XXXX), student name, phone, PG room, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#edeeeb] rounded-xl text-xs text-[#191c1a] placeholder:text-[#707973] focus:outline-none focus:ring-2 focus:ring-[#225944]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Vertical Dropdown */}
          <select
            value={activeVertical}
            onChange={(e) => setActiveVertical(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#edeeeb] text-xs font-bold text-[#191c1a] focus:outline-none focus:ring-2 focus:ring-[#225944] cursor-pointer"
          >
            <option value="all">All Verticals (PG Stays, Meals, Laundry, Services)</option>
            <option value="pg">Hostels &amp; PG Rentals</option>
            <option value="meals">Daily Tiffin &amp; Mess Meals</option>
            <option value="laundry">Laundry &amp; Dry Cleaning</option>
            <option value="service">Home &amp; Room Repairs</option>
          </select>

          {/* Refresh / Reset Button */}
          <button
            onClick={() => {
              setActiveTab('all');
              setActiveVertical('all');
              setSearchQuery('');
              setToastMsg('Filters reset to default view.');
              setTimeout(() => setToastMsg(null), 2500);
            }}
            title="Reset Filters"
            className="w-10 h-10 rounded-xl bg-[#edeeeb] hover:bg-[#e1e3df] text-[#404944] flex items-center justify-center transition"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Primary Split Grid: Master Table (Left/Center) + Dossier (Right Panel) */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
        {/* Master Orders Table Section (7 Columns) */}
        <div className="2xl:col-span-7 space-y-4">
          <div className="bg-[#f8faf6] rounded-2xl border border-[#c0c9c2]/50 shadow-sm overflow-hidden flex flex-col">
            {/* Table Header Info Bar */}
            <div className="p-4 border-b border-[#c0c9c2]/40 bg-[#edeeeb]/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm text-[#191c1a]">Active Dispatch Stream</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e1e3df] text-[#404944] font-bold text-[10px]">
                  {filteredOrders.length} Visible / {orders.length} Total
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#707973] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#02412e]"></span>
                <span>Live Telemetry Auto-updating</span>
              </div>
            </div>

            {/* Table Responsive Container */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#edeeeb] text-[11px] font-extrabold text-[#707973] uppercase tracking-wider border-b border-[#c0c9c2]/40">
                    <th className="py-3 px-4">Order ID &amp; Time</th>
                    <th className="py-3 px-4">Customer / Student</th>
                    <th className="py-3 px-4">Service &amp; Item</th>
                    <th className="py-3 px-4">Provider / Vendor</th>
                    <th className="py-3 px-4">Address / Node</th>
                    <th className="py-3 px-4">Amount &amp; Status</th>
                    <th className="py-3 px-4">Fulfillment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c0c9c2]/30 text-xs">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#707973]">
                        <span className="material-symbols-outlined text-[36px] text-[#c0c9c2] block mb-2">receipt_long</span>
                        <p className="font-bold text-sm text-[#191c1a]">No bookings or orders recorded yet.</p>
                        <p className="text-xs text-[#707973] mt-1">Real student bookings created via the platform will appear here in real time.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((row) => {
                      const isSelected = selectedOrder?.id === row.id;
                      return (
                        <tr
                          key={row.id}
                          onClick={() => handleSelectOrder(row)}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-[#225944]/10 border-l-4 border-[#02412e]' : 'hover:bg-[#edeeeb]/50'
                          }`}
                        >
                          <td className="py-3.5 px-4 align-top">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#02412e] font-mono flex items-center gap-1">
                                {row.id}
                                <span className="w-1.5 h-1.5 rounded-full bg-[#02412e]"></span>
                              </span>
                              <span className="text-[10px] text-[#707973]">{row.timeAgo}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#191c1a]">{row.customerName}</span>
                              <span className="text-[10px] text-[#707973] font-mono">{row.customerPhone}</span>
                              <span className="text-[10px] text-[#404944]">{row.customerCampus}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#191c1a] max-w-[160px] truncate">{row.serviceName}</span>
                              <span className="text-[10px] text-[#707973]">{row.categoryLabel}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#191c1a]">{row.providerName}</span>
                              <span className="text-[10px] text-[#02412e] font-semibold">{row.techOrDriver}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="flex flex-col max-w-[130px]">
                              <span className="font-semibold text-[#191c1a] truncate">{row.address}</span>
                              <span className="text-[10px] text-[#707973] truncate">{row.roomNode}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-[#191c1a]">₹{row.amount}</span>
                              <span className="text-[10px] text-[#02412e] font-bold">{row.paymentStatus}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                row.status === 'in_progress'
                                  ? 'bg-[#225944]/10 text-[#02412e]'
                                  : row.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-800'
                                  : row.status === 'assigned'
                                  ? 'bg-amber-500/10 text-amber-800'
                                  : row.status === 'cancelled'
                                  ? 'bg-rose-500/10 text-rose-800'
                                  : 'bg-[#edeeeb] text-[#404944]'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  row.status === 'in_progress'
                                    ? 'bg-[#02412e] animate-pulse'
                                    : row.status === 'completed'
                                    ? 'bg-emerald-600'
                                    : 'bg-amber-600'
                                }`}
                              ></span>
                              {row.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 align-top text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectOrder(row);
                                }}
                                className={`p-1.5 rounded-lg transition ${
                                  isSelected ? 'bg-[#02412e] text-white' : 'text-[#707973] hover:bg-[#e1e3df]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 bg-[#edeeeb]/60 border-t border-[#c0c9c2]/40 flex items-center justify-between">
              <span className="text-xs text-[#707973]">Showing {filteredOrders.length > 0 ? 1 : 0} - {filteredOrders.length} of {orders.length} orders</span>
            </div>
          </div>
        </div>

        {/* Detailed Booking Dossier (Right Side Inspection Panel - 5 Columns) */}
        <div className="2xl:col-span-5 space-y-4">
          {!selectedOrder ? (
            <div className="bg-[#f8faf6] rounded-2xl border border-[#c0c9c2]/50 shadow-md p-8 text-center space-y-3">
              <span className="material-symbols-outlined text-[42px] text-[#c0c9c2]">info</span>
              <h3 className="text-base font-bold text-[#191c1a]">No Order Selected</h3>
              <p className="text-xs text-[#707973]">Select an order from the dispatch stream to inspect customer details, financial escrow, and audit trail.</p>
            </div>
          ) : (
            <div className="bg-[#f8faf6] rounded-2xl border border-[#c0c9c2]/50 shadow-md p-5 space-y-5 relative overflow-hidden">
              {/* Ambient Header Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#02412e] via-[#225944] to-[#fcd747]"></div>

              {/* Dossier Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#c0c9c2]/40">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-[#191c1a]">{selectedOrder.id}</h2>
                    <button
                      onClick={() => {
                        if (selectedOrder) {
                          navigator.clipboard.writeText(selectedOrder.id);
                          setToastMsg('Copied Order Reference ID!');
                          setTimeout(() => setToastMsg(null), 2000);
                        }
                      }}
                      title="Copy Order Reference"
                      className="text-[#707973] hover:text-[#02412e] transition"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                  </div>
                <div className="flex items-center gap-2 text-xs text-[#707973] mt-0.5">
                  <span>{selectedOrder.timestamp}</span>
                  <span>•</span>
                  <span className="text-[#02412e] font-bold">{selectedOrder.timeAgo}</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#225944] text-white text-xs font-extrabold uppercase shadow-sm">
                {selectedOrder.status.replace('_', ' ')}
              </span>
            </div>

            {/* Section 1: Customer Profile */}
            <div className="bg-[#edeeeb] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-[#707973] uppercase tracking-wider">
                <span>STUDENT CUSTOMER</span>
                <span className="px-2 py-0.5 rounded-full bg-[#225944]/10 text-[#02412e] font-bold">BIT Durg Verified</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#02412e] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedOrder.customerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#191c1a]">{selectedOrder.customerName}</div>
                    <div className="text-xs text-[#707973]">{selectedOrder.customerCampus}</div>
                    <div className="text-[10px] text-[#707973] mt-0.5">Parent Phone: {selectedOrder.parentPhone}</div>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-[#02412e] text-white font-bold text-xs hover:bg-[#225944] transition flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Section 2: Service & Issue Specification */}
            <div className="bg-[#edeeeb] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-[#707973] uppercase tracking-wider">
                <span>SERVICE SPECIFICATION</span>
                <span className="text-[#02412e] font-bold">{selectedOrder.categoryLabel}</span>
              </div>
              <div className="font-bold text-sm text-[#191c1a]">{selectedOrder.serviceName}</div>
              {selectedOrder.studentNote && (
                <div className="p-2.5 rounded-lg bg-white text-xs text-[#404944] border border-[#c0c9c2]/50">
                  <strong className="text-[#191c1a]">Student Note: </strong>
                  "{selectedOrder.studentNote}"
                </div>
              )}
            </div>

            {/* Section 3: Assigned Provider & Live Telemetry */}
            <div className="bg-[#edeeeb] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-[#707973] uppercase tracking-wider">
                <span>ASSIGNED DISPATCH PARTNER</span>
                <span className="px-2 py-0.5 rounded-full bg-[#225944]/10 text-[#02412e] font-bold">Background Checked</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[#191c1a]">{selectedOrder.providerName}</div>
                  <div className="text-xs text-[#02412e] font-semibold">{selectedOrder.techOrDriver}</div>
                  <div className="text-[10px] font-mono text-[#707973]">{selectedOrder.providerPhone}</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-[#fcd747]/30 text-[#715d00] text-xs font-bold">
                    {selectedOrder.distanceEta}
                  </span>
                </div>
              </div>

              {/* Address Text */}
              <div className="pt-2 border-t border-[#c0c9c2]/40 text-xs text-[#404944] flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#02412e] shrink-0">location_on</span>
                <div>
                  <strong className="text-[#191c1a]">{selectedOrder.address}</strong> — {selectedOrder.roomNode}
                </div>
              </div>
            </div>

            {/* Section 4: Financial Breakdown & Escrow Vault */}
            <div className="bg-[#edeeeb] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-[#707973] uppercase tracking-wider">
                <span>FINANCIALS &amp; ESCROW VAULT</span>
                <span className="text-[#02412e] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span> Dual OTP Guard
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-[#191c1a]">
                {selectedOrder.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className={item.isDiscount ? 'text-[#02412e] font-bold' : 'text-[#707973]'}>{item.label}</span>
                    <span className={item.isDiscount ? 'text-[#02412e] font-bold' : 'font-semibold'}>{item.amount}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#c0c9c2]/40 flex justify-between text-sm font-extrabold text-[#191c1a]">
                  <span>Total Payable:</span>
                  <span className="text-[#02412e]">₹{selectedOrder.amount}</span>
                </div>
              </div>
            </div>

            {/* Section 5: Lifecycle Audit Trail */}
            <div className="bg-[#edeeeb] rounded-xl p-4 space-y-3">
              <span className="text-[11px] font-extrabold text-[#707973] uppercase tracking-wider block">LIFECYCLE AUDIT TRAIL</span>
              <div className="space-y-3 pl-2 border-l-2 border-[#c0c9c2]">
                {selectedOrder.timeline.map((step, idx) => (
                  <div key={idx} className="pl-3 relative">
                    <div
                      className={`w-2.5 h-2.5 rounded-full absolute -left-[17px] top-1 ${
                        step.active
                          ? 'bg-[#fcd747] ring-4 ring-[#edeeeb] animate-pulse'
                          : step.done
                          ? 'bg-[#02412e]'
                          : 'bg-[#c0c9c2]'
                      }`}
                    />
                    <div className={`text-xs font-bold ${step.active ? 'text-[#715d00]' : 'text-[#191c1a]'}`}>{step.title}</div>
                    <div className="text-[10px] text-[#707973]">{step.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Internal Admin Dispatch Log */}
            <div className="bg-[#edeeeb] rounded-xl p-4 space-y-3">
              <span className="text-[11px] font-extrabold text-[#707973] uppercase tracking-wider block">ADMIN DISPATCH LOG</span>
              {selectedOrder.adminNotes.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedOrder.adminNotes.map((note, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white text-xs text-[#404944] border border-[#c0c9c2]/40">
                      "{note}"
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#707973] italic">No staff notes logged for this dispatch yet.</div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Type staff note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg text-xs text-[#191c1a] border border-[#c0c9c2]/60 focus:outline-none focus:border-[#02412e]"
                />
                <button
                  onClick={handleAddNote}
                  className="px-3 py-1.5 rounded-lg bg-[#225944] hover:bg-[#02412e] text-white font-bold text-xs transition"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="pt-3 border-t border-[#c0c9c2]/40 space-y-2">
              <button
                onClick={handleReleaseEscrow}
                className="w-full py-3 rounded-xl bg-[#02412e] hover:bg-[#225944] text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Verify OTP &amp; Release Escrow</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setToastMsg(`Reassigned dispatch provider for ${selectedOrder.id}`);
                    setTimeout(() => setToastMsg(null), 3000);
                  }}
                  className="py-2.5 rounded-xl bg-[#edeeeb] hover:bg-[#e1e3df] text-[#191c1a] font-semibold text-xs transition"
                >
                  Reassign Provider
                </button>
                <button
                  onClick={handleCancelRefund}
                  className="py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 font-semibold text-xs transition"
                >
                  Cancel &amp; Refund
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Manual Offline Order Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f8faf6] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#c0c9c2]/50 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#c0c9c2]/40 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#191c1a]">Create Manual Offline Order</h3>
                <p className="text-xs text-[#707973]">Manually book an order for students or phone requests</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#edeeeb] text-[#707973] hover:text-[#191c1a] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
                setToastMsg('Manual order created and synced to active dispatch stream!');
                setTimeout(() => setToastMsg(null), 3500);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[#404944] mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singh"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#c0c9c2]/60 focus:outline-none focus:border-[#02412e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#404944] mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98271 XXXXX"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[#c0c9c2]/60 focus:outline-none focus:border-[#02412e]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#404944] mb-1">Service Category</label>
                  <select className="w-full px-3 py-2 bg-white rounded-xl border border-[#c0c9c2]/60 focus:outline-none focus:border-[#02412e]">
                    <option>PG Stay</option>
                    <option>Meals &amp; Mess</option>
                    <option>Laundry Service</option>
                    <option>Home &amp; Room Repair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#404944] mb-1">Service Item Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15-Day Flexible Tiffin Subscription"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#c0c9c2]/60 focus:outline-none focus:border-[#02412e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#404944] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="1200"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[#c0c9c2]/60 focus:outline-none focus:border-[#02412e]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#404944] mb-1">Payment Method</label>
                  <select className="w-full px-3 py-2 bg-white rounded-xl border border-[#c0c9c2]/60 focus:outline-none focus:border-[#02412e]">
                    <option>Escrow Held (Razorpay)</option>
                    <option>Paid UPI Online</option>
                    <option>Cash on Arrival (COD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#404944] mb-1">Delivery Address &amp; Hostel Room</label>
                <input
                  type="text"
                  required
                  placeholder="Room 204, Royal Boys PG, Junwani Road, Bhilai"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#c0c9c2]/60 focus:outline-none focus:border-[#02412e]"
                />
              </div>

              <div className="pt-4 border-t border-[#c0c9c2]/40 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#edeeeb] text-[#404944] font-bold hover:bg-[#e1e3df] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#02412e] text-white font-bold hover:bg-[#225944] transition shadow-md"
                >
                  Create &amp; Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
