import React, { useState, useEffect, useMemo } from 'react';
import { userApi, UserRecord } from '../../services/userApi';
import { useAuth } from '../../context/AuthContext';

interface UserItem {
  id: string;
  authUserId?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  avatarUrl?: string;
  city?: string;
  address?: string;
  joinedAt: string;
}

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();

  // Data State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Modals & Drawers
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [userActivity, setUserActivity] = useState<{ bookingCount: number; paymentCount: number } | null>(null);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(false);

  const [userToBlockToggle, setUserToBlockToggle] = useState<UserItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
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
        avatarUrl: u.avatar_url,
        city: u.city || '—',
        address: u.address || '—',
        joinedAt: u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—',
      }));
      setUsers(mapped);
    } catch (err: any) {
      console.error('Failed to load users from DB:', err);
      setError('Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Open View User Details & Load Activity Counts
  const handleViewUser = async (user: UserItem) => {
    setSelectedUser(user);
    setLoadingActivity(true);
    setUserActivity(null);
    try {
      const activity = await userApi.getUserActivityCounts(user.id);
      setUserActivity(activity);
    } catch (err) {
      setUserActivity({ bookingCount: 0, paymentCount: 0 });
    } finally {
      setLoadingActivity(false);
    }
  };

  // Handle Block / Unblock Toggle
  const confirmToggleBlock = async () => {
    if (!userToBlockToggle) return;
    const item = userToBlockToggle;
    setUserToBlockToggle(null);

    const success = await userApi.toggleBlock(item.id, item.isActive);
    if (success) {
      triggerToast(`User ${item.name} has been ${item.isActive ? 'BLOCKED' : 'UNBLOCKED'}.`, 'success');
      loadUsers();
    } else {
      triggerToast(`Failed to update status for ${item.name}.`, 'error');
    }
  };

  // Handle Delete User
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const item = userToDelete;
    setUserToDelete(null);

    if (currentUser && (currentUser.id === item.id || currentUser.email === item.email)) {
      triggerToast('You cannot delete your own logged-in account.', 'error');
      return;
    }

    const superadmins = users.filter((u) => u.role.toLowerCase() === 'superadmin');
    if (item.role.toLowerCase() === 'superadmin' && superadmins.length <= 1) {
      triggerToast('Cannot delete the final superadmin account.', 'error');
      return;
    }

    const res = await userApi.deleteUser(item.id);
    if (res.success) {
      triggerToast(res.message || `User ${item.name} deleted successfully.`, 'success');
      loadUsers();
    } else {
      triggerToast(res.message || `Failed to delete ${item.name}.`, 'error');
    }
  };

  // Helper for Generated Initials Avatar
  const getInitials = (name: string) => {
    if (!name || name === '—') return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Filtered & Searched Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phone.toLowerCase().includes(q);
        const matchesId = u.id.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId) return false;
      }

      // Role Filter
      if (roleFilter !== 'all') {
        if (u.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
      }

      // Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && !u.isActive) return false;
        if (statusFilter === 'blocked' && u.isActive) return false;
        if (statusFilter === 'inactive' && u.isActive) return false;
      }

      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border shadow-md flex items-center gap-2 animate-in fade-in duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toastMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#225944] text-[26px]">group</span>
            <h1 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight">User Management</h1>
          </div>
          <p className="text-xs text-[#6B6B63] font-medium mt-1">
            Manage registered users and administrator accounts across EaseHub.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B63] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
          />
        </div>
      </div>

      {/* FILTER BAR & COUNTERS */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E1D6] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#6B6B63]">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#171A18] focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#6B6B63]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] font-bold text-[#171A18] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="text-[#6B6B63] font-semibold text-xs shrink-0">
          Total: <strong className="text-[#225944] font-extrabold">{filteredUsers.length}</strong> Registered Accounts
        </div>
      </div>

      {/* CONTENT AREA: LOADING / ERROR / EMPTY / TABLE */}
      {loading ? (
        /* SKELETON LOADING STATE */
        <div className="bg-white rounded-3xl border border-[#E5E1D6] p-6 shadow-xs space-y-4">
          <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse flex items-center px-4 gap-4">
                <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-1/6" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        /* ERROR STATE WITH RETRY */
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-10 text-center text-rose-900 space-y-3 shadow-xs">
          <span className="material-symbols-outlined text-4xl text-rose-600 block">cloud_off</span>
          <h3 className="text-base font-extrabold">Unable to load users</h3>
          <p className="text-xs text-rose-700 max-w-sm mx-auto font-medium">
            Could not retrieve database user records. Please check your admin network connection or login credentials.
          </p>
          <button
            onClick={loadUsers}
            className="px-5 py-2.5 rounded-xl bg-[#225944] text-white text-xs font-bold shadow-md hover:bg-[#184232] transition"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white rounded-3xl border border-[#E5E1D6] p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#F8FAF6] text-[#6B6B63] flex items-center justify-center mx-auto border border-[#E5E1D6]">
            <span className="material-symbols-outlined text-3xl">person_search</span>
          </div>
          <h3 className="text-base font-extrabold text-[#171A18]">No users found</h3>
          <p className="text-xs text-[#6B6B63] max-w-sm mx-auto font-medium">
            Registered users will appear here once they create an EaseHub account.
          </p>
        </div>
      ) : (
        /* DESKTOP TABLE & MOBILE CARDS */
        <div className="bg-white rounded-3xl border border-[#E5E1D6] shadow-xs overflow-hidden">
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EDEEEB] text-[#6B6B63] text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Contact Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D6] text-xs font-medium text-[#171A18]">
                {paginatedUsers.map((u) => {
                  const isSelf = currentUser && (currentUser.id === u.id || currentUser.email === u.email);

                  return (
                    <tr key={u.id} className="hover:bg-[#F8FAF6] transition-colors">
                      {/* USER COLUMN */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              className="w-10 h-10 rounded-2xl object-cover border border-[#E5E1D6] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-2xl bg-[#225944] text-[#EECA3A] font-extrabold flex items-center justify-center text-xs shrink-0 border border-[#EECA3A]/30">
                              {getInitials(u.name)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[#171A18] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#6B6B63]">{u.phone}</div>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL COLUMN */}
                      <td className="py-4 px-4 font-mono text-xs text-[#171A18]">{u.email}</td>

                      {/* ROLE COLUMN */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            u.role.toLowerCase() === 'superadmin'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : u.role.toLowerCase() === 'admin'
                              ? 'bg-[#EECA3A]/20 text-[#171A18] border border-[#EECA3A]'
                              : u.role.toLowerCase() === 'vendor'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* STATUS COLUMN */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-600' : 'bg-rose-600'}`}
                          />
                          <span>{u.isActive ? 'ACTIVE' : 'BLOCKED'}</span>
                        </span>
                      </td>

                      {/* JOINED COLUMN */}
                      <td className="py-4 px-4 text-[#6B6B63] font-medium">{u.joinedAt}</td>

                      {/* ACTIONS COLUMN */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* VIEW ACTION */}
                          <button
                            onClick={() => handleViewUser(u)}
                            className="p-2 rounded-xl bg-[#F8FAF6] hover:bg-[#E5E1D6] text-[#171A18] transition-colors"
                            title="View User Dossier"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          {/* BLOCK / UNBLOCK ACTION */}
                          {!isSelf && (
                            <button
                              onClick={() => setUserToBlockToggle(u)}
                              className={`p-2 rounded-xl transition-colors ${
                                u.isActive
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              }`}
                              title={u.isActive ? 'Block User' : 'Unblock User'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {u.isActive ? 'block' : 'check_circle'}
                              </span>
                            </button>
                          )}

                          {/* DELETE ACTION */}
                          {!isSelf && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              title="Delete User"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="block md:hidden divide-y divide-[#E5E1D6]">
            {paginatedUsers.map((u) => {
              const isSelf = currentUser && (currentUser.id === u.id || currentUser.email === u.email);

              return (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-2xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-[#225944] text-[#EECA3A] font-extrabold flex items-center justify-center text-xs">
                          {getInitials(u.name)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm text-[#171A18] flex items-center gap-1">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              You
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-[#6B6B63]">{u.email}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.isActive ? 'ACTIVE' : 'BLOCKED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8FAF6] p-2.5 rounded-xl border border-[#E5E1D6]">
                    <div>
                      <span className="text-[#6B6B63] block text-[10px]">Phone</span>
                      <span className="font-bold text-[#171A18]">{u.phone}</span>
                    </div>
                    <div>
                      <span className="text-[#6B6B63] block text-[10px]">Role</span>
                      <span className="font-bold text-[#225944] capitalize">{u.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleViewUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-[#171A18] font-bold text-xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>View</span>
                    </button>

                    {!isSelf && (
                      <button
                        onClick={() => setUserToBlockToggle(u)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 ${
                          u.isActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {u.isActive ? 'block' : 'check_circle'}
                        </span>
                        <span>{u.isActive ? 'Block' : 'Unblock'}</span>
                      </button>
                    )}

                    {!isSelf && (
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION FOOTER */}
          <div className="p-4 border-t border-[#E5E1D6] bg-[#F8FAF6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#6B6B63] font-medium">
              Showing <strong className="text-[#171A18]">{paginatedUsers.length}</strong> of{' '}
              <strong className="text-[#171A18]">{filteredUsers.length}</strong> users
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E1D6] font-bold text-[#171A18] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all ${
                      currentPage === pageNum
                        ? 'bg-[#225944] text-white shadow-xs'
                        : 'bg-white border border-[#E5E1D6] text-[#6B6B63] hover:text-[#171A18]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E1D6] font-bold text-[#171A18] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* USER DETAILS DRAWER / MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D6]">
              <div className="flex items-center gap-3">
                {selectedUser.avatarUrl ? (
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#E5E1D6]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#225944] text-[#EECA3A] font-black flex items-center justify-center text-sm border border-[#EECA3A]/30">
                    {getInitials(selectedUser.name)}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-base text-[#171A18]">{selectedUser.name}</h3>
                  <p className="text-xs text-[#6B6B63] font-mono">{selectedUser.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#6B6B63] transition"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#F8FAF6] border border-[#E5E1D6]">
                <div>
                  <span className="text-[#6B6B63] block text-[10px] font-bold uppercase">Email Address</span>
                  <span className="font-bold text-[#171A18]">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-[#6B6B63] block text-[10px] font-bold uppercase">Phone Number</span>
                  <span className="font-bold text-[#171A18]">{selectedUser.phone}</span>
                </div>
                <div>
                  <span className="text-[#6B6B63] block text-[10px] font-bold uppercase">Role</span>
                  <span className="font-extrabold text-[#225944] capitalize">{selectedUser.role}</span>
                </div>
                <div>
                  <span className="text-[#6B6B63] block text-[10px] font-bold uppercase">Account Status</span>
                  <span
                    className={`font-bold ${selectedUser.isActive ? 'text-emerald-700' : 'text-rose-700'}`}
                  >
                    {selectedUser.isActive ? 'ACTIVE' : 'BLOCKED'}
                  </span>
                </div>
              </div>

              {/* REAL DATABASE ACTIVITY COUNTS */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAF6] border border-[#E5E1D6] space-y-2">
                <span className="text-[#6B6B63] block text-[10px] font-bold uppercase">Database Activity Summary</span>
                {loadingActivity ? (
                  <div className="text-xs text-[#225944] font-bold flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-[#225944] border-t-transparent rounded-full animate-spin"></span>
                    <span>Querying activity records from PostgreSQL...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-[#E5E1D6] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#6B6B63]">Bookings Logged</span>
                      <span className="text-sm font-extrabold text-[#225944]">
                        {userActivity?.bookingCount ?? 0}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E5E1D6] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#6B6B63]">Payments Made</span>
                      <span className="text-sm font-extrabold text-[#225944]">
                        {userActivity?.paymentCount ?? 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[#6B6B63] block text-[10px] font-bold uppercase">Account Registration</span>
                <p className="text-[#171A18] font-medium mt-0.5">
                  Joined platform on <strong className="font-extrabold">{selectedUser.joinedAt}</strong>.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E1D6] flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs shadow-md transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK / UNBLOCK CONFIRMATION MODAL */}
      {userToBlockToggle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  userToBlockToggle.isActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {userToBlockToggle.isActive ? 'block' : 'check_circle'}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#171A18]">
                {userToBlockToggle.isActive ? 'Block User?' : 'Unblock User?'}
              </h3>
            </div>

            <p className="text-xs text-[#6B6B63] leading-relaxed font-medium">
              Are you sure you want to {userToBlockToggle.isActive ? 'block' : 'unblock'} user{' '}
              <strong className="text-[#171A18]">{userToBlockToggle.name}</strong> ({userToBlockToggle.email})? This
              will update their active status in InsForge PostgreSQL database.
            </p>

            <div className="pt-3 border-t border-[#E5E1D6] flex items-center justify-end gap-3">
              <button
                onClick={() => setUserToBlockToggle(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#171A18] transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleBlock}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-md transition ${
                  userToBlockToggle.isActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {userToBlockToggle.isActive ? 'Block User' : 'Unblock User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <h3 className="text-lg font-extrabold text-[#171A18]">Delete User?</h3>
            </div>

            <p className="text-xs text-[#6B6B63] leading-relaxed font-medium">
              Are you sure you want to permanently delete user <strong className="text-[#171A18]">{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be undone.
            </p>

            <div className="pt-3 border-t border-[#E5E1D6] flex items-center justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#171A18] transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition shadow-md"
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
