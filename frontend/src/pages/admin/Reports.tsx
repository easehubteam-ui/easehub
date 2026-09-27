import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/admin/StatCard';
import { adminApi } from '../../services/adminApi';

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminApi.getStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => console.error('Failed to load report stats:', err));
  }, []);

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
        <StatCard title="Registered Users" value={`${stats?.totalUsers || 0} Accounts`} icon="group" color="bg-[#225944]" />
        <StatCard title="Verified PGs & Hostels" value={`${stats?.totalPGs || 0} Properties`} icon="night_shelter" color="bg-amber-600" />
        <StatCard title="Total Platform Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} icon="currency_rupee" color="bg-emerald-600" />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-sm">
        <h3 className="text-base font-bold text-[#171A18] mb-2">Campus Infrastructure Summary</h3>
        <p className="text-xs text-[#6B6B63] mb-4">
          Real-time catalog metrics across Bhilai and Durg campus corridors.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#E5E1D6] flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[#171A18] block">Meal & Tiffin Services</span>
              <span className="text-[#6B6B63] text-[10px]">Verified Mess Providers</span>
            </div>
            <span className="font-extrabold text-[#225944]">{stats?.totalMealProviders || 0} Active</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#E5E1D6] flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[#171A18] block">Laundry & Garment Care</span>
              <span className="text-[#6B6B63] text-[10px]">Doorstep Laundry Hubs</span>
            </div>
            <span className="font-extrabold text-[#225944]">{stats?.totalLaundryProviders || 0} Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
