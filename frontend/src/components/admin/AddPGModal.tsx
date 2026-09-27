import React, { useState, useRef } from 'react';
import LocationMap from '../common/LocationMap';
import { storageApi } from '../../services/storageApi';

export interface PGFormData {
  name: string;
  propertyType: 'PG' | 'Hostel';
  gender: 'BOYS' | 'GIRLS' | 'CO-ED';
  landlordName: string;
  landlordPhone: string;
  email: string;
  description: string;
  photos: string[];
  // Location
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  corridor: string;
  // Details
  totalBeds: number;
  vacantBeds: number;
  monthlyRent: number;
  deposit: number;
  roomMatrix: string;
  amenities: string[];
  curfew: string;
  rules: string;
  // Status
  status: 'active' | 'pending' | 'draft';
}

export interface AddPGModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPG: (data: PGFormData) => void;
}

const defaultPhotos: string[] = [];

export const AddPGModal: React.FC<AddPGModalProps> = ({ isOpen, onClose, onSubmitPG }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<PGFormData>({
    name: 'Royal Deluxe Student Haven',
    propertyType: 'PG',
    gender: 'BOYS',
    landlordName: 'Rajesh Kumar',
    landlordPhone: '98765 43210',
    email: 'owner@example.com',
    description: 'A comfortable and well-maintained PG with modern amenities, located near BIT Durg. Perfect for students with a peaceful environment and easy access to nearby facilities.',
    photos: defaultPhotos,
    address: 'Plot 18, Junwani Main Road, Near BIT Gate 2',
    landmark: 'Near BIT Durg Campus',
    city: 'Bhilai',
    state: 'Chhattisgarh',
    pincode: '490020',
    latitude: 21.198409,
    longitude: 81.332444,
    corridor: 'Junwani',
    totalBeds: 30,
    vacantBeds: 8,
    monthlyRent: 6000,
    deposit: 6000,
    roomMatrix: 'Single (10) • Double (12) • Triple (8)',
    amenities: ['wifi', 'ac_unit', 'restaurant', 'local_laundry_service', 'videocam', 'bolt'],
    curfew: '10:30 PM Curfew',
    rules: 'No smoking. Visitors permitted till 8:00 PM.',
    status: 'pending',
  });

  // Preview Image active index
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Map search state
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  if (!isOpen) return null;

  // Handle Photo Delete
  const handleRemovePhoto = (indexToRemove: number) => {
    const updated = formData.photos.filter((_, idx) => idx !== indexToRemove);
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
        const res = await storageApi.uploadPropertyImage(file, file.name);
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
      alert(err.message || 'Failed to upload image to InsForge Storage.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddSamplePhoto = () => {
    fileInputRef.current?.click();
  };

  // Handle Map Pin Drag / Click
  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    }));
  };

  // Handle Map Address Search (Nominatim Geocoding)
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
        const newLat = parseFloat(first.lat);
        const newLng = parseFloat(first.lon);
        setFormData((prev) => ({
          ...prev,
          latitude: Number(newLat.toFixed(6)),
          longitude: Number(newLng.toFixed(6)),
          address: first.display_name.slice(0, 100),
        }));
      } else {
        alert('Location not found. Try searching with city name (e.g. Junwani Bhilai)');
      }
    } catch (err) {
      alert('Could not geocode location. Please adjust map pin manually.');
    } finally {
      setIsSearchingMap(false);
    }
  };

  // Handle Checkbox Toggles for Amenities
  const toggleAmenity = (key: string) => {
    const exists = formData.amenities.includes(key);
    const updated = exists
      ? formData.amenities.filter((a) => a !== key)
      : [...formData.amenities, key];
    setFormData({ ...formData, amenities: updated });
  };

  // Final Publish Handler
  const handleFinalSubmit = (statusToPublish: 'active' | 'pending' | 'draft') => {
    if (!formData.name.trim()) {
      alert('Please enter a valid Property Name.');
      setCurrentStep(1);
      return;
    }
    onSubmitPG({ ...formData, status: statusToPublish });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-6xl w-full shadow-2xl border border-[#E5E1D6] flex flex-col overflow-hidden max-h-[92vh] my-auto">
        
        {/* MODAL HEADER / TOP HERO BANNER */}
        <div className="bg-[#F8FAF6] p-4 sm:p-6 border-b border-[#E5E1D6] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9F1ED] border border-[#225944]/20 flex items-center justify-center text-[#225944] shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[28px]">domain</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight">
                Add New PG / Hostel Property
              </h2>
              <p className="text-xs text-[#6B6B63] font-medium mt-0.5">
                Create a verified property listing for EaseHub.
              </p>
            </div>
          </div>

          {/* Yellow Tip Alert Card */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FFF9E6] border border-[#F3E8B8] text-xs">
              <span className="material-symbols-outlined text-[#EECA3A] text-[20px] shrink-0">lightbulb</span>
              <div className="text-left">
                <span className="font-bold text-[#171A18] block leading-none">Add complete and accurate information</span>
                <span className="text-[11px] text-[#6B6B63] mt-0.5 block">This helps students find the right stay and builds trust.</span>
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

        {/* WORKSPACE CONTENT GRID: LEFT STEPPER (3 cols) | MAIN FORM (5 cols) | RIGHT PREVIEW (4 cols) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAF6]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: VERTICAL STEP NAVIGATION (3 cols) */}
            <div className="lg:col-span-3 space-y-2 bg-white p-3 rounded-2xl border border-[#E5E1D6] shadow-xs">
              {[
                { id: 1, title: 'Property Basics', desc: 'Basic information' },
                { id: 2, title: 'Exact Location', desc: 'Set on map' },
                { id: 3, title: 'Property Details', desc: 'Rooms, pricing, amenities' },
                { id: 4, title: 'Verification & Publish', desc: 'Review and submit' },
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

            {/* CENTER COLUMN: MAIN FORM CONTENT (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* STEP 1: PROPERTY BASICS */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">1. Property Basics</h3>
                    <p className="text-xs text-[#6B6B63]">Add the basic details and photos of the PG / Hostel.</p>
                  </div>

                  {/* Property Photos Upload Container */}
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
                      <label className="text-xs font-bold text-[#171A18]">Property Photos</label>
                      <span className="text-[11px] text-[#6B6B63] font-semibold">{formData.photos.length}/10 photos</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Drag & Drop Upload Zone */}
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
                          {isUploading ? 'Uploading to InsForge...' : 'Click to upload photos'}
                        </span>
                        <span className="text-[10px] text-[#6B6B63] mt-0.5">Select real image files</span>
                        <span className="text-[9px] text-[#6B6B63] mt-1 font-mono">JPG, PNG, WEBP</span>
                      </div>

                      {/* Image Thumbnails Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {formData.photos.map((url, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#E5E1D6] h-16 bg-slate-100">
                            <img src={url} alt={`Property preview ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(idx);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xs"
                              title="Remove image"
                            >
                              <span className="material-symbols-outlined text-[12px]">close</span>
                            </button>
                          </div>
                        ))}
                        {formData.photos.length < 10 && (
                          <button
                            type="button"
                            onClick={handleAddSamplePhoto}
                            className="h-16 rounded-xl border border-dashed border-[#E5E1D6] hover:border-[#225944] bg-[#F8FAF6] flex flex-col items-center justify-center text-[#6B6B63] hover:text-[#225944] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span className="text-[9px] font-bold">Add More</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3.5 shadow-xs text-xs">
                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Property Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Royal Deluxe Student Haven"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#225944]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1.5">Property Type *</label>
                        <div className="flex items-center gap-4">
                          {(['PG', 'Hostel'] as const).map((t) => (
                            <label key={t} className="inline-flex items-center gap-2 cursor-pointer font-semibold text-[#171A18]">
                              <input
                                type="radio"
                                name="propertyType"
                                checked={formData.propertyType === t}
                                onChange={() => setFormData({ ...formData, propertyType: t })}
                                className="w-4 h-4 text-[#225944] focus:ring-[#225944]"
                              />
                              <span>{t}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1.5">Gender Accommodation *</label>
                        <div className="flex items-center gap-3 flex-wrap">
                          {(['BOYS', 'GIRLS', 'CO-ED'] as const).map((g) => (
                            <label key={g} className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-[#171A18]">
                              <input
                                type="radio"
                                name="gender"
                                checked={formData.gender === g}
                                onChange={() => setFormData({ ...formData, gender: g })}
                                className="w-4 h-4 text-[#225944] focus:ring-[#225944]"
                              />
                              <span className="capitalize">{g === 'CO-ED' ? 'Co-living' : g.toLowerCase()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Landlord / Owner Name *</label>
                        <input
                          type="text"
                          value={formData.landlordName}
                          onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                          placeholder="e.g. Rajesh Kumar"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#225944]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Mobile Number *</label>
                        <div className="flex items-center gap-1.5">
                          <div className="px-2.5 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#171A18] flex items-center gap-1 shrink-0">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <input
                            type="tel"
                            value={formData.landlordPhone}
                            onChange={(e) => setFormData({ ...formData, landlordPhone: e.target.value })}
                            placeholder="98765 43210"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#225944]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. owner@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#225944]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-[#171A18]">Short Description *</label>
                        <span className="text-[10px] text-[#6B6B63]">{formData.description.length}/500</span>
                      </div>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 500) })}
                        placeholder="Describe the property, environment, nearby facilities, etc..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#225944] resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: EXACT LOCATION */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">2. Exact Location</h3>
                    <p className="text-xs text-[#6B6B63]">Pin the exact location of the property on the interactive map.</p>
                  </div>

                  {/* Address Search Form */}
                  <form onSubmit={handleSearchLocation} className="bg-white p-3 rounded-2xl border border-[#E5E1D6] flex items-center gap-2 shadow-xs">
                    <span className="material-symbols-outlined text-[#225944] text-[20px] ml-1">search</span>
                    <input
                      type="text"
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      placeholder="Search address, area or landmark (e.g. Junwani Bhilai)"
                      className="w-full bg-transparent border-none text-xs font-medium text-[#171A18] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSearchingMap}
                      className="px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#184232] transition-colors shrink-0"
                    >
                      {isSearchingMap ? 'Searching...' : 'Find'}
                    </button>
                  </form>

                  {/* Interactive Leaflet Map */}
                  <div className="bg-white p-3 rounded-2xl border border-[#E5E1D6] shadow-xs space-y-2">
                    <LocationMap
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      title={formData.name}
                      address={formData.address}
                      zoom={16}
                      interactive={true}
                      onLocationChange={handleLocationChange}
                      className="w-full h-64 rounded-xl overflow-hidden border border-[#E5E1D6]"
                    />

                    <div className="flex items-center justify-between text-[11px] pt-1 px-1">
                      <span className="font-bold text-[#225944] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span>Exact location selected ({formData.latitude}, {formData.longitude})</span>
                      </span>
                      <span className="text-[#6B6B63]">Drag marker or click map to adjust</span>
                    </div>
                  </div>

                  {/* Manual Coordinates & Address Inputs */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Full Street Address *</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Plot number, building name, street..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Landmark</label>
                        <input
                          type="text"
                          value={formData.landmark}
                          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                          placeholder="e.g. Near BIT Gate 2"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Campus Corridor</label>
                        <select
                          value={formData.corridor}
                          onChange={(e) => setFormData({ ...formData, corridor: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold cursor-pointer"
                        >
                          <option value="Junwani">Junwani (BIT Durg)</option>
                          <option value="Smriti Nagar">Smriti Nagar</option>
                          <option value="Nehru Nagar">Nehru Nagar</option>
                          <option value="Civic Center">Civic Center</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">State</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Pincode</label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PROPERTY DETAILS */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">3. Property Details</h3>
                    <p className="text-xs text-[#6B6B63]">Specify capacity, tariffs, room categories, and amenities.</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3.5 shadow-xs text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Total Bed Capacity *</label>
                        <input
                          type="number"
                          value={formData.totalBeds}
                          onChange={(e) => setFormData({ ...formData, totalBeds: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Available Vacant Beds</label>
                        <input
                          type="number"
                          value={formData.vacantBeds}
                          onChange={(e) => setFormData({ ...formData, vacantBeds: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Monthly Rent (₹) *</label>
                        <input
                          type="number"
                          value={formData.monthlyRent}
                          onChange={(e) => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#225944]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#171A18] mb-1">Security Deposit (₹)</label>
                        <input
                          type="number"
                          value={formData.deposit}
                          onChange={(e) => setFormData({ ...formData, deposit: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Room Categories / Tariff Matrix</label>
                      <input
                        type="text"
                        value={formData.roomMatrix}
                        onChange={(e) => setFormData({ ...formData, roomMatrix: e.target.value })}
                        placeholder="e.g. Single (10) • Double (12) • Triple (8)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
                      />
                    </div>
                  </div>

                  {/* Amenities Checklist */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <label className="block font-bold text-[#171A18]">Included Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { key: 'wifi', label: 'Wi-Fi Fiber', icon: 'wifi' },
                        { key: 'ac_unit', label: 'Air Conditioner', icon: 'ac_unit' },
                        { key: 'restaurant', label: 'Food Included', icon: 'restaurant' },
                        { key: 'local_laundry_service', label: 'Laundry Care', icon: 'local_laundry_service' },
                        { key: 'videocam', label: '24/7 CCTV', icon: 'videocam' },
                        { key: 'bolt', label: 'Power Backup', icon: 'bolt' },
                        { key: 'fingerprint', label: 'Biometric Access', icon: 'fingerprint' },
                        { key: 'local_parking', label: 'Vehicle Parking', icon: 'local_parking' },
                        { key: 'cleaning_services', label: 'Housekeeping', icon: 'cleaning_services' },
                      ].map((item) => {
                        const isChecked = formData.amenities.includes(item.key);
                        return (
                          <button
                            type="button"
                            key={item.key}
                            onClick={() => toggleAmenity(item.key)}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
                              isChecked
                                ? 'bg-[#225944]/10 border-[#225944] text-[#225944] font-bold'
                                : 'bg-[#F8FAF6] border-[#E5E1D6] text-[#6B6B63] hover:text-[#171A18]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                            <span className="text-[11px] leading-none">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Curfew & Rules */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Night Curfew Timing</label>
                      <input
                        type="text"
                        value={formData.curfew}
                        onChange={(e) => setFormData({ ...formData, curfew: e.target.value })}
                        placeholder="e.g. 10:30 PM Curfew"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#171A18] mb-1">Guest Policy & House Rules</label>
                      <textarea
                        rows={2}
                        value={formData.rules}
                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                        placeholder="House rules, guest policy, gate timings..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: VERIFICATION & PUBLISH */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E1D6]">
                    <h3 className="text-lg font-extrabold text-[#171A18]">4. Verification & Publish</h3>
                    <p className="text-xs text-[#6B6B63]">Review property details and submit for platform verification.</p>
                  </div>

                  {/* Summary Overview Card */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 shadow-xs text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D6]">
                      <div>
                        <span className="text-[10px] font-bold text-[#225944] uppercase">SUMMARY DOSSIER</span>
                        <h4 className="font-extrabold text-sm text-[#171A18]">{formData.name}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#EECA3A] text-[#171A18] font-bold text-[10px] uppercase">
                        {formData.propertyType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#6B6B63] block">Owner</span>
                        <span className="font-bold text-[#171A18]">{formData.landlordName} ({formData.landlordPhone})</span>
                      </div>
                      <div>
                        <span className="text-[#6B6B63] block">Location</span>
                        <span className="font-bold text-[#171A18]">{formData.corridor}, Bhilai</span>
                      </div>
                      <div>
                        <span className="text-[#6B6B63] block">Total Beds</span>
                        <span className="font-bold text-[#171A18]">{formData.totalBeds} Beds ({formData.vacantBeds} Vacant)</span>
                      </div>
                      <div>
                        <span className="text-[#6B6B63] block">Monthly Rent</span>
                        <span className="font-bold text-[#225944]">₹{formData.monthlyRent.toLocaleString()}/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Checklist */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-2.5 shadow-xs text-xs">
                    <span className="font-bold text-[#171A18] block">Compliance & Verification Checklist</span>
                    
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between font-medium">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                        <span>Landlord Aadhaar & PAN Card</span>
                      </div>
                      <span className="font-bold text-[10px] text-emerald-700 uppercase">Verified</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between font-medium">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-emerald-600">location_on</span>
                        <span>GPS Coordinates & Map Pin</span>
                      </div>
                      <span className="font-bold text-[10px] text-emerald-700 uppercase">Confirmed</span>
                    </div>
                  </div>

                  {/* Publishing Status Selector */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-2 shadow-xs text-xs">
                    <span className="font-bold text-[#171A18] block">Set Initial Status</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'draft' as any })}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                          formData.status === 'draft'
                            ? 'bg-slate-200 border-slate-400 text-slate-800'
                            : 'bg-[#F8FAF6] border-[#E5E1D6] text-[#6B6B63]'
                        }`}
                      >
                        Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'pending' })}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                          formData.status === 'pending'
                            ? 'bg-amber-100 border-amber-400 text-amber-900'
                            : 'bg-[#F8FAF6] border-[#E5E1D6] text-[#6B6B63]'
                        }`}
                      >
                        In Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'active' })}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                          formData.status === 'active'
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                            : 'bg-[#F8FAF6] border-[#E5E1D6] text-[#6B6B63]'
                        }`}
                      >
                        Published
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW CARD (4 cols) */}
            <div className="lg:col-span-4 sticky top-0">
              <div className="bg-white p-4 rounded-3xl border border-[#E5E1D6] shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#225944] text-[18px]">lock</span>
                    <h4 className="text-xs font-black text-[#171A18]">Live Preview</h4>
                  </div>
                  <span className="text-[10px] text-[#6B6B63] font-medium">Student View</span>
                </div>
                <p className="text-[11px] text-[#6B6B63]">This is how your property will appear to students</p>

                {/* Property Card Mock */}
                <div className="rounded-2xl border border-[#E5E1D6] overflow-hidden bg-white shadow-xs">
                  {/* Photo Carousel Preview */}
                  <div className="relative h-44 w-full bg-slate-100">
                    <img
                      src={formData.photos[activePhotoIdx] || defaultPhotos[0]}
                      alt="Property live preview"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Counter Badge */}
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {activePhotoIdx + 1}/{formData.photos.length || 1}
                    </span>

                    {/* Carousel Left/Right Buttons */}
                    {formData.photos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : formData.photos.length - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-[#171A18] flex items-center justify-center shadow-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePhotoIdx((prev) => (prev < formData.photos.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-[#171A18] flex items-center justify-center shadow-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-[#171A18] leading-tight truncate">
                        {formData.name || 'Property Name'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-[#E9F1ED] text-[#225944] text-[10px] font-extrabold uppercase shrink-0">
                        {formData.propertyType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#6B6B63] font-medium">
                      <span className="material-symbols-outlined text-[14px] text-rose-500">location_on</span>
                      <span className="truncate">{formData.address || 'Address'}, {formData.city}</span>
                    </div>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-[#F8FAF6] border border-[#E5E1D6] text-[10px] font-bold text-[#171A18] capitalize">
                        {formData.gender === 'CO-ED' ? 'Co-living' : formData.gender.toLowerCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#F8FAF6] border border-[#E5E1D6] text-[10px] font-bold text-[#171A18]">
                        {formData.totalBeds} Beds
                      </span>
                      {formData.amenities.includes('restaurant') && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF9E6] border border-[#F3E8B8] text-[10px] font-bold text-[#171A18]">
                          With Food
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#6B6B63] line-clamp-2 pt-1 leading-relaxed">
                      {formData.description || 'Property short description...'}
                    </p>

                    {/* Price and Beds Stats Bar */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E1D6] text-xs">
                      <div className="p-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
                        <span className="text-[9px] text-[#6B6B63] block font-semibold uppercase">Monthly Rent</span>
                        <span className="font-extrabold text-[#225944]">₹{formData.monthlyRent.toLocaleString()}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
                        <span className="text-[9px] text-[#6B6B63] block font-semibold uppercase">Total Beds</span>
                        <span className="font-extrabold text-[#171A18]">{formData.totalBeds}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* STICKY BOTTOM ACTION BAR */}
        <div className="bg-white p-4 border-t border-[#E5E1D6] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-[#F3F4F0] hover:bg-[#EDEEEB] text-xs font-bold text-[#171A18] transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleFinalSubmit('draft')}
              className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5E1D6] hover:bg-[#F8FAF6] text-xs font-bold text-[#171A18] flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">bookmark</span>
              <span>Save as Draft</span>
            </button>

            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="px-4 py-2.5 rounded-2xl bg-[#F3F4F0] hover:bg-[#EDEEEB] text-xs font-bold text-[#171A18] transition-colors"
              >
                Back
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                className="px-6 py-2.5 rounded-2xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <span>
                  {currentStep === 1
                    ? 'Continue to Location'
                    : currentStep === 2
                    ? 'Continue to Details'
                    : 'Continue to Verification'}
                </span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFinalSubmit('pending')}
                  className="px-5 py-2.5 rounded-2xl bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] text-xs font-extrabold transition-all shadow-xs"
                >
                  Submit for Verification
                </button>
                <button
                  type="button"
                  onClick={() => handleFinalSubmit('active')}
                  className="px-6 py-2.5 rounded-2xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold shadow-md transition-all"
                >
                  Publish Property
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddPGModal;
