import React, { useState, useEffect } from 'react';
import AdminLocationPicker, { LocationFormValues } from '../../components/admin/AdminLocationPicker';
import AddMealProviderModal, { MealProviderFormData } from '../../components/admin/AddMealProviderModal';
import { mealApi } from '../../services/mealApi';

interface MealProvider {
  id: string;
  code: string;
  name: string;
  fssai: string;
  address: string;
  corridor: string;
  distance: string;
  rating: number;
  reviewCount: number;
  status: 'active' | 'pending' | 'paused';
  tags: string[];
  dailyPrice: number;
  monthlyPrice: number;
  activeTiffins: number;
  kitchenCapacity: string;
  inspectionGrade: string;
  deliveryRadius: string;
  breakfastMenu: string;
  lunchMenu: string;
  dinnerMenu: string;
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
  mapEmbedUrl?: string;
  location?: LocationFormValues;
}

const defaultProviders: MealProvider[] = [];

export const MealsManagement: React.FC = () => {
  const [providers, setProviders] = useState<MealProvider[]>([]);

  const fetchProviders = async () => {
    try {
      const list = await mealApi.getAll();
      if (Array.isArray(list)) {
        const mapped: MealProvider[] = list.map((m: any) => ({
          id: m._id || m.id || m.code || `mp-${Math.random()}`,
          code: m.code || '#MP-BH-101',
          name: m.name || 'Mess Kitchen Provider',
          fssai: m.fssai || 'FSSAI Verified',
          address: m.location?.address || `${m.corridor || 'Bhilai'}, Chhattisgarh`,
          corridor: m.corridor || 'Junwani',
          distance: m.distance || 'Near Campus',
          rating: typeof m.rating === 'number' ? m.rating : 5.0,
          reviewCount: typeof m.reviewCount === 'number' ? m.reviewCount : 0,
          status: m.status || 'active',
          tags: Array.isArray(m.tags)
            ? m.tags.map((t: any) => (typeof t === 'string' ? t : (t?.name || String(t || '')))).filter(Boolean)
            : [],
          dailyPrice: m.dailyPrice || 0,
          monthlyPrice: m.monthlyPrice || 0,
          activeTiffins: m.activeTiffins || 0,
          kitchenCapacity: m.kitchenCapacity || '100 Meals/day',
          inspectionGrade: m.inspectionGrade || 'Grade A',
          deliveryRadius: m.deliveryRadius || '3 km',
          breakfastMenu: m.breakfastMenu || 'Poha / Paratha with Tea',
          lunchMenu: m.lunchMenu || '4 Rotis, Rice, Dal Tadka, Sabzi & Salad',
          dinnerMenu: m.dinnerMenu || '4 Rotis, Rice, Dal Makhani & Special Sabzi',
          breakfastPrice: m.breakfastPrice || 40,
          lunchPrice: m.lunchPrice || 80,
          dinnerPrice: m.dinnerPrice || 80,
          location: m.location,
        }));
        setProviders(mapped);
        setSelectedProvider((prev) => {
          if (!prev && mapped.length > 0) return mapped[0];
          if (prev) {
            const found = mapped.find((p) => p.id === prev.id);
            return found || mapped[0] || null;
          }
          return mapped[0] || null;
        });
      }
    } catch (err) {
      console.error('Failed to load meal providers:', err);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const [selectedProvider, setSelectedProvider] = useState<MealProvider | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'overview' | 'pricing' | 'delivery'>('menu');

  const [searchTerm, setSearchTerm] = useState('');
  const [corridorFilter, setCorridorFilter] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);

  const handleDeleteMeal = async (p: MealProvider) => {
    if (window.confirm(`Are you sure you want to delete meal kitchen "${p.name}"?`)) {
      try {
        await mealApi.delete(p.id);
        if (selectedProvider?.id === p.id) setSelectedProvider(null);
        await fetchProviders();
      } catch (err: any) {
        console.error('Failed to delete meal provider:', err);
        alert(err.message || 'Failed to delete meal provider.');
      }
    }
  };
  const [newMess, setNewMess] = useState({
    name: '',
    fssai: '',
    address: '',
    corridor: 'Junwani',
    dailyPrice: 80,
    monthlyPrice: 2400,
  });

  const filteredProviders = providers.filter((p) => {
    if (!p) return false;
    const nameStr = (p.name || '').toLowerCase();
    const codeStr = (p.code || '').toLowerCase();
    const fssaiStr = String(p.fssai || '');
    const addrStr = (p.address || '').toLowerCase();
    const corrStr = (p.corridor || '').toLowerCase();

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        nameStr.includes(term) ||
        codeStr.includes(term) ||
        fssaiStr.includes(term) ||
        addrStr.includes(term);
      if (!match) return false;
    }

    if (corridorFilter !== 'all') {
      if (!corrStr.includes(corridorFilter.toLowerCase())) return false;
    }

    if (dietFilter !== 'all') {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      if (dietFilter === 'veg' && !tags.some((t) => String(t || '').toLowerCase().includes('veg'))) return false;
      if (dietFilter === 'nonveg' && !tags.some((t) => String(t || '').toLowerCase().includes('non-veg'))) return false;
    }

    if (statusFilter !== 'all') {
      if (p.status !== statusFilter) return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Code,Mess Name,FSSAI,Corridor,Rating,Monthly Price,Active Tiffins,Status']
        .concat(
          providers.map(
            (p) =>
              `"${p.code}","${p.name}","${p.fssai}","${p.corridor}",${p.rating},${p.monthlyPrice},${p.activeTiffins},"${p.status}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EaseHub_Meals_Directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddProviderSubmit = async (data: MealProviderFormData) => {
    try {
      await mealApi.create({
        name: data.name,
        fssai: data.fssai,
        corridor: data.corridor,
        distance: data.distance || '300m to Campus',
        dailyPrice: data.dailyPrice,
        monthlyPrice: data.monthlyPrice,
        activeTiffins: 0,
        kitchenCapacity: data.kitchenCapacity,
        inspectionGrade: data.inspectionGrade || 'FSSAI Verified',
        deliveryRadius: data.deliveryRadius,
        breakfastMenu: data.breakfastMenu,
        lunchMenu: data.lunchMenu,
        dinnerMenu: data.dinnerMenu,
        breakfastPrice: data.breakfastPrice,
        lunchPrice: data.lunchPrice,
        dinnerPrice: data.dinnerPrice,
        tags: data.tags,
        status: data.status,
      });
      await fetchProviders();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create meal provider:', err);
      alert('Failed to save meal provider to database. Please check your admin login session.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Page Action Header */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center gap-2 text-[#6B6B63] text-xs font-semibold">
          <span>Campus Dining Ops</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Bhilai–Durg Kitchens</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#225944] font-bold">Meal Providers & Menus</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
                Meals & Tiffin Management
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#225944]/10 text-[#225944]">
                <span className="w-2 h-2 rounded-full bg-[#225944] animate-pulse"></span>
                <span className="text-[10px] uppercase font-bold tracking-wider">{providers.length + 58} ACTIVE KITCHENS</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                NODE: CHHATTISGARH HUB 04
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6B63] max-w-4xl">
              Oversee verified student messes, approve weekly rotating menus, set FSSAI compliance, configure daily & monthly meal tiers, and track delivery corridors across Junwani, Smriti Nagar, and Nehru Nagar.
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-[#171A18] hover:bg-slate-100 font-bold text-xs shadow-xs border border-[#E5E1D6] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Menus CSV</span>
            </button>

            <button
              onClick={() => alert('Bulk Menu Approval Executed: Approved 8 weekly menus across Bhilai hub.')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-[#171A18] hover:bg-slate-100 font-bold text-xs shadow-xs border border-[#E5E1D6] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">rule</span>
              <span>Bulk Menu Approval</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#225944] hover:bg-[#184232] text-white font-bold text-xs shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>+ Add Meal Provider</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E1D6] shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B6B63]">Total Active Providers</span>
              <div className="w-8 h-8 rounded-lg bg-[#225944]/10 text-[#225944] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">kitchen</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#171A18]">{providers.length}</span>
              <span className="inline-flex items-center text-[#225944] text-xs font-bold">
                Registered
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E1D6] flex items-center justify-between text-xs font-semibold text-[#6B6B63]">
            <span>{providers.filter(p => p.status === 'active').length} active online</span>
            <span className="inline-flex items-center gap-1 font-bold text-[#225944]">
              <span className="material-symbols-outlined text-[14px]">verified</span> Database Verified
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E1D6] shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B6B63]">Active Mess Partners</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">lunch_dining</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#171A18]">{providers.length}</span>
              <span className="text-xs font-semibold text-[#6B6B63]">partners</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E1D6] flex items-center justify-between text-xs font-bold text-[#6B6B63]">
            <span>Veg &amp; Non-Veg Tiffin Services</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E1D6] shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B6B63]">Subscription Plans</span>
              <div className="w-8 h-8 rounded-lg bg-[#225944]/10 text-[#225944] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">card_membership</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#171A18]">{providers.length}</span>
              <span className="text-xs font-bold text-[#225944]">Active Menu Plans</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E1D6] flex items-center justify-between text-xs font-semibold text-[#6B6B63]">
            <span>Daily &amp; Monthly Tiffin Options</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E1D6] shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B6B63]">Menu Approvals Backlog</span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600">8</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                Urgent Review
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E1D6] flex items-center justify-between text-xs font-bold">
            <span className="text-[#6B6B63]">Cycle: Week 17 Menu</span>
            <button
              onClick={() => setStatusFilter('pending')}
              className="inline-flex items-center gap-1 text-[#225944] hover:underline"
            >
              <span>Audit Menu</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E1D6] shadow-xs flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B63] text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by mess name, provider, FSSAI no., or locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs text-[#171A18] placeholder-[#6B6B63] focus:outline-none focus:ring-2 focus:ring-[#225944] font-medium"
            />
          </div>

          {/* Corridor Selector */}
          <div className="md:col-span-3">
            <select
              value={corridorFilter}
              onChange={(e) => setCorridorFilter(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944] cursor-pointer"
            >
              <option value="all">All Corridors (64)</option>
              <option value="junwani">Junwani (BIT Corridor)</option>
              <option value="smriti">Smriti Nagar Hub</option>
              <option value="nehru">Nehru Nagar East</option>
              <option value="civic">Civic Center Zone</option>
            </select>
          </div>

          {/* Meal Type Filter */}
          <div className="md:col-span-2">
            <select
              value={dietFilter}
              onChange={(e) => setDietFilter(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944] cursor-pointer"
            >
              <option value="all">All Diets</option>
              <option value="veg">Pure Veg Only</option>
              <option value="nonveg">Non-Veg Options</option>
            </select>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active & Delivering</option>
              <option value="pending">Pending Approval (8)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E5E1D6] text-xs font-semibold text-[#6B6B63]">
          <span>Quick Filters:</span>
          <button
            onClick={() => setDietFilter(dietFilter === 'veg' ? 'all' : 'veg')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              dietFilter === 'veg' ? 'bg-[#225944] text-white shadow-xs' : 'bg-slate-100 text-[#171A18] hover:bg-slate-200'
            }`}
          >
            🌱 Pure Veg Only
          </button>
          <button
            onClick={() => setSearchTerm('2400')}
            className="px-3 py-1 rounded-full bg-slate-100 text-[#171A18] hover:bg-slate-200 transition-all"
          >
            Monthly Plan &lt; ₹2,500
          </button>
          <button
            onClick={() => setSearchTerm('BIT')}
            className="px-3 py-1 rounded-full bg-slate-100 text-[#171A18] hover:bg-slate-200 transition-all"
          >
            Near BIT Gate
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setCorridorFilter('all');
              setDietFilter('all');
              setStatusFilter('all');
            }}
            className="ml-auto text-[#225944] font-bold hover:underline"
          >
            Clear Filters ×
          </button>
        </div>
      </div>

      {/* Master-Detail Layout (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Provider Master List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-[#6B6B63]">
            <span>Kitchen Providers ({filteredProviders.length})</span>
            <span className="uppercase text-[10px]">Sorted by Active Volume</span>
          </div>

          {filteredProviders.map((p) => {
            const isSelected = selectedProvider?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProvider(p)}
                className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#225944] ring-2 ring-[#225944]/20 shadow-md'
                    : 'border-[#E5E1D6] hover:border-[#225944] hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#225944]/10 text-[#225944] flex items-center justify-center font-extrabold text-base">
                      {p.name.charAt(0)}M
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-base text-[#171A18] leading-tight">{p.name}</h3>
                        {p.status === 'active' && (
                          <span className="material-symbols-outlined text-[#225944] text-[18px]">verified</span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-[#6B6B63] block mt-0.5">
                        {p.code} • {p.corridor}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {p.status === 'active' ? 'ACTIVE' : 'PENDING'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMeal(p);
                      }}
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-700 transition"
                      title="Delete Kitchen"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#6B6B63]">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">distance</span>
                  <span>{p.distance}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1 font-bold text-[#171A18]">
                    <span className="material-symbols-outlined text-amber-500 text-[14px]">star</span>
                    <span>{p.rating} ({p.reviewCount})</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {p.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#F8FAF6] border border-[#E5E1D6] text-[10px] font-bold text-[#6B6B63]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-[#E5E1D6] flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-[#6B6B63] block font-normal uppercase">Daily</span>
                      <span className="text-[#171A18]">₹{p.dailyPrice}</span>
                    </div>
                    <div className="h-6 w-px bg-[#E5E1D6]"></div>
                    <div>
                      <span className="text-[10px] text-[#6B6B63] block font-normal uppercase">Monthly</span>
                      <span className="text-[#225944]">₹{p.monthlyPrice}/mo</span>
                    </div>
                  </div>

                  <div className="text-right text-[#6B6B63] font-semibold text-[11px]">
                    <span className="text-[#225944] font-extrabold">{p.activeTiffins}</span> active tiffins
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Provider Detail & Menu Approval Dossier (7 cols) */}
        {!selectedProvider ? (
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E1D6] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E9F1ED] text-[#225944] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">restaurant</span>
            </div>
            <h3 className="font-extrabold text-base text-[#171A18]">No Meal Provider Selected</h3>
            <p className="text-xs text-[#6B6B63] max-w-sm mx-auto">
              {providers.length === 0
                ? 'No meal providers found in database. Click "+ Add Meal Provider" above to add your first kitchen.'
                : 'Select a meal provider from the left column to view weekly menus and FSSAI details.'}
            </p>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E1D6] shadow-sm overflow-hidden space-y-4">
          {/* Dossier Top Cover & Quick Meta */}
          <div className="p-6 bg-[#F8FAF6] border-b border-[#E5E1D6] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-[#171A18]">{selectedProvider.name}</h2>
                  <span className="font-mono text-xs font-bold text-[#225944] bg-[#225944]/10 px-2.5 py-0.5 rounded-full">
                    {selectedProvider.code}
                  </span>
                </div>
                <p className="text-xs text-[#6B6B63] flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">pin_drop</span>
                  <span>{selectedProvider.address}</span>
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E5E1D6] shadow-xs shrink-0">
                <span className="text-[10px] font-bold text-[#6B6B63] uppercase block">FSSAI License</span>
                <span className="font-mono text-xs font-extrabold text-[#171A18]">{selectedProvider.fssai}</span>
              </div>
            </div>

            {/* Kitchen Quick Insights Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#E5E1D6]">
                <span className="text-[10px] text-[#6B6B63] block font-bold uppercase">Kitchen Capacity</span>
                <span className="font-extrabold text-[#171A18]">{selectedProvider.kitchenCapacity}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E5E1D6]">
                <span className="text-[10px] text-[#6B6B63] block font-bold uppercase">Active Enrolled</span>
                <span className="font-extrabold text-[#225944]">{selectedProvider.activeTiffins} Students</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E5E1D6]">
                <span className="text-[10px] text-[#6B6B63] block font-bold uppercase">Inspection Rating</span>
                <span className="font-extrabold text-[#171A18]">{selectedProvider.inspectionGrade}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E5E1D6]">
                <span className="text-[10px] text-[#6B6B63] block font-bold uppercase">Delivery Radius</span>
                <span className="font-extrabold text-[#171A18]">{selectedProvider.deliveryRadius}</span>
              </div>
            </div>
          </div>

          {/* Dossier Navigation Tabs */}
          <div className="px-6 border-b border-[#E5E1D6] flex items-center gap-4 text-xs font-bold">
            {(['menu', 'overview', 'pricing', 'delivery'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`py-3 border-b-2 uppercase transition-all ${
                  activeTab === t
                    ? 'border-[#225944] text-[#225944]'
                    : 'border-transparent text-[#6B6B63] hover:text-[#171A18]'
                }`}
              >
                {t === 'menu'
                  ? 'Weekly Menu & Meals'
                  : t === 'overview'
                  ? 'Overview & FSSAI'
                  : t === 'pricing'
                  ? 'Subscriptions & Pricing'
                  : 'Delivery Corridors'}
              </button>
            ))}
          </div>

          {/* Dossier Content Area */}
          <div className="p-6 space-y-6">
            {/* TAB 1: Weekly Menu & Meals */}
            {activeTab === 'menu' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#225944] text-[20px]">restaurant_menu</span>
                    <h3 className="font-extrabold text-base text-[#171A18]">Meal Schedule Breakdown (Approved Cycle)</h3>
                  </div>
                  <span className="text-xs text-[#6B6B63]">
                    Current: <strong className="text-[#171A18]">Week 17 • Thursday Cycle</strong>
                  </span>
                </div>

                {/* Breakfast Slot */}
                <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#225944]">free_breakfast</span>
                      <span className="text-sm font-extrabold text-[#171A18]">1. Breakfast (7:30 AM – 9:30 AM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Single Meal: ₹{selectedProvider.breakfastPrice}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                        APPROVED
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#171A18] font-medium leading-relaxed">
                    {selectedProvider.breakfastMenu}
                  </p>
                </div>

                {/* Lunch Slot */}
                <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#225944]">lunch_dining</span>
                      <span className="text-sm font-extrabold text-[#171A18]">2. Lunch (Core Student Thali - 12:00 PM – 2:30 PM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Single Meal: ₹{selectedProvider.lunchPrice}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                        APPROVED
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#171A18] font-medium leading-relaxed">
                    {selectedProvider.lunchMenu}
                  </p>
                </div>

                {/* Dinner Slot */}
                <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#225944]">dinner_dining</span>
                      <span className="text-sm font-extrabold text-[#171A18]">3. Dinner (7:30 PM – 10:00 PM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Single Meal: ₹{selectedProvider.dinnerPrice}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                        APPROVED
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#171A18] font-medium leading-relaxed">
                    {selectedProvider.dinnerMenu}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: Overview & FSSAI */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                  <span className="font-extrabold text-xs text-[#171A18] block">FSSAI Hygiene & License Compliance</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#6B6B63] block">License Number</span>
                      <span className="font-mono font-bold text-[#171A18]">{selectedProvider.fssai}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B6B63] block">License Expiry</span>
                      <span className="font-bold text-[#225944]">Dec 31, 2027 (Valid)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B6B63] block">Hygiene Rating</span>
                      <span className="font-bold text-[#171A18]">5 Stars (FSSAI Verified)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B6B63] block">Water Audit</span>
                      <span className="font-bold text-[#171A18]">Commercial RO Installed</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                  <AdminLocationPicker
                    title="Kitchen Location Setup & Live Map Pin"
                    initialValues={
                      selectedProvider.location || {
                        address: selectedProvider.address,
                        landmark: selectedProvider.distance,
                        city: 'Bhilai',
                        state: 'Chhattisgarh',
                        pincode: '490020',
                        latitude: 21.198409,
                        longitude: 81.332444,
                      }
                    }
                    onSaveLocation={(updatedLocation) => {
                      setProviders(
                        providers.map((p) =>
                          p.id === selectedProvider.id ? { ...p, location: updatedLocation } : p
                        )
                      );
                      setSelectedProvider({ ...selectedProvider, location: updatedLocation });
                      alert(`Kitchen GPS location saved for ${selectedProvider.name}!`);
                    }}
                  />
                </div>
              </div>
            )}
            {activeTab === 'pricing' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                  <span className="font-bold text-[#171A18] block">30-Day Classic</span>
                  <div className="text-xl font-extrabold text-[#225944]">₹{selectedProvider.monthlyPrice}</div>
                  <p className="text-[11px] text-[#6B6B63]">Lunch + Dinner (60 meals total). 4 exam pause credits included.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                  <span className="font-bold text-[#171A18] block">30-Day Full Board</span>
                  <div className="text-xl font-extrabold text-[#225944]">₹3,200</div>
                  <p className="text-[11px] text-[#6B6B63]">Breakfast + Lunch + Dinner (90 meals). Unlimited roti refills.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                  <span className="font-bold text-[#171A18] block">15-Day Flexible Trial</span>
                  <div className="text-xl font-extrabold text-[#225944]">₹1,300</div>
                  <p className="text-[11px] text-[#6B6B63]">Lunch OR Dinner (15 flexi-tokens). Ideal for new admissions.</p>
                </div>
              </div>
            )}

            {/* TAB 4: Delivery Corridors */}
            {activeTab === 'delivery' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
                  <span className="font-bold text-[#171A18] block">Junwani Corridor</span>
                  <span className="text-[#6B6B63] text-[11px]">BIT Durg Main Hostels, Gate 1 & 2</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
                  <span className="font-bold text-[#171A18] block">Smriti Nagar</span>
                  <span className="text-[#6B6B63] text-[11px]">Hostel Clusters 1 through 5</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
                  <span className="font-bold text-[#171A18] block">Surya Mall Perimeter</span>
                  <span className="text-[#6B6B63] text-[11px]">Student PG residential lane</span>
                </div>
              </div>
            )}

            {/* Bottom Approval & Operational Action Bar */}
            <div className="pt-4 border-t border-[#E5E1D6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-[#6B6B63]">
                Last inspected by Quality Inspector: <strong className="text-[#171A18]">R. Sen (FSSAI Officer) on 12 April 2026</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteMeal(selectedProvider)}
                  className="px-4 py-2 rounded-full bg-rose-100 text-rose-800 font-bold hover:bg-rose-200 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Delete Kitchen</span>
                </button>
                <button
                  onClick={() => alert(`Approved and published weekly menu for ${selectedProvider.name}!`)}
                  className="px-5 py-2 rounded-full bg-[#225944] text-white font-bold hover:bg-[#184232] shadow-md transition-colors"
                >
                  Approve Menu &amp; Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Redesigned Add Meal Provider Modal */}
      <AddMealProviderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmitProvider={handleAddProviderSubmit}
      />
    </div>
  );
};

export default MealsManagement;
