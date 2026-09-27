import React, { useState, useRef } from 'react';
import LocationPicker from '../common/LocationPicker';
import { storageApi } from '../../services/storageApi';

export interface MealProviderFormData {
  id?: string;
  code?: string;
  name: string;
  fssai: string;
  businessType: 'Mess' | 'Tiffin Service' | 'Catering & Mess';
  ownerName: string;
  ownerPhone: string;
  email: string;
  photos: string[];
  // Menu & Plans
  tags: string[];
  dailyPrice: number;
  monthlyPrice: number;
  breakfastMenu: string;
  breakfastPrice: number;
  lunchMenu: string;
  lunchPrice: number;
  dinnerMenu: string;
  dinnerPrice: number;
  flexiTrialPrice: number;
  // Location
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  corridor: string;
  distance: string;
  latitude: number | null;
  longitude: number | null;
  // Capacity & Operations
  kitchenCapacity: string;
  deliveryRadius: string;
  breakfastTiming: string;
  lunchTiming: string;
  dinnerTiming: string;
  // Verification & Status
  inspectionGrade: string;
  fssaiVerified: boolean;
  status: 'active' | 'pending' | 'paused';
}

export interface AddMealProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProvider: (data: MealProviderFormData) => void;
  initialData?: Partial<MealProviderFormData>;
}

const defaultMealPhotos: string[] = [];

const availableTags = [
  'Pure Veg',
  'Non-Veg Option',
  'North Indian',
  'South Indian',
  'Gujarati Thali',
  'Unlimited Rotis',
  'Jain Special',
  'Egg Curry Sundays',
  'Home Style Cooking',
  'RO Water Prepared',
];

