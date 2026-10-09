import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { userApi, UserRecord } from '../../services/userApi';
import { useAuth } from '../../context/AuthContext';
import { UserRole, isAdminRole, isSuperAdminRole } from '../../types';

interface UserItem {
  id: string;
  authUserId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  college?: string;
  joinedAt: string;
}

export const Users: React.FC = () => {
  const { user: currentUser, isSuperAdmin } = useAuth();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const dbUsers: UserRecord[] = await userApi.getAll();
      const mapped: UserItem[] = dbUsers.map((u) => ({
        id: u.id,
        authUserId: u.auth_user_id,
        name: u.name || '—',
        email: u.email || '—',
        phone: u.phone || '—',
        role: u.role || 'customer',
        isActive: u.is_active ?? true,
        college: u.city || u.address || '—',
        joinedAt: u.created_at ? u.created_at.split('T')[0] : '—'
      }));
      setUsers(mapped);
    } catch (err: any) {
      console.error('Failed to load users from DB:', err);
      setError('Unable to load users from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleBlock = async (item: UserItem) => {
    const success = await userApi.toggleBlock(item.id, item.isActive);
    if (success) {
      triggerToast(`User ${item.name} status updated to ${!item.isActive ? 'ACTIVE' : 'BLOCKED'}.`, 'success');
      loadUsers();
    } else {
      triggerToast(`Failed to update status for ${item.name}.`, 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (currentUser && (currentUser.id === userToDelete.id || currentUser.email === userToDelete.email)) {
      triggerToast('You cannot delete your own logged-in account.', 'error');
      setUserToDelete(null);
      return;
    }

    const superadmins = users.filter((u) => u.role === 'superadmin');
    if (userToDelete.role === 'superadmin' && superadmins.length <= 1) {
      triggerToast('Cannot delete the final superadmin account.', 'error');
      setUserToDelete(null);
      return;
    }

    // Immediately remove from UI
    const deletedUser = userToDelete;
    setUsers((prev) => prev.filter((u) => u.id !== deletedUser.id));
    setUserToDelete(null);

    const res = await userApi.deleteUser(deletedUser.id);
    if (res.success) {
      triggerToast(res.message || `User ${deletedUser.name} deleted.`, 'success');
    } else {
      // Restore on failure
      triggerToast(res.message || `Failed to delete ${deletedUser.name}. Refreshing list.`, 'error');
      loadUsers();
    }
  };

  const columns: Column<UserItem>[] = [
    {
      key: 'id',
      header: 'User ID',
      render: (item) => <span className="font-mono font-bold text-[#225944] text-xs">{item.id}</span>,
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
      render: (item) => {
        const isSelf = currentUser && (currentUser.id === item.id || currentUser.email === item.email);
        const isTargetAdmin = isAdminRole(item.role);
        const canModifyRow = !isSelf && (isSuperAdmin || !isTargetAdmin) && !isSuperAdminRole(item.role);

        return (
          <div className="flex items-center gap-1.5">
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

            {canModifyRow && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBlock(item);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  item.isActive
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
                title={item.isActive ? 'Block User' : 'Unblock User'}
              >
                {item.isActive ? 'Block' : 'Unblock'}
              </button>
            )}

            {canModifyRow && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserToDelete(item);
                }}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                title="Delete User"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className={`p-3 rounded-2xl text-xs font-bold border ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E5E1D6] p-12 text-center shadow-xs">
          <div className="w-10 h-10 border-4 border-[#225944] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#171A18]">Loading Real User Directory...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center text-rose-800 font-semibold text-sm">
          <p>{error}</p>
          <button onClick={loadUsers} className="mt-3 px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold">
            Retry
          </button>
        </div>
      ) : (
        <DataTable
          title="User Management Directory"
          subtitle="Manage customer, vendor, and administrator accounts directly from InsForge PostgreSQL"
          columns={columns}
          data={users}
          searchPlaceholder="Search name, email, or phone..."
          emptyMessage="No users found"
        />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E1D6]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#225944] text-[#EECA3A] font-bold flex items-center justify-center text-base">
                  {(selectedUser.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#171A18]">{selectedUser.name}</h3>
                  <p className="text-xs text-[#6B6B63] font-mono">{selectedUser.id}</p>
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
                  <span className="text-[#6B6B63] block text-[10px]">Campus / Location</span>
                  <span className="font-bold text-[#171A18]">{selectedUser.college}</span>
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

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <h3 className="text-lg font-extrabold text-[#171A18]">Delete this user?</h3>
            </div>

            <p className="text-xs text-[#6B6B63] leading-relaxed">
              Are you sure you want to permanently delete user <strong className="text-[#171A18]">{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be undone.
            </p>

            <div className="pt-3 border-t border-[#E5E1D6] flex items-center justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#171A18]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
