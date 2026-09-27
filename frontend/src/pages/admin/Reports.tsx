import React from 'react';
import { StatCard } from '../../components/admin/StatCard';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#171A18]">Reports & Platform Analytics</h2>
          <p className="text-xs text-[#6B6B63]">Generate executive financial reports and campus usage growth metrics</p>
        </div>

        <button
          onClick={() => alert('Exporting platform financial and usage report PDF/CSV...')}
          className="px-4 py-2.5 rounded-xl bg-[#225944] text-white text-xs font-bold shadow-md hover:bg-[#184232] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">file_download</span>
          <span>Download Analytics Audit (PDF)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Quarterly Growth" value="+28.4%" icon="trending_up" color="bg-[#225944]" />
        <StatCard title="Active Mess Subscriptions" value="257 Active" icon="restaurant" color="bg-amber-600" />
        <StatCard title="Laundry Delivery Satisfaction" value="4.9 / 5.0" icon="star" color="bg-emerald-600" />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-sm">
        <h3 className="text-base font-bold text-[#171A18] mb-2">Campus Occupancy Summary</h3>
        <p className="text-xs text-[#6B6B63] mb-4">
          Detailed metrics for BIT Durg, Rungta Group Bhilai, CSIT, and IIT Bhilai partner hostels.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#E5E1D6] flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[#171A18] block">BIT Durg Student Zone</span>
              <span className="text-[#6B6B63] text-[10px]">1,850 Active Resident Accounts</span>
            </div>
            <span className="font-extrabold text-[#225944]">94% Occupancy</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-[#E5E1D6] flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[#171A18] block">Rungta Group Campus Zone</span>
              <span className="text-[#6B6B63] text-[10px]">1,420 Active Resident Accounts</span>
            </div>
            <span className="font-extrabold text-[#225944]">89% Occupancy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
