import React, { useState } from 'react';
import LocationMap from '../common/LocationMap';

export interface LaundryFormData {
  id?: string;
  code?: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  email: string;
  photos: string[];
  // Services & Pricing
  pricePerKg: number;
  steamIronPerPc: number;
  heavyBlanketPrice: number;
  dryCleanBasePrice: number;
  expressSurgeFee: number;
  minOrderWeight: number;
  servicesOffered: string[];
  // Location
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  corridor: string;
  latitude: number;
  longitude: number;
  // Delivery & Operations
  turnaroundHours: number;
  pickupTimings: string;
  doorstepDelivery: boolean;
  barcodeTracking: boolean;
  // Verification & Status
  inspectionGrade: string;
  status: 'active' | 'pending' | 'paused';
}

export interface AddLaundryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLaundry: (data: LaundryFormData) => void;
}

const defaultLaundryPhotos: string[] = [];

const availableServices = [
  'Wash & Fold',
  'Steam Ironing',
  'Heavy Blanket Wash',
  'Dry Cleaning',
  'Shoe Cleaning',
  'Stain Removal Special',
  'Express 24h Delivery',
  'Antibacterial Disinfection',
];

export const AddLaundryModal: React.FC<AddLaundryModalProps> = ({
  isOpen,
  onClose,
  onSubmitLaundry,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [formData, setFormData] = useState<LaundryFormData>({
    name: 'Campus Express Laundry & Dry Cleaners',
    ownerName: 'Vikram Singh',
    ownerPhone: '98765 67890',
    email: 'laundry@easehub.in',
    photos: defaultLaundryPhotos,
    pricePerKg: 40,
    steamIronPerPc: 10,
    heavyBlanketPrice: 150,
    dryCleanBasePrice: 120,
    expressSurgeFee: 49,
    minOrderWeight: 5,
    servicesOffered: ['Wash & Fold', 'Steam Ironing', 'Heavy Blanket Wash', 'Express 24h Delivery'],
    address: 'Shop 8, Coaching Zone Sector 7, Smriti Nagar',
    landmark: 'Near BIT Hostels Gate 1',
    city: 'Bhilai',
    state: 'Chhattisgarh',
    pincode: '490020',
    corridor: 'Smriti Nagar',
    latitude: 21.200150,
    longitude: 81.334100,
    turnaroundHours: 24,
    pickupTimings: '8:00 AM - 11:00 AM & 5:00 PM - 8:00 PM',
    doorstepDelivery: true,
    barcodeTracking: true,
    inspectionGrade: 'Grade A (96/100)',
    status: 'pending',
  });

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  if (!isOpen) return null;

  const handleRemovePhoto = (idxToRemove: number) => {
    const updated = formData.photos.filter((_, idx) => idx !== idxToRemove);
    setFormData({ ...formData, photos: updated });
    if (activePhotoIdx >= updated.length) {
      setActivePhotoIdx(Math.max(0, updated.length - 1));
    }
  };

  const handleAddSamplePhoto = () => {
    alert('Please select an image file to upload.');
  };

  const toggleService = (srv: string) => {
    const exists = formData.servicesOffered.includes(srv);
    setFormData({
      ...formData,
      servicesOffered: exists
        ? formData.servicesOffered.filter((s) => s !== srv)
        : [...formData.servicesOffered, srv],
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
        alert('Location not found. Try searching with city name (e.g. Smriti Nagar Bhilai)');
      }
    } catch (err) {
      alert('Geocoding failed. Please set marker manually on map.');
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleFinalSubmit = (statusToSubmit: 'active' | 'pending' | 'paused') => {
    if (!formData.name.trim()) {
      alert('Please enter a valid Laundry Hub Name.');
      setCurrentStep(1);
      return;
    }
    onSubmitLaundry({ ...formData, status: statusToSubmit });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-6xl w-full shadow-2xl border border-[#E5E1D6] flex flex-col overflow-hidden max-h-[92vh] my-auto">
        
        {/* TOP HERO HEADER */}
        <div className="bg-[#F8FAF6] p-4 sm:p-6 border-b border-[#E5E1D6] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9F1ED] border border-[#225944]/20 flex items-center justify-center text-[#225944] shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[28px]">local_laundry_service</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight">
                Add New Laundry Partner / Hub
              </h2>
              <p className="text-xs text-[#6B6B63] font-medium mt-0.5">
                Register doorstep student laundry partner with weight pricing & tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FFF9E6] border border-[#F3E8B8] text-xs">
              <span className="material-symbols-outlined text-[#EECA3A] text-[20px] shrink-0">local_shipping</span>
              <div className="text-left">
                <span className="font-bold text-[#171A18] block leading-none">Doorstep Hostel Pickup</span>
                <span className="text-[11px] text-[#6B6B63] mt-0.5 block">Automated tag codes ensure zero lost clothes.</span>
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
                { id: 1, title: 'Provider Basics', desc: 'Laundry hub & photos' },
                { id: 2, title: 'Services & Pricing', desc: 'Rate per kg & steam iron' },
                { id: 3, title: 'Exact Location', desc: 'Address & map pin' },
                { id: 4, title: 'Pickup & Delivery', desc: 'Turnaround & slots' },
                { id: 5, title: 'Verification & Publish', desc: 'Inspection & submit' },
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
                    <h3 className="text-lg font-extrabold text-[#171A18]">1. Provider Basics</h3>
                    <p className="text-xs text-[#6B6B63]">Laundry hub details and facility photos.</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#171A18]">Facility Photos</label>
                      <span className="text-[11px] text-[#6B6B63] font-semibold">{formData.photos.length}/8 photos</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={handleAddSamplePhoto}
                        className="border-2 border-dashed border-[#225944]/30 hover:border-[#225944] rounded-2xl p-4 bg-[#F8FAF6] hover:bg-[#E9F1ED]/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px] group"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                        </div>
                        <span className="text-xs font-bold text-[#171A18]">Upload facility photos</span>
                        <span className="text-[10px] text-[#6B6B63] mt-0.5">Washing machines & steam iron setup</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {formData.photos.map((url, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#E5E1D6] h-16 bg-slate-100">
                            <img src={url} alt={`Laundry preview ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[12px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3.5 shadow-xs text-xs">
                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Laundry Hub Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Campus Express Laundry & Steam Iron"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#225944]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E5E1D6]">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Owner / Manager Name</label>
                        <input
                          type="text"
                          value={formData.ownerName}
                          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                          placeholder="e.g. Vikram Singh"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={formData.ownerPhone}
                          onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                          placeholder="e.g. 98765 67890"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SERVICES & PRICING */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">2. Services & Weight Pricing</h3>
                    <p className="text-xs text-[#6B6B63]">Set per kg rates, steam ironing, and heavy wash charges.</p>
                  </div>

                  {/* Services Checklist */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-2 shadow-xs">
                    <label className="block text-xs font-bold text-[#171A18]">Offered Laundry Services</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {availableServices.map((srv) => {
                        const active = formData.servicesOffered.includes(srv);
                        return (
                          <button
                            key={srv}
                            type="button"
                            onClick={() => toggleService(srv)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              active
                                ? 'bg-[#225944] text-white shadow-xs'
                                : 'bg-[#F8FAF6] text-[#6B6B63] border border-[#E5E1D6] hover:bg-slate-100'
                            }`}
                          >
                            {srv}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing Fields */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3.5 shadow-xs text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Wash & Fold / Kg (₹) *</label>
                        <input
                          type="number"
                          value={formData.pricePerKg}
                          onChange={(e) => setFormData({ ...formData, pricePerKg: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-sm text-[#225944]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Steam Iron / Piece (₹)</label>
                        <input
                          type="number"
                          value={formData.steamIronPerPc}
                          onChange={(e) => setFormData({ ...formData, steamIronPerPc: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-sm text-[#171A18]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E5E1D6]">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Heavy Blanket Wash (₹)</label>
                        <input
                          type="number"
                          value={formData.heavyBlanketPrice}
                          onChange={(e) => setFormData({ ...formData, heavyBlanketPrice: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Express 24h Surge (₹)</label>
                        <input
                          type="number"
                          value={formData.expressSurgeFee}
                          onChange={(e) => setFormData({ ...formData, expressSurgeFee: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LOCATION */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">3. Hub Location & Map Pin</h3>
                    <p className="text-xs text-[#6B6B63]">Pin central laundry workshop location on map.</p>
                  </div>

                  <form onSubmit={handleSearchLocation} className="flex gap-2">
                    <input
                      type="text"
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      placeholder="Search hub address (e.g. Smriti Nagar Bhilai)..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D6] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#225944]"
                    />
                    <button
                      type="submit"
                      disabled={isSearchingMap}
                      className="px-4 py-2.5 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#184232] transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">search</span>
                      {isSearchingMap ? 'Locating...' : 'Locate'}
                    </button>
                  </form>

                  <div className="bg-white p-3 rounded-2xl border border-[#E5E1D6] space-y-2 shadow-xs">
                    <LocationMap
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      title={formData.name}
                      address={formData.address}
                      interactive={true}
                      onLocationChange={handleLocationChange}
                      className="w-full h-56 rounded-xl border border-[#E5E1D6]"
                    />
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Street Address *</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Primary Coverage Corridor *</label>
                      <select
                        value={formData.corridor}
                        onChange={(e) => setFormData({ ...formData, corridor: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#171A18]"
                      >
                        <option value="Smriti Nagar">Smriti Nagar Corridor</option>
                        <option value="Junwani">Junwani (BIT Corridor)</option>
                        <option value="Nehru Nagar">Nehru Nagar</option>
                        <option value="Civic Center">Civic Center</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PICKUP & DELIVERY */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">4. Doorstep Pickup & Turnaround</h3>
                    <p className="text-xs text-[#6B6B63]">Configure delivery turnaround hours and student pickup slots.</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3.5 shadow-xs text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Standard Turnaround (Hours)</label>
                        <input
                          type="number"
                          value={formData.turnaroundHours}
                          onChange={(e) => setFormData({ ...formData, turnaroundHours: parseInt(e.target.value) || 24 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#225944]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Pickup Timings Slot</label>
                        <input
                          type="text"
                          value={formData.pickupTimings}
                          onChange={(e) => setFormData({ ...formData, pickupTimings: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-semibold text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E5E1D6] space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.doorstepDelivery}
                          onChange={(e) => setFormData({ ...formData, doorstepDelivery: e.target.checked })}
                          className="w-4 h-4 rounded text-[#225944] focus:ring-[#225944]"
                        />
                        <span className="font-bold text-[#171A18]">Enable Doorstep Hostel Room Pickup & Drop</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.barcodeTracking}
                          onChange={(e) => setFormData({ ...formData, barcodeTracking: e.target.checked })}
                          className="w-4 h-4 rounded text-[#225944] focus:ring-[#225944]"
                        />
                        <span className="font-bold text-[#171A18]">Enable Barcode Bag Tagging (Prevents mixups)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: VERIFICATION & PUBLISH */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">5. Verification & Publish</h3>
                    <p className="text-xs text-[#6B6B63]">Review partner summary and publish for live student bookings.</p>
                  </div>

                  <div className="bg-[#E9F1ED] p-4 rounded-2xl border border-[#225944]/20 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#225944] font-bold text-sm">
                      <span className="material-symbols-outlined text-[22px]">verified</span>
                      <span>Operational Audit Complete</span>
                    </div>
                    <p className="text-[#6B6B63]">
                      This partner will be listed in EaseHub Doorstep Laundry module with barcode pickup support.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <h4 className="font-bold text-[#171A18]">Partner Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Hub Name:</span>
                        <strong className="text-[#171A18] font-extrabold">{formData.name}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Rate / Kg:</span>
                        <strong className="text-[#225944] font-extrabold">₹{formData.pricePerKg}/kg</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Steam Iron / pc:</span>
                        <strong className="text-[#171A18] font-extrabold">₹{formData.steamIronPerPc}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Turnaround:</span>
                        <strong className="text-[#171A18] font-extrabold">{formData.turnaroundHours} Hours</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-2 shadow-xs text-xs">
                    <label className="block font-bold text-[#171A18]">Listing Status</label>
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
                        onClick={() => setFormData({ ...formData, status: 'paused' })}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          formData.status === 'paused'
                            ? 'bg-slate-700 text-white border-slate-700 font-bold'
                            : 'bg-[#F8FAF6] text-[#6B6B63] border-[#E5E1D6]'
                        }`}
                      >
                        Draft / Paused
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
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Live Student App View
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E9F1ED] text-[#225944] text-[10px] font-extrabold">
                    Preview
                  </span>
                </div>

                <div className="rounded-2xl border border-[#E5E1D6] overflow-hidden bg-white shadow-sm space-y-0">
                  <div className="relative h-44 bg-slate-100 group">
                    <img
                      src={formData.photos[activePhotoIdx] || defaultLaundryPhotos[0]}
                      alt="Laundry hub"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        ⚡ {formData.turnaroundHours}h Express Return
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <h4 className="font-black text-sm drop-shadow-sm truncate">{formData.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-200">
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        <span className="truncate">Doorstep Hostel Pickup</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#6B6B63] font-bold block leading-none">Wash & Steam Iron</span>
                        <span className="text-base font-black text-[#225944]">₹{formData.pricePerKg}</span>
                        <span className="text-[9px] text-[#6B6B63] block">/ kg weight</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#6B6B63] font-bold block leading-none">Steam Iron Only</span>
                        <span className="text-sm font-black text-[#171A18]">₹{formData.steamIronPerPc}</span>
                        <span className="text-[9px] text-[#6B6B63] block">per clothes pc</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#171A18]">Included Laundry Services:</span>
                      <div className="flex flex-wrap gap-1">
                        {formData.servicesOffered.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-[#E9F1ED] text-[#225944] text-[10px] font-bold">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl bg-[#225944] text-white font-extrabold text-xs shadow-sm hover:bg-[#184232] transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Book Doorstep Pickup</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
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
              onClick={() => handleFinalSubmit('paused')}
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
                <span>Publish Laundry Partner</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddLaundryModal;
