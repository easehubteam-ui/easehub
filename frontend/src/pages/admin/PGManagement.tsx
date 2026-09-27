import React, { useState, useEffect } from 'react';
import AdminLocationPicker, { LocationFormValues } from '../../components/admin/AdminLocationPicker';
import AddPGModal from '../../components/admin/AddPGModal';
import { pgApi } from '../../services/pgApi';

interface PGProperty {
  id: string;
  code: string;
  name: string;
  gender: 'BOYS' | 'GIRLS' | 'CO-ED';
  image: string;
  verified: boolean;
  corridor: string;
  distance: string;
  landlordName: string;
  landlordPhone: string;
  kycStatus: string;
  occupiedBeds: number;
  totalBeds: number;
  vacantBeds: number;
  roomMatrix: string;
  monthlyRent: number;
  deposit: number;
  amenities: string[];
  curfew: string;
  status: 'active' | 'pending' | 'revision' | 'disabled';
  rating: number;
  reviewCount: number;
  aadhaar: string;
  pan: string;
  bankAccount: string;
  nearGate: string;
  nearHospital: string;
  mapEmbedUrl?: string;
  location?: LocationFormValues;
}

const defaultProperties: PGProperty[] = [];

export const PGManagement: React.FC = () => {
  const [properties, setProperties] = useState<PGProperty[]>(defaultProperties);

  const fetchProperties = async () => {
    try {
      const list = await pgApi.getAll();
      if (Array.isArray(list)) {
        const mapped: PGProperty[] = list.map((p: any) => ({
          id: p._id || p.code,
          code: p.code || '#PG-BH-1001',
          name: p.name,
          gender: (p.gender as any) || 'BOYS',
          image: p.images?.[0] || '',
          verified: p.verified ?? true,
          corridor: p.corridor || p.location?.city || '',
          distance: p.distance || '',
          landlordName: p.landlordName || '',
          landlordPhone: p.landlordPhone || '',
          kycStatus: p.kycStatus || 'Aadhaar Verified',
          occupiedBeds: p.occupiedBeds || 0,
          totalBeds: p.totalBeds || 0,
          vacantBeds: p.vacantBeds || 0,
          roomMatrix: p.roomMatrix || 'Single / Double Sharing',
          monthlyRent: p.monthlyRent || 0,
          deposit: p.deposit || 0,
          amenities: p.amenities || [],
          curfew: p.curfew || '',
          status: p.status || 'active',
          rating: p.rating || 5.0,
          reviewCount: p.reviewCount || 0,
          aadhaar: 'Verified',
          pan: 'Verified',
          bankAccount: 'Bank Verified',
          nearGate: p.distance || '',
          nearHospital: '',
          location: p.location,
        }));
        setProperties(mapped);
      }
    } catch (err) {
      console.error('Failed to load PGs:', err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Drawer & Filter State
  const [selectedPG, setSelectedPG] = useState<PGProperty | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'basic' | 'rooms' | 'media' | 'compliance' | 'reviews'>('basic');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [corridorFilter, setCorridorFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [foodFilter, setFoodFilter] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPG, setNewPG] = useState({
    name: '',
    landlordName: '',
    landlordPhone: '',
    gender: 'BOYS' as const,
    corridor: 'Junwani',
    totalBeds: 30,
    monthlyRent: 6000,
  });

  // Filter logic
  const filteredProperties = properties.filter((pg) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        pg.name.toLowerCase().includes(term) ||
        pg.landlordName.toLowerCase().includes(term) ||
        pg.code.toLowerCase().includes(term) ||
        pg.corridor.toLowerCase().includes(term);
      if (!match) return false;
    }

    if (corridorFilter !== 'all') {
      if (!pg.corridor.toLowerCase().includes(corridorFilter.replace('-', ' '))) return false;
    }

    if (genderFilter !== 'all') {
      if (pg.gender.toLowerCase() !== genderFilter.toLowerCase()) return false;
    }

    if (statusFilter !== 'all') {
      if (pg.status !== statusFilter) return false;
    }

    if (foodFilter && !pg.amenities.includes('restaurant')) return false;

    return true;
  });

  const handleCreatePG = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPG.name || !newPG.landlordName) {
      alert('Please fill in required property details.');
      return;
    }

    const created: PGProperty = {
      id: 'pg-' + Date.now(),
      code: '#PG-BH-' + Math.floor(1000 + Math.random() * 9000),
      name: newPG.name,
      gender: newPG.gender,
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
      verified: true,
      corridor: newPG.corridor,
      distance: '400m to Campus',
      landlordName: newPG.landlordName,
      landlordPhone: newPG.landlordPhone || '+91 98271 00000',
      kycStatus: 'Aadhaar Verified',
      occupiedBeds: 0,
      totalBeds: newPG.totalBeds,
      vacantBeds: newPG.totalBeds,
      roomMatrix: `Double (${newPG.totalBeds})`,
      monthlyRent: newPG.monthlyRent,
      deposit: newPG.monthlyRent,
      amenities: ['wifi', 'restaurant', 'water_drop'],
      curfew: '10:30 PM Curfew',
      status: 'active',
      rating: 5.0,
      reviewCount: 1,
      aadhaar: 'XXXX-XXXX-1234',
      pan: 'ABCDE1234F',
      bankAccount: 'SBI Bhilai • A/C: 3001928311',
      nearGate: '400 meters (5 min walk)',
      nearHospital: '1.0 km',
    };

    setProperties([created, ...properties]);
    setShowAddModal(false);
    setNewPG({
      name: '',
      landlordName: '',
      landlordPhone: '',
      gender: 'BOYS',
      corridor: 'Junwani',
      totalBeds: 30,
      monthlyRent: 6000,
    });
    alert(`Successfully added ${created.name} (${created.code}) to Live Cluster!`);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Code,Name,Gender,Corridor,Landlord,Phone,Rent,Beds,Occupied,Status']
        .concat(
          properties.map(
            (p) =>
              `"${p.code}","${p.name}","${p.gender}","${p.corridor}","${p.landlordName}","${p.landlordPhone}",${p.monthlyRent},${p.totalBeds},${p.occupiedBeds},"${p.status}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EaseHub_PG_Directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs / Primary Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#6B6B63] text-xs font-semibold">
            <span>Campus Housing Ops</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Bhilai-Durg Nodes</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#225944] font-bold">PG & Hostels Directory</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
              PG & Hostel Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#225944]/10 text-[#225944] text-[10px] uppercase font-bold tracking-wider">
              LIVE CLUSTER
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#6B6B63] max-w-4xl">
            Supervise verified student residencies, verify KYC & landlord deed registries, calibrate bed inventories, rent matrices, and track realtime occupancy across Bhilai-Durg educational corridors (BIT Durg, Junwani, Smriti Nagar, Nehru Nagar, Civic Center).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#171A18] hover:bg-slate-100 transition-all border border-[#E5E1D6] font-bold text-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => alert('Batch Audit Initiated: Scanning 186 PG properties against municipal guidelines...')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#171A18] hover:bg-slate-100 transition-all border border-[#E5E1D6] font-bold text-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">rule_folder</span>
            <span>Batch Audit</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#225944] text-white hover:bg-[#184232] transition-all font-bold text-xs shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>+ Add New PG / Hostel</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metrics Cards (Bento Metric Strip) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D6] shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6B63]">Total Registered Units</span>
            <div className="w-9 h-9 rounded-xl bg-[#225944]/10 text-[#225944] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">domain</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#171A18]">{properties.length + 181}</span>
            <span className="text-xs text-[#225944] font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>+8 this month
            </span>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between text-[11px] font-bold bg-[#F8FAF6] rounded-xl px-3 py-1.5 border border-[#E5E1D6]">
            <span className="flex items-center gap-1 text-[#225944]">
              <span className="w-2 h-2 rounded-full bg-[#225944]"></span>142 Active
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>26 Audit
            </span>
            <span className="flex items-center gap-1 text-[#6B6B63]">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>18 Off
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D6] shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6B63]">Bed Inventory & Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">hotel</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#171A18]">3,420</span>
            <span className="text-xs font-bold text-[#6B6B63]">Beds Total</span>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#225944]">3,221 Occupied (94.2%)</span>
              <span className="text-[#6B6B63]">199 Beds Vacant</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#225944] h-full rounded-full transition-all duration-700" style={{ width: '94.2%' }}></div>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D6] shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6B63]">Avg. Room Tariff & Deposit</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#171A18] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">currency_rupee</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#171A18]">
              ₹6,250<span className="text-xs font-normal text-[#6B6B63]">/mo</span>
            </span>
            <span className="text-xs font-semibold text-[#6B6B63]">Cluster Avg</span>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between text-[11px] font-semibold bg-[#F8FAF6] rounded-xl px-3 py-1.5 border border-[#E5E1D6]">
            <span>Avg Escrow Security: <b className="text-[#171A18] font-bold">₹8,000</b></span>
            <span className="px-1.5 py-0.5 rounded bg-[#225944]/10 text-[#225944] font-bold">0% Comm</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D6] shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6B63]">Verification Backlog</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">26</span>
            <span className="text-xs font-semibold text-[#6B6B63]">Pending Approval</span>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold bg-rose-50 rounded-xl px-3 py-1.5 text-rose-800 border border-rose-200">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">priority_high</span>9 Urgent (&lt; 24h SLA)
            </span>
            <button onClick={() => setStatusFilter('pending')} className="underline font-extrabold hover:text-rose-900">
              Audit Now
            </button>
          </div>
        </div>
      </div>

      {/* Smart Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E1D6] shadow-xs flex flex-col gap-3">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B63] text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by PG name, landlord, mobile, corridor, or reg ID (e.g. Junwani, BIT Durg, PG-BH-1042)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs text-[#171A18] placeholder-[#6B6B63] focus:outline-none focus:ring-2 focus:ring-[#225944] font-medium"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={corridorFilter}
              onChange={(e) => setCorridorFilter(e.target.value)}
              className="bg-[#F8FAF6] border border-[#E5E1D6] px-3 py-2.5 rounded-xl text-xs font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944] cursor-pointer"
            >
              <option value="all">All Corridors (186)</option>
              <option value="junwani">Junwani (BIT Corridor)</option>
              <option value="smriti-nagar">Smriti Nagar Hub</option>
              <option value="nehru-nagar">Nehru Nagar (SSGI Axis)</option>
              <option value="civic-center">Civic Center Central</option>
              <option value="durg">Durg Node</option>
            </select>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-[#F8FAF6] border border-[#E5E1D6] px-3 py-2.5 rounded-xl text-xs font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944] cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="girls">Girls Hostel</option>
              <option value="boys">Boys Hostel</option>
              <option value="co-ed">Co-ed Living</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F8FAF6] border border-[#E5E1D6] px-3 py-2.5 rounded-xl text-xs font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Verified & Live</option>
              <option value="pending">Pending Audit (26)</option>
              <option value="revision">Revision Requested</option>
              <option value="disabled">Disabled / Hold</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E5E1D6] text-xs font-semibold text-[#6B6B63]">
          <div className="flex flex-wrap items-center gap-2">
            <span>Quick Filters:</span>
            <button
              onClick={() => setFoodFilter(!foodFilter)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                foodFilter ? 'bg-[#225944] text-white shadow-xs' : 'bg-slate-100 text-[#171A18] hover:bg-slate-200'
              }`}
            >
              With Food Included
            </button>
            <button
              onClick={() => setSearchTerm('6000')}
              className="px-3 py-1 rounded-full bg-slate-100 text-[#171A18] hover:bg-slate-200 transition-all"
            >
              Under ₹6,000/mo
            </button>
            <button
              onClick={() => setSearchTerm('BIT')}
              className="px-3 py-1 rounded-full bg-slate-100 text-[#171A18] hover:bg-slate-200 transition-all"
            >
              &lt; 500m to BIT Gate
            </button>
          </div>

          <div>
            Showing <strong className="text-[#171A18]">{filteredProperties.length}</strong> of {properties.length} residencies
          </div>
        </div>
      </div>

      {/* Main Master Table with Inspection Drawer */}
      <div className="flex flex-col xl:flex-row gap-6 items-start w-full relative">
        {/* Table Section */}
        <div className="w-full flex-1 bg-white rounded-2xl border border-[#E5E1D6] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EDEEEB] text-[#6B6B63] text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Residency & Media</th>
                  <th className="py-3.5 px-4">Landlord / KYC</th>
                  <th className="py-3.5 px-4">Room Matrix & Beds</th>
                  <th className="py-3.5 px-4">Monthly Tariff</th>
                  <th className="py-3.5 px-4">Amenities & Curfew</th>
                  <th className="py-3.5 px-4">Listing Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D6] text-xs font-medium text-[#171A18]">
                {filteredProperties.map((pg) => (
                  <tr
                    key={pg.id}
                    onClick={() => setSelectedPG(pg)}
                    className={`hover:bg-[#F8FAF6] transition-colors cursor-pointer ${
                      selectedPG?.id === pg.id ? 'bg-amber-50/60' : ''
                    }`}
                  >
                    <td className="py-4 px-4 min-w-[280px]">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-xs">
                          <img src={pg.image} alt={pg.name} className="w-full h-full object-cover" />
                          <span
                            className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold text-white ${
                              pg.gender === 'BOYS'
                                ? 'bg-[#225944]'
                                : pg.gender === 'GIRLS'
                                ? 'bg-amber-600'
                                : 'bg-purple-600'
                            }`}
                          >
                            {pg.gender}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-sm text-[#171A18]">{pg.name}</span>
                            {pg.verified && (
                              <span className="material-symbols-outlined text-[#225944] text-[16px]">verified</span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-[#6B6B63] block">{pg.code}</span>
                          <span className="text-[10px] text-[#6B6B63] flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[12px] text-amber-600">location_on</span>
                            <span>{pg.corridor} • {pg.distance}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 min-w-[190px]">
                      <div>
                        <div className="font-bold text-[#171A18]">{pg.landlordName}</div>
                        <div className="font-mono text-[10px] text-[#6B6B63]">{pg.landlordPhone}</div>
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#225944]/10 text-[#225944]">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          {pg.kycStatus}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 min-w-[200px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#171A18]">
                            {pg.occupiedBeds} / {pg.totalBeds} Beds
                          </span>
                          <span className="font-extrabold text-[10px] px-1.5 py-0.5 rounded bg-[#225944]/10 text-[#225944]">
                            {pg.vacantBeds} VACANT
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#225944] h-full rounded-full"
                            style={{ width: `${Math.round((pg.occupiedBeds / pg.totalBeds) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-[#6B6B63] block truncate">{pg.roomMatrix}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 min-w-[140px]">
                      <div>
                        <div className="text-sm font-extrabold text-[#171A18]">₹{pg.monthlyRent.toLocaleString()}<span className="text-xs font-normal text-[#6B6B63]">/mo</span></div>
                        <div className="text-[10px] text-[#6B6B63]">Deposit: ₹{pg.deposit.toLocaleString()}</div>
                        <span className="text-[9px] font-extrabold text-amber-700 uppercase tracking-wider block mt-0.5">
                          Escrow Protected
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 min-w-[180px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[#225944]">
                          {pg.amenities.map((a, i) => (
                            <span key={i} className="p-1 rounded bg-[#F8FAF6] border border-[#E5E1D6]">
                              <span className="material-symbols-outlined text-[14px]">{a}</span>
                            </span>
                          ))}
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-[#F3F4F0] text-[#171A18] text-[10px] font-bold block w-fit">
                          {pg.curfew}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 min-w-[140px]">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            pg.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pg.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : pg.status === 'revision'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {pg.status}
                        </span>
                        {pg.rating > 0 && (
                          <div className="text-[10px] text-[#6B6B63] mt-1 flex items-center gap-1 font-bold">
                            <span className="material-symbols-outlined text-amber-500 text-[12px]">star</span>
                            <span>{pg.rating} ({pg.reviewCount} reviews)</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right min-w-[130px]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedPG(pg)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-[#225944]"
                          title="Audit Dossier"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit_square</span>
                        </button>
                        <button
                          onClick={() => {
                            setProperties(
                              properties.map((p) =>
                                p.id === pg.id ? { ...p, status: p.status === 'active' ? 'disabled' : 'active' } : p
                              )
                            );
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-[#6B6B63]"
                          title="Toggle Status"
                        >
                          <span className="material-symbols-outlined text-[18px]">pause_circle</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-Out / Inspection Drawer */}
        {selectedPG && (
          <div className="w-full xl:w-[500px] shrink-0 bg-white rounded-2xl border border-[#E5E1D6] shadow-xl flex flex-col overflow-hidden sticky top-20 animate-in fade-in slide-in-from-right-4">
            {/* Drawer Header */}
            <div className="p-4 bg-[#F8FAF6] border-b border-[#E5E1D6] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#225944]/10 text-[#225944] text-[10px] font-extrabold uppercase">
                    AUDIT DOSSIER
                  </span>
                  <span className="font-mono text-xs font-bold text-[#6B6B63]">{selectedPG.code}</span>
                </div>
                <h3 className="font-extrabold text-lg text-[#171A18] mt-1">{selectedPG.name}</h3>
                <p className="text-xs text-[#6B6B63] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-600">location_on</span>
                  <span>{selectedPG.corridor} Road, Near BIT Gate 2, Bhilai</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedPG(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-[#6B6B63]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="flex items-center gap-1 px-4 border-b border-[#E5E1D6] bg-white text-xs font-bold overflow-x-auto">
              {(['basic', 'rooms', 'media', 'compliance', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveDrawerTab(tab)}
                  className={`py-2.5 px-3 border-b-2 transition-all uppercase ${
                    activeDrawerTab === tab
                      ? 'border-[#225944] text-[#225944]'
                      : 'border-transparent text-[#6B6B63] hover:text-[#171A18]'
                  }`}
                >
                  {tab === 'basic'
                    ? 'Overview'
                    : tab === 'rooms'
                    ? 'Inventory'
                    : tab === 'media'
                    ? 'Photos'
                    : tab === 'compliance'
                    ? 'Rules'
                    : `Reviews (${selectedPG.rating}★)`}
                </button>
              ))}
            </div>

            {/* Drawer Scrollable Content */}
            <div className="p-4 max-h-[calc(100vh-320px)] overflow-y-auto space-y-4 text-xs">
              {/* TAB 1: Overview & Owner */}
              {activeDrawerTab === 'basic' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between font-bold">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
                      <span>Ready for Auto-Disbursal</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#225944] text-white text-[9px]">ACTIVE</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                    <span className="font-extrabold text-[#171A18] text-xs block">Landlord & Payout Profile</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-[#6B6B63] block">Owner Name</span>
                        <span className="font-bold text-[#171A18]">{selectedPG.landlordName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6B6B63] block">Phone</span>
                        <span className="font-bold text-[#171A18]">{selectedPG.landlordPhone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6B6B63] block">Aadhaar Card</span>
                        <span className="font-mono font-bold text-[#171A18]">{selectedPG.aadhaar} ✓</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6B6B63] block">PAN Card</span>
                        <span className="font-mono font-bold text-[#171A18]">{selectedPG.pan} ✓</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#E5E1D6]">
                      <span className="text-[10px] text-[#6B6B63] block">Bank Account for Escrow</span>
                      <span className="font-mono text-[11px] font-bold text-[#225944]">{selectedPG.bankAccount}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                    <AdminLocationPicker
                      title="Exact Location Setup & Live Map Pin"
                      initialValues={
                        selectedPG.location || {
                          address: `${selectedPG.name}, ${selectedPG.corridor}`,
                          landmark: 'Near BIT Gate 2',
                          city: 'Bhilai',
                          state: 'Chhattisgarh',
                          pincode: '490020',
                          latitude: 21.198409,
                          longitude: 81.332444,
                        }
                      }
                      onSaveLocation={(updatedLocation) => {
                        setProperties(
                          properties.map((p) =>
                            p.id === selectedPG.id ? { ...p, location: updatedLocation } : p
                          )
                        );
                        setSelectedPG({ ...selectedPG, location: updatedLocation });
                        alert(`Exact GPS location saved for ${selectedPG.name}!`);
                      }}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                    <span className="font-extrabold text-[#171A18] text-xs block">GIS Campus Proximity Matrix</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-white border border-[#E5E1D6]">
                        <span className="text-[#6B6B63] block">BIT Durg Main Gate</span>
                        <span className="font-bold text-[#225944]">{selectedPG.nearGate}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#E5E1D6]">
                        <span className="text-[#6B6B63] block">Apollo BSR Hospital</span>
                        <span className="font-bold text-[#171A18]">{selectedPG.nearHospital}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Inventory & Tariff */}
              {activeDrawerTab === 'rooms' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>Single Deluxe AC Room</span>
                      <span className="text-[#225944]">₹8,500 / mo</span>
                    </div>
                    <p className="text-[11px] text-[#6B6B63]">Includes dedicated balcony, attached western washroom, 1.5T AC.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>Double Sharing Non-AC</span>
                      <span className="text-[#225944]">₹5,500 / mo</span>
                    </div>
                    <p className="text-[11px] text-[#6B6B63]">Includes individual wardrobe, high-speed fiber port, desert cooler.</p>
                  </div>
                </div>
              )}

              {/* TAB 3: Photos */}
              {activeDrawerTab === 'media' && (
                <div className="grid grid-cols-2 gap-2">
                  <img src={selectedPG.image} alt="Hostel Room" className="w-full h-28 object-cover rounded-xl border border-[#E5E1D6]" />
                  <img src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80" alt="Hostel Room" className="w-full h-28 object-cover rounded-xl border border-[#E5E1D6]" />
                </div>
              )}

              {/* TAB 4: Rules & Safety */}
              {activeDrawerTab === 'compliance' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] flex justify-between font-bold">
                    <span>Gate Night Curfew</span>
                    <span className="text-[#225944]">{selectedPG.curfew}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] flex justify-between font-bold">
                    <span>24/7 CCTV Cloud Recording</span>
                    <span className="text-emerald-600">ONLINE (8 Cameras)</span>
                  </div>
                </div>
              )}

              {/* TAB 5: Reviews */}
              {activeDrawerTab === 'reviews' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Aman Srivastav (CSE 3rd Yr)</span>
                      <span className="text-amber-500">5.0 ★</span>
                    </div>
                    <p className="text-[#6B6B63] text-[11px]">
                      "Best PG near BIT Durg Gate 2. Owner Ramakant uncle is very cooperative with night gate pass."
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Action Bar */}
            <div className="p-4 bg-[#F8FAF6] border-t border-[#E5E1D6] flex items-center justify-between">
              <button
                onClick={() => {
                  setProperties(properties.map((p) => (p.id === selectedPG.id ? { ...p, status: 'revision' } : p)));
                  setSelectedPG(null);
                }}
                className="px-3 py-2 rounded-xl bg-rose-100 text-rose-800 font-bold hover:bg-rose-200 text-xs"
              >
                Reject / Revise
              </button>

              <button
                onClick={() => {
                  setProperties(properties.map((p) => (p.id === selectedPG.id ? { ...p, status: 'active', verified: true } : p)));
                  setSelectedPG(null);
                  alert(`Published and approved ${selectedPG.name}!`);
                }}
                className="px-5 py-2 rounded-full bg-[#225944] text-white font-bold hover:bg-[#184232] text-xs shadow-md"
              >
                Save & Publish
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Redesigned 4-Step Add New PG / Hostel Modal */}
      <AddPGModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmitPG={async (formData) => {
          try {
            await pgApi.create({
              name: formData.name,
              gender: formData.gender,
              landlordName: formData.landlordName,
              landlordPhone: formData.landlordPhone,
              totalBeds: formData.totalBeds,
              monthlyRent: formData.monthlyRent,
              deposit: formData.deposit,
              corridor: formData.corridor,
              distance: formData.landmark || 'Near BIT Campus',
              amenities: formData.amenities,
              curfew: formData.curfew,
              roomMatrix: formData.roomMatrix,
              images: formData.photos,
              location: {
                address: formData.address,
                landmark: formData.landmark,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                latitude: formData.latitude,
                longitude: formData.longitude,
              },
              status: 'active',
            });
            await fetchProperties();
            setShowAddModal(false);
          } catch (err) {
            console.error('Failed to save PG to database:', err);
            alert('Failed to save PG to database. Please check your admin login session.');
          }
        }}
      />
    </div>
  );
};

export default PGManagement;
