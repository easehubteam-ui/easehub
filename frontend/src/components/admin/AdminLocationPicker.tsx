import React, { useState } from 'react';
import LocationPicker from '../common/LocationPicker';

export interface LocationFormValues {
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AdminLocationPickerProps {
  initialValues?: LocationFormValues;
  title?: string;
  onSaveLocation: (values: LocationFormValues) => void;
  onCancel?: () => void;
}

export const AdminLocationPicker: React.FC<AdminLocationPickerProps> = ({
  initialValues,
  title = 'Configure Property Location & GPS Coordinates',
  onSaveLocation,
  onCancel,
}) => {
  const [formValues, setFormValues] = useState<LocationFormValues>({
    address: initialValues?.address || '',
    landmark: initialValues?.landmark || '',
    city: initialValues?.city || 'Bhilai',
    state: initialValues?.state || 'Chhattisgarh',
    pincode: initialValues?.pincode || '',
    latitude: initialValues?.latitude ?? null,
    longitude: initialValues?.longitude ?? null,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.latitude || !formValues.longitude) {
      alert('Please select a valid location on the map to set GPS coordinates.');
      return;
    }

    onSaveLocation(formValues);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xl space-y-5">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#225944] text-[24px]">pin_drop</span>
          <div>
            <h3 className="font-extrabold text-base text-[#171A18]">{title}</h3>
            <p className="text-xs text-[#6B6B63]">Click map or move cursor to capture exact GPS coordinates</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#225944]/10 text-[#225944] text-xs font-bold font-mono">
          {formValues.latitude && formValues.longitude
            ? `${formValues.latitude.toFixed(6)}, ${formValues.longitude.toFixed(6)}`
            : 'No Coordinates'}
        </span>
      </div>

      <LocationPicker
        latitude={formValues.latitude}
        longitude={formValues.longitude}
        address={formValues.address}
        landmark={formValues.landmark}
        city={formValues.city}
        state={formValues.state}
        pincode={formValues.pincode}
        onLocationSelect={(loc) => {
          setFormValues((prev) => ({
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
          <span>Save Location Coordinates</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLocationPicker;
