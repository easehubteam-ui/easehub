import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useServiceExperience } from '../../context/ServiceExperienceContext';
import { ServiceExperienceSettings } from '../../services/serviceExperienceApi';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';

type VisibilityKey =
  | 'old_meals_enabled'
  | 'new_meals_enabled'
  | 'old_laundry_enabled'
  | 'new_laundry_enabled'
  | 'extra_services_enabled';

const switches: { key: VisibilityKey; label: string; help: string; permission: 'meals' | 'laundry' | 'services' | 'settings' }[] = [
  { key: 'old_meals_enabled', label: 'Legacy Meals experience', help: 'Show the existing provider marketplace and old booking UI.', permission: 'meals' },
  { key: 'new_meals_enabled', label: 'New Meals plan catalog', help: 'Show the admin-managed meal plans and subscription booking flow.', permission: 'meals' },
  { key: 'old_laundry_enabled', label: 'Legacy Laundry experience', help: 'Show the existing laundry provider marketplace and old booking UI.', permission: 'laundry' },
  { key: 'new_laundry_enabled', label: 'New Laundry plan catalog', help: 'Show the admin-managed per-kg, monthly, and premium care plans.', permission: 'laundry' },
  { key: 'extra_services_enabled', label: 'Extra Services catalog', help: 'Allow service categories and custom service requests.', permission: 'services' },
];

export const ServiceVisibilityControls: React.FC = () => {
  const { settings, isLoading, error, update, refresh } = useServiceExperience();
  const { hasPermission } = useAuth();
  const [saving, setSaving] = useState<VisibilityKey | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<VisibilityKey | null>(null);

  const change = async (key: VisibilityKey, checked: boolean) => {
    setSaving(key);
    setSaveError(null);
    setSavedAt(null);
    try {
      await update({ [key]: checked } as Partial<Omit<ServiceExperienceSettings, 'id' | 'updated_by' | 'updated_at'>>);
      setSavedAt(key);
    } catch (err: any) {
      setSaveError(err?.message || 'Visibility setting was not saved.');
      await refresh();
    } finally {
      setSaving(null);
    }
  };

  return (
    <section aria-labelledby="service-visibility-heading" className="mt-6 rounded-3xl border border-[#E5E1D6] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#225944]/10 text-[#225944]">
          <span className="material-symbols-outlined">visibility</span>
        </div>
        <div>
          <h2 id="service-visibility-heading" className="text-xl font-extrabold text-[#171A18]">Service Visibility</h2>
          <p className="mt-1 text-xs leading-5 text-[#6B6B63]">These switches persist in InsForge. Turning an experience off hides it; it does not delete its catalog rows or historical bookings.</p>
        </div>
      </div>

      {isLoading && <p role="status" className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#225944]"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved service settings…</p>}
      {(error || saveError) && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{saveError || error}</div>}

      {!isLoading && settings && (
        <div className="mt-5 divide-y divide-[#E5E1D6]">
          {switches.map((item) => {
            const allowed = hasPermission(item.permission) || hasPermission('settings');
            const savingThis = saving === item.key;
            return (
              <label key={item.key} className="flex items-center justify-between gap-5 py-4">
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[#171A18]">{item.label}</span>
                  <span className="mt-1 block text-xs text-[#6B6B63]">{item.help}</span>
                  {savedAt === item.key && <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Saved to InsForge</span>}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  {savingThis && <Loader2 className="h-4 w-4 animate-spin text-[#225944]" />}
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    disabled={!allowed || savingThis}
                    onChange={(event) => void change(item.key, event.target.checked)}
                    aria-label={item.label}
                    className="h-5 w-5 accent-[#225944] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </span>
              </label>
            );
          })}
        </div>
      )}

      {settings?.new_meals_enabled && settings.old_meals_enabled && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">Both Meals versions are enabled. The new plan catalog is shown; turn it off to switch customers to the legacy experience.</p>}
      {settings?.new_laundry_enabled && settings.old_laundry_enabled && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">Both Laundry versions are enabled. The new plan catalog is shown; turn it off to switch customers to the legacy experience.</p>}
    </section>
  );
};

export default ServiceVisibilityControls;
