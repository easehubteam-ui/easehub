import React, { useState } from 'react';
import LocationMap from '../common/LocationMap';

export interface LocationFormValues {
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export interface AdminLocationPickerProps {
  initialValues?: LocationFormValues;
  title?: string;
  onSaveLocation: (values: LocationFormValues) => void;
  onCancel?: () => void;
}

export const AdminLocationPicker: React.FC<AdminLocationPickerProps> = ({
  initialValues = {
    address: 'Junwani Main Road, Near BIT Gate 2',
    landmark: 'BIT Durg Campus Area',
    city: 'Bhilai',
    state: 'Chhattisgarh',
    pincode: '490020',
    latitude: 21.24041,
    longitude: 81.297444,
  },
  title = 'Configure Property Location & Coordinates',
  onSaveLocation,
  onCancel,
}) => {
  const [address, setAddress] = useState(initialValues.address || '');
  const [landmark, setLandmark] = useState(initialValues.landmark || '');
  const [city, setCity] = useState(initialValues.city || 'Bhilai');
  const [state, setState] = useState(initialValues.state || 'Chhattisgarh');
  const [pincode, setPincode] = useState(initialValues.pincode || '490020');

  const [latitude, setLatitude] = useState<number | undefined>(
    initialValues.latitude !== undefined ? initialValues.latitude : 21.24041
  );
  const [longitude, setLongitude] = useState<number | undefined>(
    initialValues.longitude !== undefined ? initialValues.longitude : 81.297444
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleMapLocationChange = (newLat: number, newLng: number) => {
    setLatitude(Number(newLat.toFixed(6)));
    setLongitude(Number(newLng.toFixed(6)));
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const query = encodeURIComponent(`${searchQuery}, Bhilai, Chhattisgarh`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        setLatitude(Number(foundLat.toFixed(6)));
        setLongitude(Number(foundLng.toFixed(6)));
        setAddress(data[0].display_name.split(',')[0] || searchQuery);
      } else {
        alert('Location not found. Try searching with landmark name, e.g. "Junwani Bhilai" or "Smriti Nagar"');
      }
    } catch (err) {
      alert('Geocoding search failed. Please click on the map to set the exact pin location.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (latitude === undefined || longitude === undefined) {
      alert('Please select a valid location on the map to set coordinates.');
      return;
    }

    onSaveLocation({
      address,
      landmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xl space-y-5">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-500 text-[24px]">pin_drop</span>
          <div>
            <h3 className="font-extrabold text-base text-[#171A18]">{title}</h3>
            <p className="text-xs text-[#6B6B63]">Click map or drag the pin to capture exact GPS coordinates</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#225944]/10 text-[#225944] text-xs font-bold font-mono">
          {latitude && longitude ? `${latitude}, ${longitude}` : 'No Coordinates'}
        </span>
      </div>

      {/* Location Search Bar */}
      <form onSubmit={handleSearchLocation} className="flex gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6B6B63] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search address/landmark (e.g. BIT Gate 2 Junwani, Smriti Nagar, Civic Center)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] text-xs font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
        >
          {isSearching ? (
            <span>Searching...</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
              <span>Find Location</span>
            </>
          )}
        </button>
      </form>

      {/* Interactive Map Picker Component */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#6B6B63] px-1">
          <span>Click anywhere on map or drag pin to adjust coordinates</span>
          <span className="text-[#225944] font-extrabold">LIVE PIN POSITION</span>
        </div>
        <LocationMap
          latitude={latitude}
          longitude={longitude}
          title={address || 'Target Location Pin'}
          address={landmark ? `${landmark}, ${city}` : address}
          zoom={15}
          interactive={true}
          onLocationChange={handleMapLocationChange}
          className="w-full h-80 rounded-2xl border-2 border-[#225944]/30 shadow-inner"
        />
      </div>

      {/* Coordinates Display Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] text-xs">
        <div>
          <label className="block font-bold text-[#171A18] mb-1">Latitude (Decimal Degrees)</label>
          <input
            type="number"
            step="0.000001"
            value={latitude !== undefined ? latitude : ''}
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
            placeholder="e.g. 21.240410"
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D6] font-mono font-bold text-[#225944]"
          />
        </div>
        <div>
          <label className="block font-bold text-[#171A18] mb-1">Longitude (Decimal Degrees)</label>
          <input
            type="number"
            step="0.000001"
            value={longitude !== undefined ? longitude : ''}
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
            placeholder="e.g. 81.297444"
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D6] font-mono font-bold text-[#225944]"
          />
        </div>
      </div>

      {/* Detailed Address Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="sm:col-span-2">
          <label className="block font-bold text-[#171A18] mb-1">Full Street Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Plot 14, Junwani Main Road"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] font-bold text-[#171A18]"
          />
        </div>

        <div>
          <label className="block font-bold text-[#171A18] mb-1">Landmark / Proximity</label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="Near BIT Gate 2"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] font-bold text-[#171A18]"
          />
        </div>

        <div>
          <label className="block font-bold text-[#171A18] mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] font-bold text-[#171A18]"
          />
        </div>

        <div>
          <label className="block font-bold text-[#171A18] mb-1">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] font-bold text-[#171A18]"
          />
        </div>

        <div>
          <label className="block font-bold text-[#171A18] mb-1">Pincode</label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] font-bold text-[#171A18]"
          />
        </div>
      </div>

      {/* Bottom Save & Cancel Buttons */}
      <div className="pt-3 border-t border-[#E5E1D6] flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-[#F7F5EF] hover:bg-[#E5E1D6] text-[#171A18] font-bold text-xs transition"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Save Exact Location</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLocationPicker;
