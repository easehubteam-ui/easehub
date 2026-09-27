import React, { useState } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';

interface TicketItem {
  id: string;
  studentName: string;
  category: 'Mess Food Quality' | 'PG Maintenance' | 'Laundry Delay' | 'Payment Issue';
  priority: 'High' | 'Medium' | 'Low';
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  loggedAt: string;
}

export const Complaints: React.FC = () => {
  const [tickets, setTickets] = useState<TicketItem[]>([
    {
      id: 'TKT-1001',
      studentName: 'Amit Kumar',
      category: 'PG Maintenance',
      priority: 'High',
      subject: 'Water heater in 2nd floor bathroom not heating properly',
      status: 'open',
      loggedAt: '2026-09-24 08:30 AM',
    },
    {
      id: 'TKT-1002',
      studentName: 'Vikas Singh',
      category: 'Mess Food Quality',
      priority: 'Medium',
      subject: 'Sunday special dinner quantity was short for 3 students',
      status: 'in_progress',
      loggedAt: '2026-09-23 07:15 PM',
    },
    {
      id: 'TKT-1003',
      studentName: 'Priya Sharma',
      category: 'Payment Issue',
      priority: 'Low',
      subject: 'Receipt download button threw error on Chrome browser',
      status: 'resolved',
      loggedAt: '2026-09-21 02:40 PM',
    },
  ]);

  const updateStatus = (id: string, newStatus: TicketItem['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const columns: Column<TicketItem>[] = [
    {
      key: 'id',
      header: 'Ticket Ref',
      render: (item) => <span className="font-mono font-bold text-[#225944]">{item.id}</span>,
    },
    { key: 'studentName', header: 'Complainant Student' },
    { key: 'category', header: 'Issue Category' },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            item.priority === 'High'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : item.priority === 'Medium'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {item.priority.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'subject',
      header: 'Complaint Subject',
      render: (item) => <p className="text-xs text-[#171A18] max-w-sm font-medium">{item.subject}</p>,
    },
    {
      key: 'status',
      header: 'Resolution Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item) => (
        <select
          value={item.status}
          onChange={(e) => updateStatus(item.id, e.target.value as TicketItem['status'])}
          className="px-2 py-1 rounded-lg bg-slate-100 border border-[#E5E1D6] text-[10px] font-bold text-[#171A18] focus:outline-none cursor-pointer"
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Student Support Tickets & Complaints Desk"
        subtitle="Manage student issues, assign maintenance teams, and resolve complaints"
        columns={columns}
        data={tickets}
        searchPlaceholder="Search ticket ref or student name..."
      />
    </div>
  );
};

export default Complaints;