export const AddMealProviderModal: React.FC<AddMealProviderModalProps> = ({
  isOpen,
  onClose,
  onSubmitProvider,
  initialData,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<MealProviderFormData>({
    name: initialData?.name || '',
    fssai: initialData?.fssai || '',
    businessType: initialData?.businessType || 'Mess',
    ownerName: initialData?.ownerName || '',
    ownerPhone: initialData?.ownerPhone || '',
    email: initialData?.email || '',
    photos: initialData?.photos || defaultMealPhotos,
    tags: initialData?.tags || ['Pure Veg', 'North Indian'],
    dailyPrice: initialData?.dailyPrice || 0,
    monthlyPrice: initialData?.monthlyPrice || 0,
    breakfastMenu: initialData?.breakfastMenu || '',
    breakfastPrice: initialData?.breakfastPrice || 0,
    lunchMenu: initialData?.lunchMenu || '',
    lunchPrice: initialData?.lunchPrice || 0,
    dinnerMenu: initialData?.dinnerMenu || '',
    dinnerPrice: initialData?.dinnerPrice || 0,
    flexiTrialPrice: initialData?.flexiTrialPrice || 0,
    address: initialData?.address || '',
    landmark: initialData?.landmark || '',
    city: initialData?.city || 'Bhilai',
    state: initialData?.state || 'Chhattisgarh',
    pincode: initialData?.pincode || '',
    corridor: initialData?.corridor || 'Junwani',
    distance: initialData?.distance || '',
    latitude: initialData?.latitude ?? null,
    longitude: initialData?.longitude ?? null,
    kitchenCapacity: '350 Meals/day',
    deliveryRadius: '4.5 km buffer',
    breakfastTiming: '7:30 AM - 9:30 AM',
    lunchTiming: '12:30 PM - 3:00 PM',
    dinnerTiming: '7:30 PM - 10:00 PM',
    inspectionGrade: 'Grade A+ (98/100)',
    fssaiVerified: true,
    status: 'pending',
  });

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activePreviewTab, setActivePreviewTab] = useState<'lunch' | 'breakfast' | 'dinner'>('lunch');
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await storageApi.uploadMealImage(file, file.name);
        if (res.url) {
          uploadedUrls.push(res.url);
        }
      }
      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...uploadedUrls],
        }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload meal photo to InsForge Storage.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddSamplePhoto = () => {
    fileInputRef.current?.click();
  };

  const toggleTag = (tag: string) => {
    const exists = formData.tags.includes(tag);
    setFormData({
      ...formData,
      tags: exists ? formData.tags.filter((t) => t !== tag) : [...formData.tags, tag],
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

  const handleFinalSubmit = (statusToSubmit: 'active' | 'pending' | 'paused') => {
    if (!formData.name.trim()) {
      alert('Please enter a valid Mess Business Name.');
      setCurrentStep(1);
      return;
    }
    if (!formData.fssai.trim()) {
      alert('Please enter a valid FSSAI License Number.');
      setCurrentStep(1);
      return;
    }
    onSubmitProvider({ ...formData, status: statusToSubmit });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-6xl w-full shadow-2xl border border-[#E5E1D6] flex flex-col overflow-hidden max-h-[92vh] my-auto">
        
        {/* TOP HERO HEADER */}
        <div className="bg-[#F8FAF6] p-4 sm:p-6 border-b border-[#E5E1D6] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9F1ED] border border-[#225944]/20 flex items-center justify-center text-[#225944] shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[28px]">restaurant</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight">
                Add New Mess / Meal Provider
              </h2>
              <p className="text-xs text-[#6B6B63] font-medium mt-0.5">
                Register a FSSAI verified student tiffin center & mess facility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FFF9E6] border border-[#F3E8B8] text-xs">
              <span className="material-symbols-outlined text-[#EECA3A] text-[20px] shrink-0">verified</span>
              <div className="text-left">
                <span className="font-bold text-[#171A18] block leading-none">FSSAI Verification Required</span>
                <span className="text-[11px] text-[#6B6B63] mt-0.5 block">Clear menus & daily prices boost tiffin subscriptions.</span>
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

        {/* WORKSPACE GRID: STEPPER (3) | FORM (5) | PREVIEW (4) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAF6]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* STEP NAVIGATION */}
            <div className="lg:col-span-3 space-y-2 bg-white p-3 rounded-2xl border border-[#E5E1D6] shadow-xs">
              {[
                { id: 1, title: 'Provider Basics', desc: 'Kitchen name, FSSAI & photos' },
                { id: 2, title: 'Menu & Plans', desc: 'Veg/Non-Veg, daily thali' },
                { id: 3, title: 'Exact Location', desc: 'Address & interactive map' },
                { id: 4, title: 'Capacity & Timings', desc: 'Daily count & delivery buffer' },
                { id: 5, title: 'Verification & Publish', desc: 'FSSAI grade & final submit' },
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
                    <p className="text-xs text-[#6B6B63]">Enter business credentials and kitchen photos.</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      multiple
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#171A18]">Kitchen Photos</label>
                      <span className="text-[11px] text-[#6B6B63] font-semibold">{formData.photos.length}/8 photos</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={handleAddSamplePhoto}
                        className="border-2 border-dashed border-[#225944]/30 hover:border-[#225944] rounded-2xl p-4 bg-[#F8FAF6] hover:bg-[#E9F1ED]/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px] group"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#225944]/10 text-[#225944] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                          {isUploading ? (
                            <span className="w-5 h-5 border-2 border-[#225944] border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-[#171A18]">
                          {isUploading ? 'Uploading to InsForge...' : 'Click to upload food photos'}
                        </span>
                        <span className="text-[10px] text-[#6B6B63] mt-0.5">High quality food images</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {formData.photos.map((url, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#E5E1D6] h-16 bg-slate-100">
                            <img src={url} alt={`Food preview ${idx}`} className="w-full h-full object-cover" />
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
                      <label className="block font-bold text-[#171A18] mb-1">Mess / Tiffin Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Annapurna Swad Student Mess"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#225944]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">FSSAI License No. *</label>
                        <input
                          type="text"
                          value={formData.fssai}
                          onChange={(e) => setFormData({ ...formData, fssai: e.target.value })}
                          placeholder="14-digit FSSAI Number"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#225944]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Business Type</label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => setFormData({ ...formData, businessType: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-bold text-[#171A18] focus:outline-none"
                        >
                          <option value="Mess">Mess Facility</option>
                          <option value="Tiffin Service">Doorstep Tiffin Service</option>
                          <option value="Catering & Mess">Catering & Tiffin Mess</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E5E1D6]">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Vendor / Manager Name</label>
                        <input
                          type="text"
                          value={formData.ownerName}
                          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                          placeholder="e.g. Ramesh Sharma"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={formData.ownerPhone}
                          onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                          placeholder="e.g. 98765 12345"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: MENU & PLANS */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">2. Menu & Pricing Plans</h3>
                    <p className="text-xs text-[#6B6B63]">Define daily menus, thali contents, and pricing.</p>
                  </div>

                  {/* Food Tags */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-2 shadow-xs">
                    <label className="block text-xs font-bold text-[#171A18]">Food Categories & Badges</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {availableTags.map((tag) => {
                        const active = formData.tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              active
                                ? 'bg-[#225944] text-white shadow-xs'
                                : 'bg-[#F8FAF6] text-[#6B6B63] border border-[#E5E1D6] hover:bg-slate-100'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <h4 className="font-bold text-[#171A18] text-xs">Pricing & Subscriptions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#6B6B63] font-bold mb-1">Monthly Plan (₹)</label>
                        <input
                          type="number"
                          value={formData.monthlyPrice}
                          onChange={(e) => setFormData({ ...formData, monthlyPrice: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-sm text-[#225944]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#6B6B63] font-bold mb-1">Try Today Thali (₹)</label>
                        <input
                          type="number"
                          value={formData.dailyPrice}
                          onChange={(e) => setFormData({ ...formData, dailyPrice: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-sm text-[#171A18]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Daily Menus */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <h4 className="font-bold text-[#171A18] text-xs">Daily Menu Items</h4>
                    
                    <div className="space-y-2">
                      <label className="block font-bold text-[#225944]">Breakfast Items</label>
                      <input
                        type="text"
                        value={formData.breakfastMenu}
                        onChange={(e) => setFormData({ ...formData, breakfastMenu: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-bold text-[#225944]">Lunch Thali Menu</label>
                      <textarea
                        rows={2}
                        value={formData.lunchMenu}
                        onChange={(e) => setFormData({ ...formData, lunchMenu: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-bold text-[#225944]">Dinner Thali Menu</label>
                      <textarea
                        rows={2}
                        value={formData.dinnerMenu}
                        onChange={(e) => setFormData({ ...formData, dinnerMenu: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LOCATION */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">3. Exact Kitchen Location</h3>
                    <p className="text-xs text-[#6B6B63]">Pin map location for accurate student doorstep tiffin delivery.</p>
                  </div>

                  <LocationPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    address={formData.address}
                    landmark={formData.landmark}
                    city={formData.city}
                    state={formData.state}
                    pincode={formData.pincode}
                    onLocationSelect={(loc) => {
                      setFormData((prev) => ({
                        ...prev,
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                        address: loc.address || prev.address,
                        landmark: loc.landmark || prev.landmark,
                        city: loc.city || prev.city,
                        state: loc.state || prev.state,
                        pincode: loc.pincode || prev.pincode,
                      }));
                    }}
                  />

                  <div className="bg-white p-3.5 rounded-2xl border border-[#E5E1D6] space-y-2 shadow-xs text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Delivery Corridor *</label>
                        <select
                          value={formData.corridor}
                          onChange={(e) => setFormData({ ...formData, corridor: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#171A18]"
                        >
                          <option value="Junwani">Junwani Corridor</option>
                          <option value="Smriti Nagar">Smriti Nagar</option>
                          <option value="Nehru Nagar">Nehru Nagar</option>
                          <option value="Civic Center">Civic Center</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Distance Proximity</label>
                        <input
                          type="text"
                          value={formData.distance}
                          onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                          placeholder="e.g. 400m to BIT Gate 2"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CAPACITY & TIMINGS */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">4. Capacity & Operations</h3>
                    <p className="text-xs text-[#6B6B63]">Set meal production limits and delivery windows.</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3.5 shadow-xs text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Daily Kitchen Capacity</label>
                        <input
                          type="text"
                          value={formData.kitchenCapacity}
                          onChange={(e) => setFormData({ ...formData, kitchenCapacity: e.target.value })}
                          placeholder="e.g. 350 Meals/day"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#225944]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Delivery Radius Buffer</label>
                        <input
                          type="text"
                          value={formData.deliveryRadius}
                          onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value })}
                          placeholder="e.g. 4.5 km buffer"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E5E1D6] space-y-3">
                      <h4 className="font-bold text-[#171A18]">Meal Dispatch Windows</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] text-[#6B6B63] font-bold mb-1">Breakfast</label>
                          <input
                            type="text"
                            value={formData.breakfastTiming}
                            onChange={(e) => setFormData({ ...formData, breakfastTiming: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-[11px] font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#6B6B63] font-bold mb-1">Lunch</label>
                          <input
                            type="text"
                            value={formData.lunchTiming}
                            onChange={(e) => setFormData({ ...formData, lunchTiming: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-[11px] font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#6B6B63] font-bold mb-1">Dinner</label>
                          <input
                            type="text"
                            value={formData.dinnerTiming}
                            onChange={(e) => setFormData({ ...formData, dinnerTiming: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-[11px] font-semibold"
                          />
                        </div>
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
                    <p className="text-xs text-[#6B6B63]">Review mess details and submit for student listing.</p>
                  </div>

                  <div className="bg-[#E9F1ED] p-4 rounded-2xl border border-[#225944]/20 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#225944] font-bold text-sm">
                      <span className="material-symbols-outlined text-[22px]">verified</span>
                      <span>Ready for Verification</span>
                    </div>
                    <p className="text-[#6B6B63]">
                      This mess listing will be reviewed by the EaseHub Quality Team. Upon approval, it will appear live in the student app.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <h4 className="font-bold text-[#171A18]">Listing Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Provider Name:</span>
                        <strong className="text-[#171A18] font-extrabold">{formData.name}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">FSSAI License:</span>
                        <strong className="text-[#225944] font-mono font-extrabold">{formData.fssai}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Monthly Price:</span>
                        <strong className="text-[#225944] font-extrabold">₹{formData.monthlyPrice}/mo</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F8FAF6]">
                        <span className="text-[#6B6B63] block">Corridor:</span>
                        <strong className="text-[#171A18] font-extrabold">{formData.corridor}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Status Picker */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-2 shadow-xs text-xs">
                    <label className="block font-bold text-[#171A18]">Initial Listing Status</label>
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
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Student App View
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E9F1ED] text-[#225944] text-[10px] font-extrabold">
                    Preview
                  </span>
                </div>

                {/* Card Container */}
                <div className="rounded-2xl border border-[#E5E1D6] overflow-hidden bg-white shadow-sm space-y-0">
                  {/* Photo Carousel */}
                  <div className="relative h-44 bg-slate-100 group">
                    <img
                      src={formData.photos[activePhotoIdx] || defaultMealPhotos[0]}
                      alt="Provider main"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        {formData.tags[0] || 'Pure Veg'}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                        FSSAI: {formData.fssai.slice(-6) || 'VERIFIED'}
                      </span>
                    </div>

                    {/* Bottom Info on Image */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <h4 className="font-black text-sm drop-shadow-sm truncate">{formData.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-200">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="truncate">{formData.corridor} • {formData.distance}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-3 text-xs">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-[#F8FAF6] border border-[#E5E1D6] text-[10px] font-bold text-[#6B6B63]">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Price Bar */}
                    <div className="p-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#6B6B63] font-bold block leading-none">Monthly Plan</span>
                        <span className="text-base font-black text-[#225944]">₹{formData.monthlyPrice}</span>
                        <span className="text-[9px] text-[#6B6B63] block">/month (2 meals daily)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#6B6B63] font-bold block leading-none">Try Today</span>
                        <span className="text-sm font-black text-[#171A18]">₹{formData.dailyPrice}</span>
                        <span className="text-[9px] text-[#6B6B63] block">single thali</span>
                      </div>
                    </div>

                    {/* Today's Menu Tabs */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 border-b border-[#E5E1D6] pb-1">
                        {(['lunch', 'dinner', 'breakfast'] as const).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActivePreviewTab(tab)}
                            className={`px-2 py-0.5 text-[11px] font-bold rounded-md capitalize transition-colors ${
                              activePreviewTab === tab
                                ? 'bg-[#225944] text-white'
                                : 'text-[#6B6B63] hover:bg-slate-100'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      <div className="p-2 rounded-xl bg-[#F8FAF6] text-[11px] text-[#171A18] font-medium min-h-[44px]">
                        {activePreviewTab === 'lunch' && formData.lunchMenu}
                        {activePreviewTab === 'dinner' && formData.dinnerMenu}
                        {activePreviewTab === 'breakfast' && formData.breakfastMenu}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl bg-[#225944] text-white font-extrabold text-xs shadow-sm hover:bg-[#184232] transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Subscribe Tiffin Plan</span>
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
                <span>Publish Mess Provider</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddMealProviderModal;
