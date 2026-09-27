import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import AddLaundryModal, { LaundryFormData } from '../../components/admin/AddLaundryModal';
import { laundryApi } from '../../services/laundryApi';

interface LaundryOrder {
  id: string;
  customerName: string;
  roomNo: string;
  weight: string;
  stage: 'Scheduled' | 'Picked Up' | 'In Wash' | 'Ready' | 'Delivered';
  vendor: string;
  requestedAt: string;
}

interface LaundryPartner {
  id: string;
  code: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  pricePerKg: number;
  steamIronPerPc: number;
  turnaroundHours: number;
  corridor: string;
  status: 'active' | 'pending' | 'paused';
}

const defaultPartners: LaundryPartner[] = [];

export const LaundryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'partners'>('orders');
  const [showAddModal, setShowAddModal] = useState(false);
  const [partners, setPartners] = useState<LaundryPartner[]>([]);

  const fetchPartners = async () => {
    try {
      const list = await laundryApi.getAll();
      if (Array.isArray(list)) {
        const mapped: LaundryPartner[] = list.map((l: any) => ({
          id: l._id || l.code,
          code: l.code || '#LND-BH-101',
          name: l.name,
          ownerName: l.ownerName || 'Vendor',
          ownerPhone: l.phone || '',
          pricePerKg: l.perKgPrice || l.pricePerKg || 0,
          steamIronPerPc: l.steamIronPerPc || l.perPairIronPrice || 0,
          turnaroundHours: l.turnaroundHours || 24,
          corridor: l.corridor || '',
          status: l.status || 'active',
        }));
        setPartners(mapped);
      }
    } catch (err) {
      console.error('Failed to load laundry partners:', err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const [orders, setOrders] = useState<LaundryOrder[]>([
    {
      id: 'LND-501',
      customerName: 'Amit Kumar',
      roomNo: 'Room #204, Royal Boys PG',
      weight: '12 kg (Steam Wash + Iron)',
      stage: 'In Wash',
      vendor: 'Campus Express Laundry',
      requestedAt: '2026-09-24 08:30 AM',
    },
    {
      id: 'LND-502',
      customerName: 'Priya Sharma',
      roomNo: 'Room #102, Sunshine Girls',
      weight: '8 kg (Wash & Fold)',
      stage: 'Delivered',
      vendor: 'Campus Express Laundry',
      requestedAt: '2026-09-23 03:15 PM',
    },
    {
      id: 'LND-503',
      customerName: 'Rahul Verma',
      roomNo: 'Room #305, Green Villa',
      weight: '15 kg (Heavy Blanket Wash)',
      stage: 'Scheduled',
      vendor: 'Campus Express Laundry',
      requestedAt: '2026-09-24 10:00 AM',
    },
  ]);

  const updateStage = (id: string, newStage: LaundryOrder['stage']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, stage: newStage } : o))
    );
  };

  const handleDeleteLaundry = async (p: LaundryPartner) => {
    if (window.confirm(`Are you sure you want to delete laundry partner "${p.name}"?`)) {
      try {
        await laundryApi.delete(p.id);
        await fetchPartners();
      } catch (err: any) {
        console.error('Failed to delete laundry partner:', err);
        alert(err.message || 'Failed to delete laundry partner.');
      }
    }
  };

  const handleAddLaundrySubmit = async (data: LaundryFormData) => {
    try {
      await laundryApi.create({
        name: data.name,
        ownerName: data.ownerName,
        phone: data.ownerPhone,
        pricePerKg: data.pricePerKg,
        steamIronPerPc: data.steamIronPerPc,
        turnaroundHours: data.turnaroundHours,
        corridor: data.corridor,
        status: data.status,
      });
      await fetchPartners();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create laundry partner:', err);
      alert('Failed to save laundry partner to database. Please check your admin login session.');
    }
  };

  const orderColumns: Column<LaundryOrder>[] = [
    {
      key: 'id',
      header: 'Pickup Ticket',
      render: (item) => <span className="font-mono font-bold text-[#225944]">{item.id}</span>,
    },
    {
      key: 'customerName',
      header: 'Student & Hostel Address',
      render: (item) => (
        <div>
          <div className="font-bold text-[#171A18]">{item.customerName}</div>
          <div className="text-[10px] text-[#6B6B63]">{item.roomNo}</div>
        </div>
      ),
    },
    { key: 'weight', header: 'Load Weight & Service' },
    { key: 'vendor', header: 'Assigned Partner' },
    {
      key: 'stage',
      header: 'Order Stage',
      render: (item) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
            item.stage === 'Delivered'
              ? 'bg-emerald-100 text-emerald-800'
              : item.stage === 'In Wash'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {item.stage.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Advance Stage',
      render: (item) => (
        <select
          value={item.stage}
          onChange={(e) => updateStage(item.id, e.target.value as LaundryOrder['stage'])}
          className="px-2.5 py-1 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-bold text-[#171A18] focus:outline-none cursor-pointer"
        >
          <option value="Scheduled">Scheduled</option>
          <option value="Picked Up">Picked Up</option>
          <option value="In Wash">In Wash</option>
          <option value="Ready">Ready</option>
          <option value="Delivered">Delivered</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#6B6B63] text-xs font-semibold">
            <span>Admin</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Services</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#225944] font-bold">Doorstep Laundry</span>
          </div>
          <h1 className="text-2xl font-black text-[#171A18] tracking-tight mt-1">
            Doorstep Laundry Operations
          </h1>
          <p className="text-xs text-[#6B6B63] font-medium">
            Manage student laundry pickup orders, turnaround timelines, and laundry partners.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-full bg-[#225944] text-white font-extrabold text-xs shadow-md hover:bg-[#184232] transition-colors flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Laundry Partner</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] shadow-xs">
          <span className="text-xs text-[#6B6B63] font-bold block">Active Laundry Orders</span>
          <span className="text-2xl font-black text-[#171A18] block mt-1">
            {orders.filter((o) => o.stage !== 'Delivered').length}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">⚡ 24h Avg Turnaround</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] shadow-xs">
          <span className="text-xs text-[#6B6B63] font-bold block">Registered Partners</span>
          <span className="text-2xl font-black text-[#225944] block mt-1">{partners.length}</span>
          <span className="text-[11px] text-[#6B6B63] font-medium mt-0.5 block">Across Bhilai Corridors</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] shadow-xs">
          <span className="text-xs text-[#6B6B63] font-bold block">Completed Today</span>
          <span className="text-2xl font-black text-[#171A18] block mt-1">
            {orders.filter((o) => o.stage === 'Delivered').length}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">100% On-time delivery</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] shadow-xs">
          <span className="text-xs text-[#6B6B63] font-bold block">Base Rate / Kg</span>
          <span className="text-2xl font-black text-[#225944] block mt-1">₹40</span>
          <span className="text-[11px] text-[#6B6B63] font-medium mt-0.5 block">Includes Steam Iron</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#E5E1D6] pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-[#225944] text-white shadow-sm'
              : 'bg-white text-[#6B6B63] border border-[#E5E1D6] hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">local_laundry_service</span>
          <span>Live Pickup Tickets ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('partners')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            activeTab === 'partners'
              ? 'bg-[#225944] text-white shadow-sm'
              : 'bg-white text-[#6B6B63] border border-[#E5E1D6] hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">store</span>
          <span>Laundry Partners ({partners.length})</span>
        </button>
      </div>

      {/* Tab Content 1: Live Orders Table */}
      {activeTab === 'orders' && (
        <DataTable
          title="Doorstep Laundry Operations Tracker"
          subtitle="Monitor student clothes pickup, washing progress, steam ironing, and campus doorstep delivery"
          columns={orderColumns}
          data={orders}
          searchPlaceholder="Search customer or pickup ticket..."
        />
      )}

      {/* Tab Content 2: Registered Laundry Partners Grid */}
      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-[#E5E1D6] shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#225944] block">{p.code}</span>
                  <h3 className="font-extrabold text-sm text-[#171A18] mt-0.5">{p.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleDeleteLaundry(p)}
                    className="p-1 rounded-lg hover:bg-rose-100 text-rose-700 transition"
                    title="Delete Partner"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#6B6B63] block">Rate / Kg:</span>
                  <strong className="text-[#225944] font-black text-sm">₹{p.pricePerKg}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B63] block">Turnaround:</span>
                  <strong className="text-[#171A18] font-bold">{p.turnaroundHours} Hours</strong>
                </div>
              </div>

              <div className="text-xs space-y-1 text-[#6B6B63]">
                <div>Manager: <strong className="text-[#171A18]">{p.ownerName}</strong> ({p.ownerPhone})</div>
                <div>Corridor: <strong className="text-[#171A18]">{p.corridor}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Redesigned Multi-Step Add Laundry Modal */}
      <AddLaundryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmitLaundry={handleAddLaundrySubmit}
      />
    </div>
  );
};

export default LaundryManagement;
