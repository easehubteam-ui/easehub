import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowUserRegistrations, setAllowUserRegistrations] = useState(true);
  const [vendorApprovalRequired, setVendorApprovalRequired] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 4000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E1D6] shadow-sm">
        <h2 className="text-xl font-extrabold text-[#171A18] mb-1">EaseHub Platform Configuration</h2>
        <p className="text-xs text-[#6B6B63] mb-6">Manage global system parameters, security switches, and maintenance status</p>

        {savedMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>Settings successfully updated and synchronized across all servers!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-[#171A18] border-b border-[#E5E1D6] pb-2">Operational Controls</h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-[#E5E1D6]">
              <div>
                <span className="font-bold text-[#171A18] block text-sm">System Maintenance Mode</span>
                <span className="text-[#6B6B63] text-[11px]">Temporarily display maintenance banner to public visitors</span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-[#225944] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-[#E5E1D6]">
              <div>
                <span className="font-bold text-[#171A18] block text-sm">Allow Student Registrations</span>
                <span className="text-[#6B6B63] text-[11px]">Enable new student signups across Bhilai campuses</span>
              </div>
              <input
                type="checkbox"
                checked={allowUserRegistrations}
                onChange={(e) => setAllowUserRegistrations(e.target.checked)}
                className="w-5 h-5 accent-[#225944] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-[#E5E1D6]">
              <div>
                <span className="font-bold text-[#171A18] block text-sm">Require Manual Vendor Verification</span>
                <span className="text-[#6B6B63] text-[11px]">Hold new PG & mess listings until admin approval</span>
              </div>
              <input
                type="checkbox"
                checked={vendorApprovalRequired}
                onChange={(e) => setVendorApprovalRequired(e.target.checked)}
                className="w-5 h-5 accent-[#225944] cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E1D6] flex justify-between items-center">
            <button
              type="button"
              onClick={() => alert('MongoDB backup snapshot initiated. Zip archive will download shortly.')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#171A18] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">database</span>
              <span>Trigger Database Backup</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold shadow-md transition-all"
            >
              Save Configuration Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
