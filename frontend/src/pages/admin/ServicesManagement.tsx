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

const defaultCategories: ServiceCategory[] = [];


export const ServicesManagement: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  const fetchCategories = async () => {
    try {
      const list = await serviceApi.getServices();
      if (Array.isArray(list)) {
        const mapped: ServiceCategory[] = list.map((s: any) => ({
          id: s._id || s.id || s.code,
          code: s.code || `#SRV-${(s.id || 'BH101').slice(0, 6)}`,
          name: s.name,
          icon: 'plumbing',
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
          setSelectedCategory(mapped[0]);
          setEditBasePrice(mapped[0].basePrice);
          setEditNightSurge(mapped[0].nightSurge);
          setEditSlaMins(mapped[0].slaMins);
        }
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [activeChip, setActiveChip] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form editable state for inspector
  const [editBasePrice, setEditBasePrice] = useState<number>(0);
  const [editNightSurge, setEditNightSurge] = useState<number>(0);
  const [editSlaMins, setEditSlaMins] = useState<number>(0);

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

  const handleDeleteCategory = async (cat: ServiceCategory) => {
    if (!window.confirm(`Are you sure you want to delete/deactivate service category "${cat.name}"?`)) {
      return;
    }
    try {
      await serviceApi.delete(cat.id);
      setToastMsg(`Deactivated service category: ${cat.name}`);
      if (selectedCategory?.id === cat.id) {
        setSelectedCategory(null);
      }
      await fetchCategories();
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      console.error('Failed to delete service:', err);
      alert(err.message || 'Failed to delete service category.');
    }
  };

  const handleSaveTariffs = () => {
    if (!selectedCategory) return;
    const updated = categories.map((c) =>
      c.id === selectedCategory.id
        ? { ...c, basePrice: editBasePrice, nightSurge: editNightSurge, slaMins: editSlaMins, slaGuarantee: `${editSlaMins} min SLA` }
        : c
    );
    setCategories(updated);
    setSelectedCategory({ ...selectedCategory, basePrice: editBasePrice, nightSurge: editNightSurge, slaMins: editSlaMins });
    setToastMsg(`Saved & propagated updated tariffs for ${selectedCategory.name}!`);
    setTimeout(() => setToastMsg(null), 3500);
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
          category: data.category || 'CLEANING',
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
          category: data.category || 'CLEANING',
          basePrice: data.basePrice,
          priceUnit: 'per session',
          providerName: data.primaryTechName || 'EaseHub Master Tech',
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
      address: loc.address || 'Central Service Dispatch Center, Junwani Road',
      landmark: loc.landmark || 'Opposite BIT Gate 2',
      city: loc.city || 'Bhilai',
      state: loc.state || 'Chhattisgarh',
      pincode: loc.pincode || '490020',
      coverageCorridors: cat.coverageCorridors,
      slaMins: cat.slaMins,
      slaGuarantee: cat.slaGuarantee,
      latitude: loc.latitude || 21.198409,
      longitude: loc.longitude || 81.332444,
      primaryTechName: 'EaseHub Master Tech',
      primaryTechRole: 'Master Tech',
      primaryTechRating: 4.9,
      activeTechsCount: cat.activeTechs,
      status: cat.status,
    };
  };

  const filteredCategories = categories.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeChip === 'all') return matchesQuery;
    if (activeChip === 'electrician') return matchesQuery && c.id === 'electrical';
    if (activeChip === 'plumber') return matchesQuery && c.id === 'plumbing';
    if (activeChip === 'cleaning') return matchesQuery && c.id === 'cleaning';
    if (activeChip === 'internet') return matchesQuery && c.id === 'internet';
    if (activeChip === 'water') return matchesQuery && c.id === 'water';
    if (activeChip === 'vehicle') return matchesQuery && c.id === 'vehicle';
    if (activeChip === 'appliance') return matchesQuery && c.id === 'appliance';
    if (activeChip === 'custom') return matchesQuery && c.id === 'custom';
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
            onClick={() => setToastMsg('Emergency SOS Dispatch Grid active across all 4 campus corridors!')}
            className="px-4 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 font-semibold text-xs transition flex items-center gap-2 border border-rose-500/20"
          >
            <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
            <span>Emergency SOS Grid</span>
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

      {/* 4 Bento KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Active Services</span>
            <div className="w-9 h-9 rounded-xl bg-[#225944]/10 text-[#02412e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">category</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#191c1a]">{categories.length} Services</div>
            <div className="text-xs text-[#225944] font-medium mt-1 flex items-center gap-1">
              <span>{categories.length} Doorstep Categories Available</span>
            </div>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Verified Partners</span>
            <div className="w-9 h-9 rounded-xl bg-[#fcd747]/20 text-[#715d00] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">engineering</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#191c1a]">{categories.length} Listings</div>
            <div className="text-xs text-[#707973] font-medium mt-1">
              <strong className="text-[#02412e]">{categories.length} Active Listings</strong>
            </div>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Service Coverage</span>
            <div className="w-9 h-9 rounded-xl bg-[#225944]/10 text-[#02412e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">speed</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#191c1a]">{categories.length} Categories</div>
            <div className="text-xs text-[#225944] font-medium mt-1 flex items-center gap-1">
              <span>Bhilai &amp; Durg Campus Coverage</span>
            </div>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#c0c9c2]/50 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707973] uppercase tracking-wider">Custom Student Queries</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#191c1a]">12 Pending</div>
            <div className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span>3 High Priority / SOS Urgent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#edeeeb] p-3 rounded-2xl">
        {/* Category Chips Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Services (9)' },
            { id: 'electrician', label: '⚡ Electrician' },
            { id: 'plumber', label: '🚰 Plumber' },
            { id: 'cleaning', label: '🧹 Cleaning' },
            { id: 'internet', label: '🌐 Internet Setup' },
            { id: 'water', label: '💧 Water Can' },
            { id: 'vehicle', label: '🛵 Bike Service' },
            { id: 'appliance', label: '❄️ AC/Appliance' },
            { id: 'custom', label: '❓ Custom (12)' },
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
                <h2 className="font-bold text-base text-[#191c1a]">Services Catalog & Tariff Master</h2>
                <p className="text-xs text-[#707973]">Click any service row to configure tariffs, SLAs &amp; assigned technicians</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#225944]/10 text-[#02412e]">
                {filteredCategories.length} Categories Live
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#edeeeb] text-[11px] font-extrabold text-[#707973] uppercase tracking-wider border-b border-[#c0c9c2]/40">
                    <th className="py-3 px-4">Service Category</th>
                    <th className="py-3 px-4">Base Tariff</th>
                    <th className="py-3 px-4">Night Surge</th>
                    <th className="py-3 px-4">Tech Pool</th>
                    <th className="py-3 px-4">SLA Commitment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c0c9c2]/30 text-xs">
                  {filteredCategories.map((cat) => {
                    const isSelected = selectedCategory?.id === cat.id;
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
                            <div className="w-8 h-8 rounded-lg bg-[#225944]/10 text-[#02412e] flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                            </div>
                            <div>
                              <div className="font-bold text-[#191c1a]">{cat.name}</div>
                              <div className="text-[10px] font-mono text-[#707973]">{cat.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#02412e]">₹{cat.basePrice}</td>
                        <td className="py-3.5 px-4 text-[#707973]">₹{cat.nightSurge}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#191c1a]">{cat.activeTechs} Techs</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-bold">
                            {cat.slaGuarantee}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-bold uppercase">
                            {cat.status}
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(cat);
                              }}
                              className="p-1.5 rounded-lg text-[#707973] hover:bg-rose-100 hover:text-rose-700 transition"
                              title="Delete Service"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
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
          </div>

          {/* Weekly Demand & Dispatch Rhythm Chart */}
          <div className="p-5 bg-[#f8faf6] rounded-2xl border border-[#c0c9c2]/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#191c1a]">Weekly Demand &amp; Dispatch Rhythm</h3>
                <p className="text-xs text-[#707973]">Daily work order dispatch load for {selectedCategory?.name || 'Service'}</p>
              </div>
              <span className="text-xs font-bold text-[#02412e] bg-[#225944]/10 px-2.5 py-1 rounded-md">
                Weekend Peak Detected
              </span>
            </div>

            {/* Simple Bar Chart Visualization */}
            <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2 border-b border-[#c0c9c2]/40 pb-2">
              {selectedCategory?.demandWeekly ? selectedCategory.demandWeekly.map((item, idx) => {
                const maxVal = Math.max(...(selectedCategory?.demandWeekly || []).map((d) => d.count), 1);
                const heightPercent = Math.round((item.count / maxVal) * 100);
                const isPeak = item.count === maxVal;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[10px] font-bold text-[#707973] group-hover:text-[#02412e]">{item.count}</span>
                    <div className="w-full bg-[#e1e3df] rounded-t-md h-28 relative overflow-hidden flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isPeak ? 'bg-[#fcd747]' : 'bg-[#225944]'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[#404944]">{item.day}</span>
                  </div>
                );
              }) : null}
            </div>
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
            <div className="pb-4 border-b border-[#c0c9c2]/40 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#707973] uppercase tracking-wider">{selectedCategory.code}</span>
                <h2 className="text-lg font-extrabold text-[#191c1a]">{selectedCategory.name}</h2>
                <p className="text-xs text-[#404944] mt-0.5">{selectedCategory.description}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-bold shrink-0">
                Active / Ready
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

              <div className="p-3 rounded-xl bg-[#edeeeb] text-xs">
                <span className="font-bold text-[#404944]">Extended Labour Rate:</span>
                <p className="text-[#707973] text-[11px] mt-0.5">{selectedCategory.extendedLaborRate}</p>
              </div>
            </div>

            {/* SLA & Dispatch Commitment */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-[#707973] uppercase tracking-wider">SLA &amp; Dispatch Commitment</h3>
              <div className="p-3.5 rounded-xl bg-[#225944]/10 border border-[#225944]/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#02412e]">Emergency SLA Commitment</div>
                  <div className="text-[11px] text-[#404944]">Max arrival window limit</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editSlaMins}
                    onChange={(e) => setEditSlaMins(Number(e.target.value))}
                    className="w-16 text-center font-extrabold text-sm py-1 bg-white rounded-lg border border-[#225944]"
                  />
                  <span className="text-xs font-bold text-[#02412e]">Mins</span>
                </div>
              </div>
            </div>

            {/* Assigned Technician Pool */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#707973] uppercase tracking-wider">Assigned Technician Pool</h3>
                <span className="text-xs font-bold text-[#02412e]">{selectedCategory.assignedTechs.length} Pinned Techs</span>
              </div>
              <div className="space-y-2">
                {selectedCategory.assignedTechs.map((tech, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#edeeeb] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={tech.avatar} alt={tech.name} className="w-8 h-8 rounded-full object-cover border border-[#c0c9c2]" />
                      <div>
                        <div className="font-bold text-xs text-[#191c1a]">{tech.name}</div>
                        <div className="text-[10px] text-[#707973]">{tech.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#715d00] flex items-center gap-1 justify-end">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span>{tech.rating}</span>
                      </div>
                      <div className="text-[10px] text-[#707973]">{tech.jobs} Jobs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage Corridors */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-[#707973] uppercase tracking-wider">Campus Coverage Corridors</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#191c1a]">
                {['Junwani BIT Gate Corridor', 'Smriti Nagar Student Hub', 'Nehru Nagar Residential', 'Civic Center Outer'].map(
                  (corridor, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#edeeeb] cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={selectedCategory.coverageCorridors.some((c) => corridor.includes(c))}
                        className="rounded text-[#02412e] focus:ring-[#02412e]"
                      />
                      <span className="text-[11px] truncate">{corridor}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Pending Custom Student Queries Queue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#707973] uppercase tracking-wider">Pending Custom Queries</h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {customQueries.length} Unresolved
                </span>
              </div>

              <div className="space-y-2">
                {customQueries.map((q) => (
                  <div key={q.id} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#191c1a]">{q.studentName}</span>
                      <span className="text-[10px] font-mono text-[#707973]">{q.timeAgo}</span>
                    </div>
                    <div className="text-[11px] text-[#707973]">{q.location}</div>
                    <p className="text-xs font-medium text-[#404944] pt-1">"{q.issue}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="pt-3 border-t border-[#c0c9c2]/40 space-y-2">
              <button
                onClick={handleSaveTariffs}
                className="w-full py-3 rounded-xl bg-[#02412e] hover:bg-[#225944] text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Save &amp; Propagate Tariffs</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEditCategory(selectedCategory)}
                  className="py-2 rounded-xl bg-[#225944]/10 hover:bg-[#225944]/20 text-[#02412e] font-semibold text-xs transition flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Edit Service</span>
                </button>
                <button
                  onClick={() => handleDeleteCategory(selectedCategory)}
                  className="py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 font-semibold text-xs transition flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Delete Service</span>
                </button>
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
