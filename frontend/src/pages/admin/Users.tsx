import React, { useState } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'vendor' | 'admin' | 'superadmin';
  isActive: boolean;
  college?: string;
  joinedAt: string;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([
    {
      id: 'USR-001',
      name: 'Priya Sharma',
      email: 'priya.s@bitdurg.ac.in',
      phone: '+91 98271 12345',
      role: 'customer',
      isActive: true,
      college: 'BIT Durg',
      joinedAt: '2026-08-15',
    },
    {
      id: 'USR-002',
      name: 'Rahul Verma',
      email: 'rahul.v@rungta.ac.in',
      phone: '+91 98271 54321',
      role: 'customer',
      isActive: true,
      college: 'Rungta Group Bhilai',
      joinedAt: '2026-08-18',
    },
    {
      id: 'USR-003',
      name: 'Royal Boys PG (Rajesh Kumar)',
      email: 'owner@royalboyspg.com',
      phone: '+91 98271 99999',
      role: 'vendor',
      isActive: true,
      college: 'Bhilai Sector 6',
      joinedAt: '2026-07-10',
    },
    {
      id: 'USR-004',
      name: 'System Superadmin',
      email: 'admin@easehub.local',
      phone: '+91 788 405 1120',
      role: 'superadmin',
      isActive: true,
      college: 'EaseHub HQ',
      joinedAt: '2026-01-01',
    },
    {
      id: 'USR-005',
      name: 'Vikas Singh',
      email: 'vikas.s@bitdurg.ac.in',
      phone: '+91 98271 88888',
      role: 'customer',
      isActive: false,
      college: 'BIT Durg',
      joinedAt: '2026-09-01',
    },
  ]);

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const columns: Column<UserItem>[] = [
    {
      key: 'id',
      header: 'User ID',
      render: (item) => <span className="font-mono font-bold text-[#225944]">{item.id}</span>,
    },
    {
      key: 'name',
      header: 'Full Name & Email',
      render: (item) => (
        <div>
          <div className="font-bold text-[#171A18]">{item.name}</div>
          <div className="text-[10px] text-[#6B6B63]">{item.email}</div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone' },
    { key: 'college', header: 'Campus / Location' },
    {
      key: 'role',
      header: 'Role',
      render: (item) => <StatusBadge status={item.role} />,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => (
        <StatusBadge status={item.isActive ? 'active' : 'blocked'} text={item.isActive ? 'ACTIVE' : 'BLOCKED'} />
      ),
    },
    { key: 'joinedAt', header: 'Joined Date' },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(item);
            }}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#171A18] transition-colors"
            title="View Details"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>
          {item.role !== 'superadmin' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleUserStatus(item.id);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                item.isActive
                  ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              {item.isActive ? 'Block' : 'Unblock'}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="User Management Directory"
        subtitle="Manage customer, vendor, and administrator accounts across EaseHub"
        columns={columns}
        data={users}
        searchPlaceholder="Search name, email, or phone..."
      />

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E1D6]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#225944] text-[#EECA3A] font-bold flex items-center justify-center text-base">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#171A18]">{selectedUser.name}</h3>
                  <p className="text-xs text-[#6B6B63]">{selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50">
                <div>
                  <span className="text-[#6B6B63] block text-[10px]">Email Address</span>
                  <span className="font-bold text-[#171A18]">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-[#6B6B63] block text-[10px]">Phone Number</span>
                  <span className="font-bold text-[#171A18]">{selectedUser.phone}</span>
                </div>
                <div>
                  <span className="text-[#6B6B63] block text-[10px]">Campus / Sector</span>
                  <span className="font-bold text-[#171A18]">{selectedUser.college || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#6B6B63] block text-[10px]">Role</span>
                  <StatusBadge status={selectedUser.role} />
                </div>
              </div>

              <div>
                <span className="text-[#6B6B63] block text-[10px] mb-1">Account Activity</span>
                <p className="text-[#171A18]">
                  Joined on <strong className="font-bold">{selectedUser.joinedAt}</strong>. Current status is{' '}
                  <strong className={selectedUser.isActive ? 'text-emerald-600' : 'text-rose-600'}>
                    {selectedUser.isActive ? 'ACTIVE' : 'BLOCKED'}
                  </strong>.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E1D6] flex justify-end gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#171A18]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
