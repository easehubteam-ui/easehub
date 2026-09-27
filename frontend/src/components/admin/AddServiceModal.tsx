import React, { useState } from 'react';
import LocationMap from '../common/LocationMap';

export interface ServiceFormData {
  id?: string;
  code?: string;
  name: string;
  category: 'Electrical' | 'Plumbing' | 'Cleaning' | 'Appliance' | 'IT Support';
  icon: string;
  description: string;
  photos: string[];
  // Pricing & Details
  basePrice: number;
  nightSurge: number;
  extendedLaborRate: string;
  includedScope: string[];
  excludedItems: string;
  // Coverage & SLA
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  coverageCorridors: string[];
  slaMins: number;
  slaGuarantee: string;
  latitude: number;
  longitude: number;
  // Tech Assignment
  primaryTechName: string;
  primaryTechRole: string;
  primaryTechRating: number;
  activeTechsCount: number;
  // Verification & Status
  status: 'active' | 'pending' | 'disabled';
}

export interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitService: (data: ServiceFormData) => void;
}

const availableIcons = [
  'electric_bolt',
  'plumbing',
  'cleaning_services',
  'build',
  'router',
  'hvac',
  'handyman',
  'format_paint',
];

const availableCorridors = ['Junwani', 'Smriti Nagar', 'Nehru Nagar', 'Civic Center'];

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onSubmitService,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [formData, setFormData] = useState<ServiceFormData>({
    name: 'Electrical & Wiring Repair',
    category: 'Electrical',
    icon: 'electric_bolt',
    description: 'Short circuits, switchboard fixes, fan installation, tube lights, and MCB tripping troubleshooting.',
    photos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 149,
    nightSurge: 99,
    extendedLaborRate: '₹100 / 30 mins after initial 45 mins',
    includedScope: ['Switchboard & Socket Repair', 'Ceiling Fan Installation & Regulator', 'MCB Tripping Fix', 'LED Tube Light Replacement'],
    excludedItems: 'Material parts cost extra (bulbs, switches, wires purchased at MRP).',
    address: 'Central Service Dispatch Center, Junwani Road',
    landmark: 'Opposite BIT Gate 2',
    city: 'Bhilai',
    state: 'Chhattisgarh',
    pincode: '490020',
    coverageCorridors: ['Junwani', 'Smriti Nagar', 'Nehru Nagar', 'Civic Center'],
    slaMins: 30,
    slaGuarantee: '30 min Express SLA',
    latitude: 21.198409,
    longitude: 81.332444,
    primaryTechName: 'Ramesh Sahu',
    primaryTechRole: 'Master Electrician',
    primaryTechRating: 4.9,
    activeTechsCount: 28,
    status: 'pending',
  });

  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  if (!isOpen) return null;

  const toggleCorridor = (c: string) => {
    const exists = formData.coverageCorridors.includes(c);
    setFormData({
      ...formData,
      coverageCorridors: exists
        ? formData.coverageCorridors.filter((cor) => cor !== c)
        : [...formData.coverageCorridors, c],
    });
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    }));
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchQuery.trim()) return;

    try {
      setIsSearchingMap(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        setFormData((prev) => ({
          ...prev,
          latitude: Number(parseFloat(first.lat).toFixed(6)),
          longitude: Number(parseFloat(first.lon).toFixed(6)),
          address: first.display_name.slice(0, 100),
        }));
      } else {
        alert('Location not found. Try searching with city name (e.g. Junwani Bhilai)');
      }
    } catch (err) {
      alert('Geocoding failed. Please set marker manually on map.');
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleFinalSubmit = (statusToSubmit: 'active' | 'pending' | 'disabled') => {
    if (!formData.name.trim()) {
      alert('Please enter a valid Service Category Name.');
      setCurrentStep(1);
      return;
    }
    onSubmitService({ ...formData, status: statusToSubmit });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-6xl w-full shadow-2xl border border-[#E5E1D6] flex flex-col overflow-hidden max-h-[92vh] my-auto">
        
        {/* TOP HERO HEADER */}
        <div className="bg-[#F8FAF6] p-4 sm:p-6 border-b border-[#E5E1D6] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9F1ED] border border-[#225944]/20 flex items-center justify-center text-[#225944] shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[28px]">{formData.icon}</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight">
                Add New Extra Service Category
              </h2>
              <p className="text-xs text-[#6B6B63] font-medium mt-0.5">
                Configure handyman, electrical, plumbing, or cleaning service offerings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FFF9E6] border border-[#F3E8B8] text-xs">
              <span className="material-symbols-outlined text-[#EECA3A] text-[20px] shrink-0">bolt</span>
              <div className="text-left">
                <span className="font-bold text-[#171A18] block leading-none">Express SLA Guarantee</span>
                <span className="text-[11px] text-[#6B6B63] mt-0.5 block">Clear response SLA guarantees student satisfaction.</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-[#6B6B63] transition-colors shrink-0"
              title="Close modal"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAF6]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* STEP NAVIGATION (3 COLS) */}
            <div className="lg:col-span-3 space-y-2 bg-white p-3 rounded-2xl border border-[#E5E1D6] shadow-xs">
              {[
                { id: 1, title: 'Service Basics', desc: 'Category name, icon & desc' },
                { id: 2, title: 'Pricing & Scope', desc: 'Base visit fee & night surge' },
                { id: 3, title: 'Coverage & SLA', desc: 'Corridors & express SLA' },
                { id: 4, title: 'Technicians', desc: 'Assigned tech master' },
                { id: 5, title: 'Verification & Publish', desc: 'SLA check & final submit' },
              ].map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id as any)}
                    className={`w-full p-3 rounded-xl flex items-start gap-3 transition-all text-left ${
                      isActive
                        ? 'bg-[#E9F1ED] border border-[#225944]/30 shadow-xs'
                        : 'hover:bg-[#F8FAF6]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isActive
                          ? 'bg-[#225944] text-white'
                          : 'bg-slate-100 text-[#6B6B63]'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`text-xs font-extrabold block leading-tight ${
                          isActive ? 'text-[#225944]' : 'text-[#171A18]'
                        }`}
                      >
                        {step.id}. {step.title}
                      </span>
                      <span className="text-[11px] text-[#6B6B63] block mt-0.5 truncate font-medium">
                        {step.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* FORM CONTENT (5 COLS) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* STEP 1: BASICS */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">1. Service Basics</h3>
                    <p className="text-xs text-[#6B6B63]">Define service category title, icon and description.</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3.5 shadow-xs text-xs">
                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Service Title *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Electrical & Wiring Repair"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#225944]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Category Type</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#171A18]"
                        >
                          <option value="Electrical">Electrical</option>
                          <option value="Plumbing">Plumbing</option>
                          <option value="Cleaning">Cleaning</option>
                          <option value="Appliance">Appliance Repair</option>
                          <option value="IT Support">IT & Wi-Fi Support</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Category Icon</label>
                        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#F8FAF6] rounded-xl border border-[#E5E1D6]">
                          {availableIcons.map((ic) => (
                            <button
                              key={ic}
                              type="button"
                              onClick={() => setFormData({ ...formData, icon: ic })}
                              className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                                formData.icon === ic
                                  ? 'bg-[#225944] text-white'
                                  : 'text-[#6B6B63] hover:bg-slate-200'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">{ic}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Service Description</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PRICING & SCOPE */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">2. Base Pricing & Scope</h3>
                    <p className="text-xs text-[#6B6B63]">Set visit charge, night surge fee, and included job scope.</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3.5 shadow-xs text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Base Visit Fee (₹) *</label>
                        <input
                          type="number"
                          value={formData.basePrice}
                          onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-base text-[#225944]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Night Emergency Surge (₹)</label>
                        <input
                          type="number"
                          value={formData.nightSurge}
                          onChange={(e) => setFormData({ ...formData, nightSurge: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-base text-amber-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Extended Labor Charge Terms</label>
                      <input
                        type="text"
                        value={formData.extendedLaborRate}
                        onChange={(e) => setFormData({ ...formData, extendedLaborRate: e.target.value })}
                        placeholder="e.g. ₹100 / 30 mins after initial 45 mins"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-semibold text-xs"
                      />
                    </div>

                    <div className="pt-2 border-t border-[#E5E1D6] space-y-2">
                      <label className="block font-bold text-[#171A18]">Excluded Parts / Material Note</label>
                      <input
                        type="text"
                        value={formData.excludedItems}
                        onChange={(e) => setFormData({ ...formData, excludedItems: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: COVERAGE & SLA */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">3. Coverage Area & Response SLA</h3>
                    <p className="text-xs text-[#6B6B63]">Select corridors and promised technician response time.</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <label className="block font-bold text-[#171A18]">Supported Student Corridors</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableCorridors.map((c) => {
                        const active = formData.coverageCorridors.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleCorridor(c)}
                            className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                              active
                                ? 'bg-[#225944] text-white border-[#225944]'
                                : 'bg-[#F8FAF6] text-[#6B6B63] border-[#E5E1D6]'
                            }`}
                          >
                            {c} Corridor
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3.5 shadow-xs text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Promised SLA (Minutes)</label>
                        <input
                          type="number"
                          value={formData.slaMins}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 30;
                            setFormData({
                              ...formData,
                              slaMins: val,
                              slaGuarantee: `${val} min Express SLA`,
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#225944]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Dispatch Hub Address</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-semibold text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: TECHNICIANS */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">4. Technician Master Assignment</h3>
                    <p className="text-xs text-[#6B6B63]">Assign lead technician and verify team capacity.</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3.5 shadow-xs text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Lead Master Technician</label>
                        <input
                          type="text"
                          value={formData.primaryTechName}
                          onChange={(e) => setFormData({ ...formData, primaryTechName: e.target.value })}
                          placeholder="e.g. Ramesh Sahu"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Technician Specialization</label>
                        <input
                          type="text"
                          value={formData.primaryTechRole}
                          onChange={(e) => setFormData({ ...formData, primaryTechRole: e.target.value })}
                          placeholder="e.g. Master Electrician"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E5E1D6]">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Active Technicians Pool</label>
                        <input
                          type="number"
                          value={formData.activeTechsCount}
                          onChange={(e) => setFormData({ ...formData, activeTechsCount: parseInt(e.target.value) || 10 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#225944]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Lead Tech Star Rating</label>
                        <input
                          type="number"
                          step="0.1"
                          max="5.0"
                          value={formData.primaryTechRating}
                          onChange={(e) => setFormData({ ...formData, primaryTechRating: parseFloat(e.target.value) || 4.8 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-amber-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: VERIFICATION & PUBLISH */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">5. Verification & Publish</h3>
                    <p className="text-xs text-[#6B6B63]">Review service category details and enable on app.</p>
                  </div>

                  <div className="bg-[#E9F1ED] p-4 rounded-2xl border border-[#225944]/20 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#225944] font-bold text-sm">
                      <span className="material-symbols-outlined text-[22px]">verified</span>
                      <span>SLA Compliance Guaranteed</span>
                    </div>
                    <p className="text-[#6B6B63]">
                      Students can request quotes or instant technician dispatch under {formData.slaGuarantee}.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <h4 className="font-bold text-[#171A18]">Service Category Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Category Title:</span>
                        <strong className="text-[#171A18] font-extrabold">{formData.name}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Base Visit Fee:</span>
                        <strong className="text-[#225944] font-extrabold">₹{formData.basePrice}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Express SLA:</span>
                        <strong className="text-[#171A18] font-extrabold">{formData.slaGuarantee}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Active Techs:</span>
                        <strong className="text-[#225944] font-extrabold">{formData.activeTechsCount} Technicians</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-2 shadow-xs text-xs">
                    <label className="block font-bold text-[#171A18]">Category Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'active' })}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          formData.status === 'active'
                            ? 'bg-[#225944] text-white border-[#225944] font-bold'
                            : 'bg-[#F8FAF6] text-[#6B6B63] border-[#E5E1D6]'
                        }`}
                      >
                        Active Live
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'pending' })}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          formData.status === 'pending'
                            ? 'bg-amber-500 text-white border-amber-500 font-bold'
                            : 'bg-[#F8FAF6] text-[#6B6B63] border-[#E5E1D6]'
                        }`}
                      >
                        Pending Audit
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'disabled' })}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          formData.status === 'disabled'
                            ? 'bg-slate-700 text-white border-slate-700 font-bold'
                            : 'bg-[#F8FAF6] text-[#6B6B63] border-[#E5E1D6]'
                        }`}
                      >
                        Disabled
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE LIVE STUDENT PREVIEW SIDEBAR (4 COLS) */}
            <div className="lg:col-span-4 sticky top-0 space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-[#E5E1D6] shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#171A18] tracking-wider uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#EECA3A] animate-pulse"></span>
                    Live Student App View
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E9F1ED] text-[#225944] text-[10px] font-extrabold">
                    Preview
                  </span>
                </div>

                <div className="rounded-2xl border border-[#E5E1D6] overflow-hidden bg-white shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#E9F1ED] text-[#225944] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[24px]">{formData.icon}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                      ⚡ {formData.slaGuarantee}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-[#171A18]">{formData.name}</h4>
                    <p className="text-[11px] text-[#6B6B63] mt-0.5 line-clamp-2">{formData.description}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#6B6B63] font-bold block leading-none">Base Inspection Fee</span>
                      <span className="text-base font-black text-[#225944]">₹{formData.basePrice}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#6B6B63] font-bold block leading-none">Night Surge</span>
                      <span className="text-xs font-bold text-amber-700">+₹{formData.nightSurge}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[#E5E1D6] bg-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#225944] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      ★
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#171A18] block leading-tight truncate">
                        {formData.primaryTechName} ({formData.primaryTechRating} ★)
                      </span>
                      <span className="text-[10px] text-[#6B6B63] block truncate">{formData.primaryTechRole}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-[#225944] text-white font-extrabold text-xs shadow-sm hover:bg-[#184232] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Request Service Dispatch</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* STICKY BOTTOM ACTIONS BAR */}
        <div className="bg-white p-4 border-t border-[#E5E1D6] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-extrabold text-[#171A18] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleFinalSubmit('disabled')}
              className="px-4 py-2.5 rounded-xl border border-[#E5E1D6] hover:bg-slate-100 text-xs font-extrabold text-[#6B6B63] transition-colors"
            >
              Save as Draft
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-extrabold text-[#171A18] transition-colors"
              >
                Back
              </button>
            )}

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                className="px-6 py-2.5 rounded-full bg-[#225944] text-white text-xs font-extrabold hover:bg-[#184232] shadow-md transition-colors flex items-center gap-1"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={() => handleFinalSubmit('active')}
                className="px-6 py-2.5 rounded-full bg-[#225944] text-white text-xs font-extrabold hover:bg-[#184232] shadow-lg transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span>Publish Service Category</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddServiceModal;
