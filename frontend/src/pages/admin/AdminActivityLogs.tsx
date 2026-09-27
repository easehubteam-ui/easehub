import React from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';

interface LogItem {
  id: string;
  user: string;
  role: string;
  action: string;
  ip: string;
  timestamp: string;
}

export const AdminActivityLogs: React.FC = () => {
  const logs: LogItem[] = [
    {
      id: 'LOG-101',
      user: 'admin@easehub.local',
      role: 'superadmin',
      action: 'ADMIN_LOGIN - Successful authentication from web console',
      ip: '127.0.0.1',
      timestamp: '2026-09-24 10:14:02 AM',
    },
    {
      id: 'LOG-102',
      user: 'admin@easehub.local',
      role: 'superadmin',
      action: 'VENDOR_APPROVE - Approved Campus Express Laundry Hub (VND-103)',
      ip: '127.0.0.1',
      timestamp: '2026-09-24 09:30:15 AM',
    },
    {
      id: 'LOG-103',
      user: 'priya.s@bitdurg.ac.in',
      role: 'customer',
      action: 'BOOKING_CREATE - Created PG stay booking BK-9801',
      ip: '106.222.14.88',
      timestamp: '2026-09-24 09:30:00 AM',
    },
    {
      id: 'LOG-104',
      user: 'rahul.v@rungta.ac.in',
      role: 'customer',
      action: 'PAYMENT_SUCCESS - Completed ₹3,200 via PhonePe for mess plan',
      ip: '106.222.18.12',
      timestamp: '2026-09-24 08:15:10 AM',
    },
  ];

  const columns: Column<LogItem>[] = [
    {
      key: 'id',
      header: 'Log ID',
      render: (item) => <span className="font-mono font-bold text-[#225944]">{item.id}</span>,
    },
    { key: 'user', header: 'Actor User' },
    {
      key: 'role',
      header: 'Role',
      render: (item) => <span className="font-mono text-[10px] uppercase font-bold text-slate-600">{item.role}</span>,
    },
    { key: 'action', header: 'System Action Audit Description' },
    {
      key: 'ip',
      header: 'IP Address',
      render: (item) => <span className="font-mono text-xs">{item.ip}</span>,
    },
    { key: 'timestamp', header: 'Timestamp' },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="System Audit & Security Activity Logs"
        subtitle="Immutable security trail recording user log-ins, administrative actions, and payment attempts"
        columns={columns}
        data={logs}
        searchPlaceholder="Search actor email or system action..."
      />
    </div>
  );
};

export default AdminActivityLogs;
