import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: string;
  color?: string;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  color = 'bg-[#225944]',
  subtext,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E1D6] hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#6B6B63] uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-extrabold text-[#171A18] tracking-tight">{value}</h3>
          
          {change && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                <span className="material-symbols-outlined text-[16px]">
                  {isPositive ? 'trending_up' : 'trending_down'}
                </span>
                {change}
              </span>
              <span className="text-[11px] text-[#6B6B63]">{subtext || 'vs last month'}</span>
            </div>
          )}
        </div>

        <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center shrink-0 shadow-md`}>
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
