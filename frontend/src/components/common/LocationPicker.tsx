import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Override Leaflet default icon URLs so markers render cleanly in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface SelectedLocation {
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  onLocationSelect: (location: SelectedLocation) => void;
  height?: string;
  readOnly?: boolean;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  address: initialAddress = '',
  landmark: initialLandmark = '',
  city: initialCity = '',
  state: initialState = '',
  pincode: initialPincode = '',
  onLocationSelect,
  height = '380px',
  readOnly = false,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const hasInitialCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  // Live Cursor Coordinates
  const [cursorPos, setCursorPos] = useState<{ lat: number; lng: number } | null>(null);

  // Selected Coordinates State
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(
    hasInitialCoords ? { lat: Number(latitude!.toFixed(6)), lng: Number(longitude!.toFixed(6)) } : null
  );

  // Address Details State
  const [addrDetails, setAddrDetails] = useState({
    address: initialAddress,
    landmark: initialLandmark,
    city: initialCity,
    state: initialState,
    pincode: initialPincode,
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Reverse Geocode Function using OpenStreetMap Nominatim
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    setGeocodingError(null);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      if (!res.ok) throw new Error('Geocoding API failed');
      const data = await res.json();

      if (data && data.address) {
        const a = data.address;
        const road = a.road || a.pedestrian || a.suburb || a.neighbourhood || '';
        const landmark = a.suburb || a.neighbourhood || a.amenity || a.building || '';
        const city = a.city || a.town || a.village || a.county || 'Bhilai';
        const state = a.state || 'Chhattisgarh';
        const pincode = a.postcode || '';
        const fullAddress = data.display_name ? data.display_name.slice(0, 150) : road || 'Detected Location';

        const updated = {
          address: fullAddress,
          landmark,
          city,
          state,
          pincode,
        };

        setAddrDetails(updated);
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          ...updated,
        });
      } else {
        setGeocodingError('Address could not be detected');
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: 'Address could not be detected',
          landmark: addrDetails.landmark,
          city: addrDetails.city,
          state: addrDetails.state,
          pincode: addrDetails.pincode,
        });
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
      setGeocodingError('Address could not be detected');
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: addrDetails.address || 'Address could not be detected',
        landmark: addrDetails.landmark,
        city: addrDetails.city,
        state: addrDetails.state,
        pincode: addrDetails.pincode,
      });
    } finally {
      setIsGeocoding(false);
    }
  }, [onLocationSelect, addrDetails]);

  // Handle Location Selection from Click or Drag
  const handleSelectCoords = useCallback((lat: number, lng: number) => {
    const precLat = parseFloat(lat.toFixed(6));
    const precLng = parseFloat(lng.toFixed(6));

    setSelectedPos({ lat: precLat, lng: precLng });

    // Update marker position
    if (mapRef.current) {
      if (markerRef.current) {
        markerRef.current.setLatLng([precLat, precLng]);
      } else {
        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="background-color: #225944; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 3px solid #EECA3A; font-size: 20px;">📍</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -32],
        });
        markerRef.current = L.marker([precLat, precLng], { icon: customIcon }).addTo(mapRef.current);
      }
      mapRef.current.panTo([precLat, precLng]);
    }

    // Trigger reverse geocoding
    reverseGeocode(precLat, precLng);
  }, [reverseGeocode]);

  // Forward Geocode Search Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const query = encodeURIComponent(`${searchQuery}, Bhilai, Chhattisgarh, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        const first = data[0];
        const newLat = parseFloat(first.lat);
        const newLng = parseFloat(first.lon);
        handleSelectCoords(newLat, newLng);
      } else {
        alert('Location not found. Try searching with landmark name, e.g. "BIT Durg" or "Smriti Nagar"');
      }
    } catch (err) {
      alert('Search failed. Please click directly on the map to set the location pin.');
    } finally {
      setIsSearching(false);
    }
  };

  // Sync props change (e.g. when editing record loads from DB)
  useEffect(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)) {
      const pLat = parseFloat(latitude.toFixed(6));
      const pLng = parseFloat(longitude.toFixed(6));
      setSelectedPos({ lat: pLat, lng: pLng });

      if (mapRef.current) {
        mapRef.current.setView([pLat, pLng], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([pLat, pLng]);
        } else {
          const customIcon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `<div style="background-color: #225944; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 3px solid #EECA3A; font-size: 20px;">📍</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -32],
          });
          markerRef.current = L.marker([pLat, pLng], { icon: customIcon }).addTo(mapRef.current);
        }
      }
    }
  }, [latitude, longitude]);

  // Mount Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Default initial viewport position (Bhilai area) for unselected maps
      const initialCenter: [number, number] = hasInitialCoords
        ? [latitude!, longitude!]
        : [21.1938, 81.3509];

      const initialZoom = hasInitialCoords ? 16 : 13;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Mousemove event for continuous live cursor coordinates
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setCursorPos({
          lat: parseFloat(e.latlng.lat.toFixed(6)),
          lng: parseFloat(e.latlng.lng.toFixed(6)),
        });
      });

      // Click event for selecting exact location pin
      if (!readOnly) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          handleSelectCoords(e.latlng.lat, e.latlng.lng);
        });
      }

      // Add initial marker if coordinates exist
      if (hasInitialCoords) {
        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="background-color: #225944; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 3px solid #EECA3A; font-size: 20px;">📍</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -32],
        });
        markerRef.current = L.marker([latitude!, longitude!], { icon: customIcon }).addTo(map);
      }

      mapRef.current = map;

      // Invalidate map size after mount / modal open
      const invalidateTimer1 = setTimeout(() => map.invalidateSize(), 100);
      const invalidateTimer2 = setTimeout(() => map.invalidateSize(), 400);

      return () => {
        clearTimeout(invalidateTimer1);
        clearTimeout(invalidateTimer2);
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    }
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar & Instructions */}
      {!readOnly && (
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B63] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search landmark or area (e.g. Junwani, BIT Durg, Smriti Nagar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E1D6] text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2.5 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#184232] transition-colors flex items-center gap-1 shrink-0"
          >
            {isSearching ? (
              <span>Searching...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                <span>Find Place</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Map Box & Realtime Coordinates Overlays */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E5E1D6] shadow-sm bg-slate-100">
        <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />

        {/* TOP-LEFT OVERLAY: Live Cursor Coordinates */}
        <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#E5E1D6] shadow-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[#225944] text-[18px]">ads_click</span>
          <div>
            <span className="text-[10px] font-extrabold text-[#6B6B63] uppercase tracking-wider block leading-none">
              Cursor Coordinates
            </span>
            <span className="text-xs font-mono font-bold text-[#171A18] block mt-0.5">
              {cursorPos ? `Lat: ${cursorPos.lat.toFixed(6)} | Lng: ${cursorPos.lng.toFixed(6)}` : 'Move cursor over map'}
            </span>
          </div>
        </div>

        {/* TOP-RIGHT OVERLAY: Selected Location Coordinates */}
        <div className="absolute top-3 right-3 z-20 bg-[#225944] text-white px-3.5 py-2 rounded-xl border border-emerald-900 shadow-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[#EECA3A] text-[18px]">location_on</span>
          <div>
            <span className="text-[10px] font-extrabold text-emerald-200 uppercase tracking-wider block leading-none">
              Selected Location
            </span>
            <span className="text-xs font-mono font-bold text-white block mt-0.5">
              {selectedPos ? `Lat: ${selectedPos.lat.toFixed(6)} | Lng: ${selectedPos.lng.toFixed(6)}` : 'Not Selected'}
            </span>
          </div>
        </div>

        {/* BOTTOM-LEFT INSTRUCTION OVERLAY */}
        {!readOnly && (
          <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-[#E5E1D6] text-[11px] font-bold text-[#225944] shadow-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">touch_app</span>
            <span>Click anywhere on the map to drop pin</span>
          </div>
        )}
      </div>

      {/* Selected Coordinates Status & Reverse Geocoding Dossier */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] space-y-3 text-xs shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E5E1D6] gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#225944] text-[20px]">pin_drop</span>
            <span className="font-extrabold text-[#171A18]">GPS Location Dossier</span>
          </div>

          <div className="flex items-center gap-3">
            {isGeocoding && (
              <span className="flex items-center gap-1.5 text-xs text-[#225944] font-bold">
                <span className="w-3 h-3 border-2 border-[#225944] border-t-transparent rounded-full animate-spin"></span>
                <span>Detecting Address...</span>
              </span>
            )}
            {selectedPos ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                {selectedPos.lat.toFixed(6)}, {selectedPos.lng.toFixed(6)}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                Location Not Selected
              </span>
            )}
          </div>
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-bold text-[#171A18] mb-1">Detected / Street Address</label>
            <input
              type="text"
              readOnly={readOnly}
              value={addrDetails.address}
              onChange={(e) => {
                const newAddr = e.target.value;
                setAddrDetails((prev) => ({ ...prev, address: newAddr }));
                if (selectedPos) {
                  onLocationSelect({ latitude: selectedPos.lat, longitude: selectedPos.lng, ...addrDetails, address: newAddr });
                }
              }}
              placeholder={geocodingError || 'Click on the map to set location address...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
            />
            {geocodingError && (
              <span className="text-[11px] text-amber-800 font-semibold mt-1 block">
                ⚠️ {geocodingError} (Latitude &amp; Longitude retained)
              </span>
            )}
          </div>

          <div>
            <label className="block font-bold text-[#171A18] mb-1">Landmark / Suburb</label>
            <input
              type="text"
              readOnly={readOnly}
              value={addrDetails.landmark}
              onChange={(e) => {
                const val = e.target.value;
                setAddrDetails((prev) => ({ ...prev, landmark: val }));
                if (selectedPos) {
                  onLocationSelect({ latitude: selectedPos.lat, longitude: selectedPos.lng, ...addrDetails, landmark: val });
                }
              }}
              placeholder="e.g. Near BIT Gate 2"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-[#171A18] mb-1">City</label>
            <input
              type="text"
              readOnly={readOnly}
              value={addrDetails.city}
              onChange={(e) => {
                const val = e.target.value;
                setAddrDetails((prev) => ({ ...prev, city: val }));
                if (selectedPos) {
                  onLocationSelect({ latitude: selectedPos.lat, longitude: selectedPos.lng, ...addrDetails, city: val });
                }
              }}
              placeholder="e.g. Bhilai"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-[#171A18] mb-1">State</label>
            <input
              type="text"
              readOnly={readOnly}
              value={addrDetails.state}
              onChange={(e) => {
                const val = e.target.value;
                setAddrDetails((prev) => ({ ...prev, state: val }));
                if (selectedPos) {
                  onLocationSelect({ latitude: selectedPos.lat, longitude: selectedPos.lng, ...addrDetails, state: val });
                }
              }}
              placeholder="e.g. Chhattisgarh"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-[#171A18] mb-1">Pincode</label>
            <input
              type="text"
              readOnly={readOnly}
              value={addrDetails.pincode}
              onChange={(e) => {
                const val = e.target.value;
                setAddrDetails((prev) => ({ ...prev, pincode: val }));
                if (selectedPos) {
                  onLocationSelect({ latitude: selectedPos.lat, longitude: selectedPos.lng, ...addrDetails, pincode: val });
                }
              }}
              placeholder="e.g. 490020"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-mono font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
