import React, { useState, useEffect } from 'react';
import AddServiceModal, { ServiceFormData } from '../../components/admin/AddServiceModal';
import { serviceApi } from '../../services/serviceApi';

interface ServiceCategory {
  id: string;
  code: string;
  name: string;
  icon: string;
  basePrice: number;
  nightSurge: number;
  extendedLaborRate: string;
  activeTechs: number;
  coverageCorridors: string[];
  slaGuarantee: string;
  slaMins: number;
  status: 'active' | 'pending' | 'disabled';
  description: string;
  demandWeekly: { day: string; count: number }[];
  assignedTechs: { name: string; rating: number; jobs: number; role: string; avatar: string }[];
  customQueriesCount: number;
  rawItem?: any;
}

interface CustomQuery {
  id: string;
  studentName: string;
  location: string;
  timeAgo: string;
  issue: string;
  status: 'pending_quote' | 'tech_assigned' | 'resolved';
}

export const ServicesManagement: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [activeChip, setActiveChip] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Confirmation Modal state for Deactivate / Reactivate
  const [confirmModal, setConfirmModal] = useState<{
    type: 'deactivate' | 'reactivate';
    category: ServiceCategory;
  } | null>(null);

  // Form editable state for inspector
  const [editBasePrice, setEditBasePrice] = useState<number>(0);
  const [editNightSurge, setEditNightSurge] = useState<number>(0);
  const [editSlaMins, setEditSlaMins] = useState<number>(0);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      // includeInactive = true so admin can view and manage both active and inactive records
      const list = await serviceApi.getServices(true);
      if (Array.isArray(list)) {
        const mapped: ServiceCategory[] = list.map((s: any) => ({
          id: s._id || s.id || s.code,
          code: s.code || `#SRV-${(s.id || 'BH101').slice(0, 6)}`,
          name: s.name,
          icon: s.category?.toLowerCase().includes('electric')
            ? 'electric_bolt'
            : s.category?.toLowerCase().includes('plumb')
            ? 'plumbing'
            : s.category?.toLowerCase().includes('clean')
            ? 'cleaning_services'
            : 'build',
          basePrice: s.basePrice || 0,
          nightSurge: 50,
          extendedLaborRate: '₹100 / 30 mins',
          activeTechs: 1,
          coverageCorridors: [s.corridor || s.location?.city || 'Bhilai'],
          slaGuarantee: '45 min Express SLA',
          slaMins: 45,
          status: s.isActive ? 'active' : 'disabled',
          description: s.description || '',
          demandWeekly: [],
          assignedTechs: [],
          customQueriesCount: 0,
          rawItem: s,
        }));
        setCategories(mapped);
        if (mapped.length > 0) {
          // preserve selection if already selected
          const currentSelected = selectedCategory ? mapped.find((m) => m.id === selectedCategory.id) : null;
          const target = currentSelected || mapped[0];
          setSelectedCategory(target);
          setEditBasePrice(target.basePrice);
          setEditNightSurge(target.nightSurge);
          setEditSlaMins(target.slaMins);
        } else {
          setSelectedCategory(null);
        }
      }
    } catch (err: any) {
      console.error('Failed to load services:', err);
      setError('Unable to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const customQueries: CustomQuery[] = [
    { id: 'Q-901', studentName: 'Sneha Patel', location: 'Royal Boys PG, Room 204 (Junwani)', timeAgo: '15m ago', issue: 'Need laptop charger repair & 5-socket surge protector board setup.', status: 'pending_quote' },
    { id: 'Q-902', studentName: 'Rahul Verma', location: 'Green Villa PG, Room 305 (Smriti Nagar)', timeAgo: '42m ago', issue: 'Bicycle front tire valve replacement & chain lubrication.', status: 'tech_assigned' },
    { id: 'Q-903', studentName: 'Priya Sharma', location: 'Sunshine Girls Hostel (Nehru Nagar)', timeAgo: '1h 10m ago', issue: 'Heavy trunk box lifting to 3rd floor room.', status: 'resolved' },
  ];

  const handleSelectCategory = (cat: ServiceCategory) => {
    setSelectedCategory(cat);
    setEditBasePrice(cat.basePrice);
    setEditNightSurge(cat.nightSurge);
    setEditSlaMins(cat.slaMins);
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const executeDeactivate = async (cat: ServiceCategory) => {
    try {
      await serviceApi.deactivate(cat.id);
      setToastMsg(`Deactivated service category: ${cat.name}`);
      await fetchCategories();
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      console.error('Failed to deactivate service:', err);
      alert(err.message || 'Failed to deactivate service category.');
    } finally {
      setConfirmModal(null);
    }
  };

  const executeReactivate = async (cat: ServiceCategory) => {
    try {
      await serviceApi.activate(cat.id);
      setToastMsg(`Reactivated service category: ${cat.name}`);
      await fetchCategories();
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      console.error('Failed to reactivate service:', err);
      alert(err.message || 'Failed to reactivate service category.');
    } finally {
      setConfirmModal(null);
    }
  };

  const handleSaveTariffs = async () => {
    if (!selectedCategory) return;
    try {
      await serviceApi.update(selectedCategory.id, {
        basePrice: editBasePrice,
      });
      setToastMsg(`Saved updated base tariff (₹${editBasePrice}) for ${selectedCategory.name}!`);
      await fetchCategories();
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      alert('Failed to save tariff update to database.');
    }
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Category Code,Category Name,Base Tariff (INR),Night Surge (INR),Active Techs,SLA Guarantee,Status']
        .concat(
          categories.map((c) => `${c.code},"${c.name}",${c.basePrice},${c.nightSurge},${c.activeTechs},"${c.slaGuarantee}",${c.status}`)
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EaseHub_Services_Rate_Card_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg('Exported Rate Card CSV successfully!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddServiceSubmit = async (data: ServiceFormData) => {
    try {
      if (editingCategory) {
        await serviceApi.update(editingCategory.id, {
          name: data.name,
          category: data.category || 'Cleaning',
          basePrice: data.basePrice,
          description: data.description,
          images: data.photos,
          corridor: data.coverageCorridors?.[0] || 'Bhilai',
          isActive: data.status === 'active',
          location: {
            address: data.address,
            landmark: data.landmark || '',
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            latitude: data.latitude,
            longitude: data.longitude,
          },
        });
        setToastMsg(`Updated service category: ${data.name}!`);
      } else {
        await serviceApi.create({
          name: data.name,
          category: data.category || 'Cleaning',
          basePrice: data.basePrice,
          priceUnit: 'per session',
          providerName: data.primaryTechName || 'EaseHub Partner',
          description: data.description,
          images: data.photos,
          corridor: data.coverageCorridors?.[0] || 'Bhilai',
          isActive: data.status === 'active',
          location: {
            address: data.address,
            landmark: data.landmark || '',
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            latitude: data.latitude,
            longitude: data.longitude,
          },
        });
        setToastMsg(`Published new service category: ${data.name}!`);
      }
      await fetchCategories();
      setIsModalOpen(false);
      setEditingCategory(null);
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      console.error('Failed to save service:', err);
      alert('Failed to save service to database. Please check your admin login session.');
    }
  };

  const getInitialFormData = (cat: ServiceCategory | null): ServiceFormData | null => {
    if (!cat) return null;
    const raw = cat.rawItem || {};
    const loc = raw.location || {};
    return {
      id: cat.id,
      code: cat.code,
      name: cat.name,
      category: (raw.category as any) || 'Electrical',
      icon: cat.icon || 'electric_bolt',
      description: cat.description,
      photos: raw.images || [],
      basePrice: cat.basePrice,
      nightSurge: cat.nightSurge,
      extendedLaborRate: cat.extendedLaborRate,
      includedScope: [],
      excludedItems: '',
      address: loc.address || '',
      landmark: loc.landmark || '',
      city: loc.city || 'Bhilai',
      state: loc.state || 'Chhattisgarh',
      pincode: loc.pincode || '',
      coverageCorridors: cat.coverageCorridors,
      slaMins: cat.slaMins,
      slaGuarantee: cat.slaGuarantee,
      latitude: loc.latitude || 21.198409,
      longitude: loc.longitude || 81.332444,
      primaryTechName: raw.providerName || '',
      primaryTechRole: 'Technician',
      primaryTechRating: cat.rawItem?.rating || 0,
      activeTechsCount: cat.activeTechs,
      status: cat.status,
    };
  };

  const filteredCategories = categories.filter((c) => {
    const nameStr = (c.name || '').toLowerCase();
    const codeStr = (c.code || '').toLowerCase();
    const catStr = (c.rawItem?.category || '').toLowerCase();
    const q = (searchQuery || '').toLowerCase();

    const matchesQuery = !q || nameStr.includes(q) || codeStr.includes(q) || catStr.includes(q);

    if (activeChip === 'all') return matchesQuery;
    if (activeChip === 'active') return matchesQuery && c.status === 'active';
    if (activeChip === 'inactive') return matchesQuery && c.status === 'disabled';
    if (activeChip === 'electrician') return matchesQuery && (catStr.includes('electric') || c.id === 'electrical');
    if (activeChip === 'plumber') return matchesQuery && (catStr.includes('plumb') || c.id === 'plumbing');
    if (activeChip === 'cleaning') return matchesQuery && (catStr.includes('clean') || c.id === 'cleaning');
    if (activeChip === 'appliance') return matchesQuery && catStr.includes('appliance');
    return matchesQuery;
  });

  return (
    <div className="space-y-6 text-[#191c1a]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-[#02412e] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-[#fcd747]">check_circle</span>
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Confirmation Modal for Deactivate / Reactivate */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 text-amber-700">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmModal.type === 'deactivate' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
              }`}>
                <span className="material-symbols-outlined text-2xl">
                  {confirmModal.type === 'deactivate' ? 'warning' : 'published_with_changes'}
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#171A18]">
                  {confirmModal.type === 'deactivate' ? 'Deactivate Service' : 'Reactivate Service'}
                </h3>
                <p className="text-xs text-[#6B6B63] font-semibold">{confirmModal.category.name}</p>
              </div>
            </div>

            <p className="text-sm text-[#404944] leading-relaxed">
              {confirmModal.type === 'deactivate'
                ? 'This service will no longer be visible to customers on the /services page or customer search.'
                : 'This service will immediately become visible to customers again on the public /services catalog.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl bg-[#edeeeb] text-[#191c1a] font-bold text-xs hover:bg-[#e1e3df] transition"
              >
                Cancel
              </button>
              {confirmModal.type === 'deactivate' ? (
                <button
                  onClick={() => executeDeactivate(confirmModal.category)}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition shadow-sm"
                >
                  Confirm Deactivate
                </button>
              ) : (
                <button
                  onClick={() => executeReactivate(confirmModal.category)}
                  className="px-5 py-2.5 rounded-xl bg-[#02412e] text-white font-bold text-xs hover:bg-[#225944] transition shadow-sm"
                >
                  Confirm Reactivate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#707973] mb-1 font-medium">
            <span>Campus Support Operations</span>
            <span>/</span>
            <span>On-Demand Utilities</span>
            <span>/</span>
            <span className="text-[#02412e] font-bold">Services Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1a] tracking-tight">
            Home &amp; Student Services Management
          </h1>
          <p className="text-sm text-[#404944] mt-1">
            Manage standard visit tariffs, technician dispatch SLAs, emergency utility response pools, and custom student request tickets.
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-full bg-[#e1e3df] hover:bg-[#d5d7d3] text-[#191c1a] font-semibold text-xs transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-[#02412e]">download</span>
            <span>Export Rate Card</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-full bg-[#225944] hover:bg-[#02412e] text-white font-bold text-xs transition shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Add New Service Category</span>
          </button>
        </div>
      </div>

      {/* Bento KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Total Services</span>
            <div className="w-9 h-9 rounded-xl bg-[#225944]/10 text-[#02412e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">category</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#191c1a]">{categories.length} Services</div>
            <div className="text-xs text-[#225944] font-medium mt-1 flex items-center gap-1">
              <span>{categories.filter(c => c.status === 'active').length} Active | {categories.filter(c => c.status !== 'active').length} Inactive</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Live Active Services</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#191c1a]">{categories.filter(c => c.status === 'active').length} Live</div>
            <div className="text-xs text-[#707973] font-medium mt-1">
              <strong className="text-[#02412e]">Visible on customer /services page</strong>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Service Corridors</span>
            <div className="w-9 h-9 rounded-xl bg-[#225944]/10 text-[#02412e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">speed</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#191c1a]">4 Corridors</div>
            <div className="text-xs text-[#225944] font-medium mt-1 flex items-center gap-1">
              <span>Bhilai &amp; Durg Campus Coverage</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Custom Student Queries</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#191c1a]">{customQueries.length} Pending</div>
            <div className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span>Student Custom Tickets Queue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#edeeeb] p-3 rounded-2xl">
        {/* Category Chips Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: `All Services (${categories.length})` },
            { id: 'active', label: `🟢 Active (${categories.filter(c => c.status === 'active').length})` },
            { id: 'inactive', label: `🔴 Inactive (${categories.filter(c => c.status !== 'active').length})` },
            { id: 'electrician', label: '⚡ Electrical' },
            { id: 'plumber', label: '🚰 Plumbing' },
            { id: 'cleaning', label: '🧹 Cleaning' },
            { id: 'appliance', label: '❄️ Appliance' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveChip(chip.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                activeChip === chip.id
                  ? 'bg-[#02412e] text-white shadow-sm'
                  : 'bg-white text-[#404944] hover:bg-[#f8faf6]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#707973] text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search service name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-full text-xs text-[#191c1a] border border-[#c0c9c2]/60 focus:outline-none focus:border-[#02412e]"
          />
        </div>
      </div>

      {/* Main Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Master Services Table & Demand Rhythm (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Services Table Card */}
          <div className="bg-[#f8faf6] rounded-2xl border border-[#c0c9c2]/50 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#c0c9c2]/40 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-[#191c1a]">Services Catalog &amp; Tariff Master</h2>
                <p className="text-xs text-[#707973]">Click any service row to configure tariffs, SLAs &amp; details</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#225944]/10 text-[#02412e]">
                {filteredCategories.length} Categories Displayed
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[#707973] font-bold text-sm">Loading services catalog from database...</div>
            ) : error ? (
              <div className="p-12 text-center bg-rose-50/50 p-6 m-4 rounded-2xl border border-rose-200">
                <div className="material-symbols-outlined text-rose-600 text-3xl mb-2">warning</div>
                <div className="font-bold text-rose-900 text-sm">{error}</div>
                <button
                  onClick={fetchCategories}
                  className="mt-3 px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition"
                >
                  Retry
                </button>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center bg-[#f8faf6] p-8 m-4 rounded-2xl border border-[#c0c9c2]/50 space-y-3">
                <div className="w-14 h-14 bg-[#225944]/10 text-[#02412e] rounded-2xl flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">build</span>
                </div>
                <h3 className="font-extrabold text-base text-[#191c1a]">No services found.</h3>
                <p className="text-xs text-[#707973] font-medium">Add your first service to make it available to customers.</p>
                <button
                  onClick={handleOpenAddModal}
                  className="mt-2 px-5 py-2.5 bg-[#02412e] text-white font-bold text-xs rounded-full hover:bg-[#225944] transition shadow-sm inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>+ Add Service</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#edeeeb] text-[11px] font-extrabold text-[#707973] uppercase tracking-wider border-b border-[#c0c9c2]/40">
                      <th className="py-3 px-4">Service Category</th>
                      <th className="py-3 px-4">Base Tariff</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c0c9c2]/30 text-xs">
                    {filteredCategories.map((cat) => {
                      const isSelected = selectedCategory?.id === cat.id;
                      const hasImage = Boolean(cat.rawItem?.images?.[0]);

                      return (
                        <tr
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat)}
                          className={`cursor-pointer transition hover:bg-[#225944]/5 ${
                            isSelected ? 'bg-[#225944]/10 border-l-4 border-[#02412e]' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#225944]/10 text-[#02412e] flex items-center justify-center shrink-0 overflow-hidden border border-[#c0c9c2]/40">
                                {hasImage ? (
                                  <img src={cat.rawItem.images[0]} alt={cat.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-[#191c1a]">{cat.name}</div>
                                <div className="text-[10px] font-mono text-[#707973]">
                                  {cat.rawItem?.category || 'General'} | {cat.code}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#02412e]">
                            {cat.basePrice ? `₹${cat.basePrice}` : <span className="text-[#707973] font-normal italic">Price not set</span>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              cat.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                            }`}>
                              {cat.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCategory(cat);
                                }}
                                className="p-1.5 rounded-lg text-[#707973] hover:bg-[#e1e3df] hover:text-[#02412e] transition"
                                title="Edit Service"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>

                              {cat.status === 'active' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmModal({ type: 'deactivate', category: cat });
                                  }}
                                  className="p-1.5 rounded-lg text-[#707973] hover:bg-rose-100 hover:text-rose-700 transition"
                                  title="Deactivate Service"
                                >
                                  <span className="material-symbols-outlined text-[16px]">block</span>
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmModal({ type: 'reactivate', category: cat });
                                  }}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition"
                                  title="Reactivate Service"
                                >
                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCategory(cat);
                                }}
                                className={`p-1.5 rounded-lg transition ${
                                  isSelected ? 'bg-[#02412e] text-white' : 'text-[#707973] hover:bg-[#e1e3df]'
                                }`}
                                title="Inspect Details"
                              >
                                <span className="material-symbols-outlined text-[16px]">tune</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Service Tariff & Inspector Dossier (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {!selectedCategory ? (
            <div className="bg-[#f8faf6] rounded-2xl border border-[#c0c9c2]/50 shadow-sm p-8 text-center text-[#707973] font-bold text-sm">
              No service category selected.
            </div>
          ) : (
            <div className="bg-[#f8faf6] rounded-2xl border border-[#c0c9c2]/50 shadow-sm p-5 space-y-5">
              {/* Inspector Header */}
              <div className="pb-4 border-b border-[#c0c9c2]/40 flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#c0c9c2]/60 overflow-hidden flex items-center justify-center shrink-0">
                    {selectedCategory.rawItem?.images?.[0] ? (
                      <img src={selectedCategory.rawItem.images[0]} alt={selectedCategory.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-2xl text-[#02412e]">{selectedCategory.icon}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#707973] uppercase tracking-wider">{selectedCategory.code}</span>
                    <h2 className="text-lg font-extrabold text-[#191c1a]">{selectedCategory.name}</h2>
                    <p className="text-xs text-[#404944] mt-0.5">{selectedCategory.description || 'No description provided.'}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 uppercase ${
                  selectedCategory.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-800'
                    : 'bg-rose-500/10 text-rose-700'
                }`}>
                  {selectedCategory.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Standard Visit Tariffs Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-[#707973] uppercase tracking-wider">Standard Visit Tariffs &amp; Fees</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#edeeeb]">
                    <label className="block text-[11px] font-bold text-[#404944] mb-1">Base Visit Fee (₹)</label>
                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-[#c0c9c2]/60">
                      <span className="text-xs font-bold text-[#707973]">₹</span>
                      <input
                        type="number"
                        value={editBasePrice}
                        onChange={(e) => setEditBasePrice(Number(e.target.value))}
                        className="w-full text-sm font-bold text-[#191c1a] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#edeeeb]">
                    <label className="block text-[11px] font-bold text-[#404944] mb-1">Night Surge (10 PM - 6 AM)</label>
                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-[#c0c9c2]/60">
                      <span className="text-xs font-bold text-[#707973]">₹</span>
                      <input
                        type="number"
                        value={editNightSurge}
                        onChange={(e) => setEditNightSurge(Number(e.target.value))}
                        className="w-full text-sm font-bold text-[#191c1a] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-[#707973] uppercase tracking-wider">Dispatch Center Location</h3>
                <div className="p-3 rounded-xl bg-[#edeeeb] text-xs space-y-1">
                  <div className="font-bold text-[#191c1a]">
                    {selectedCategory.rawItem?.location?.address || selectedCategory.rawItem?.city || 'Location not specified'}
                  </div>
                  {selectedCategory.rawItem?.location?.latitude && (
                    <div className="text-[11px] font-mono text-[#707973]">
                      GPS: {selectedCategory.rawItem.location.latitude}, {selectedCategory.rawItem.location.longitude}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-[#c0c9c2]/40 space-y-2">
                <button
                  onClick={handleSaveTariffs}
                  className="w-full py-3 rounded-xl bg-[#02412e] hover:bg-[#225944] text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Save Tariff Update</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleEditCategory(selectedCategory)}
                    className="py-2.5 rounded-xl bg-[#225944]/10 hover:bg-[#225944]/20 text-[#02412e] font-semibold text-xs transition flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Edit Service</span>
                  </button>

                  {selectedCategory.status === 'active' ? (
                    <button
                      onClick={() => setConfirmModal({ type: 'deactivate', category: selectedCategory })}
                      className="py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 font-semibold text-xs transition flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">block</span>
                      <span>Deactivate Service</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmModal({ type: 'reactivate', category: selectedCategory })}
                      className="py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 font-semibold text-xs transition flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Reactivate Service</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Redesigned Multi-Step Add / Edit Service Category Modal */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmitService={handleAddServiceSubmit}
        initialData={getInitialFormData(editingCategory)}
      />
    </div>
  );
};

export default ServicesManagement;
