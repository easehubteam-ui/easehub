import React from 'react';

type BadgeType = 
  | 'customer' | 'vendor' | 'admin' | 'subadmin' | 'superadmin'
  | 'pending' | 'active' | 'approved' | 'completed' | 'delivered' | 'paid'
  | 'rejected' | 'failed' | 'blocked' | 'cancelled' | 'open' | 'in_progress' | 'resolved';

interface StatusBadgeProps {
  status: string | BadgeType;
  text?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const normalized = (status || '').toLowerCase().replace('-', '_');
  const label = text || status.replace('_', ' ').toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'superadmin':
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'subadmin':
      case 'sub_admin':
      case 'admin':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'vendor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'customer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';

      case 'active':
      case 'approved':
      case 'completed':
      case 'delivered':
      case 'paid':
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'pending':
      case 'in_progress':
      case 'open':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'rejected':
      case 'failed':
      case 'blocked':
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
