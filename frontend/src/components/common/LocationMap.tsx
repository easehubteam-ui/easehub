import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Override Leaflet default icon URLs so markers render cleanly in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface LocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
  address?: string;
  zoom?: number;
  className?: string;
  interactive?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  title,
  address,
  zoom = 15,
  className = 'w-full h-72 rounded-2xl overflow-hidden border border-[#E5E1D6]',
  interactive = false,
  onLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  useEffect(() => {
    if (!hasCoordinates || !mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude!, longitude!],
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #225944; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid #EECA3A; font-size: 18px;">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([latitude!, longitude!], {
        draggable: interactive && !!onLocationChange,
        icon: customIcon,
      }).addTo(map);

      if (title || address) {
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 2px;">
            <strong style="color: #225944; font-size: 13px;">${title || 'Selected Location'}</strong>
            ${address ? `<p style="font-size: 11px; color: #6B6B63; margin: 4px 0 0 0;">${address}</p>` : ''}
            <div style="font-size: 10px; color: #171A18; font-weight: bold; margin-top: 4px; font-family: monospace;">
              Lat: ${latitude!.toFixed(6)}, Lng: ${longitude!.toFixed(6)}
            </div>
          </div>
        `);
      }

      if (interactive && onLocationChange) {
        marker.on('dragend', (e: any) => {
          const latLng = e.target.getLatLng();
          onLocationChange(latLng.lat, latLng.lng);
        });

        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          onLocationChange(lat, lng);
        });
      }

      mapRef.current = map;
      markerRef.current = marker;

      const timer = setTimeout(() => map.invalidateSize(), 200);
      return () => {
        clearTimeout(timer);
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    } else {
      mapRef.current.setView([latitude!, longitude!], zoom, { animate: true });
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude!, longitude!]);
      }
    }
  }, [latitude, longitude, zoom, interactive, onLocationChange, hasCoordinates]);

  if (!hasCoordinates) {
    return (
      <div className={`${className} bg-[#F3F4F0] flex flex-col items-center justify-center p-6 text-center border border-[#E5E1D6]`}>
        <div className="w-12 h-12 rounded-full bg-[#E5E1D6] flex items-center justify-center text-[#6B6B63] mb-2">
          <span className="material-symbols-outlined text-[24px]">location_off</span>
        </div>
        <h4 className="text-xs font-extrabold text-[#171A18]">Location not available</h4>
        <p className="text-[11px] text-[#6B6B63] mt-1 max-w-xs">
          Coordinates not set for this listing. Admin must set the exact location pin.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Header Overlay */}
      <div className="absolute top-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E5E1D6] shadow-sm flex items-center gap-2 max-w-[85%]">
        <span className="material-symbols-outlined text-rose-500 text-[18px]">location_on</span>
        <div className="truncate">
          <p className="text-[11px] font-extrabold text-[#225944] leading-tight truncate">{title || 'Exact Coordinates'}</p>
          <p className="text-[10px] text-[#171A18] font-mono truncate">
            {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
          </p>
        </div>
      </div>

      {/* Direct Google Maps Link */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2.5 right-2.5 z-20 bg-[#225944] text-white hover:bg-[#184232] text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 transition"
      >
        <span>Open Google Maps</span>
        <span className="material-symbols-outlined text-[12px]">open_in_new</span>
      </a>
    </div>
  );
};

export default LocationMap;
