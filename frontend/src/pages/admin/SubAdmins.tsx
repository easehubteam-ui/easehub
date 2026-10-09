import React, { useState, useEffect, useCallback } from 'react';
import { userApi, UserRecord } from '../../services/userApi';
import { StatusBadge } from '../../components/admin/StatusBadge';
import {
  ADMIN_PERMISSION_MODULES,
  AdminPermissionKey,
  AdminPermissions,
} from '../../types';

const DEFAULT_PERMISSIONS: AdminPermissions = {
  dashboard: true,
  users: false,
  pg: false,
  meals: false,
  laundry: false,
  services: false,
  bookings: false,
  payments: false,
  reviews: false,
  notifications: false,
  community: false,
  support: false,
  reports: false,
  vendors: false,
  complaints: false,
  activity_logs: false,
  settings: false,
};

export const SubAdmins: React.FC = () => {
  const [subAdmins, setSubAdmins] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createModalError, setCreateModalError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    isActive: true,
    permissions: { ...DEFAULT_PERMISSIONS } as AdminPermissions,
  });

  // Edit / Manage Permissions Modal State
  const [editingSubAdmin, setEditingSubAdmin] = useState<UserRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    isActive: true,
    permissions: { ...DEFAULT_PERMISSIONS } as AdminPermissions,
  });

  // Delete Confirmation Modal State
  const [deletingSubAdmin, setDeletingSubAdmin] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadSubAdmins = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const list = await userApi.getSubAdmins();
      setSubAdmins(list);
    } catch (err: any) {
      console.error('Failed to load Sub Admins:', err);
      if (!silent) {
        setError('Unable to load Sub Admins from database.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadSubAdmins();
  }, [loadSubAdmins]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setCreateModalError(null);
    setCreateForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      isActive: true,
      permissions: { ...DEFAULT_PERMISSIONS },
    });
    setShowCreateModal(true);
  };

  // Submit Create Sub Admin
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    setCreating(true);
    setCreateModalError(null);
    try {
      const res = await userApi.createSubAdmin({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone,
        isActive: createForm.isActive,
        permissions: createForm.permissions,
      });

      if (res.success) {
        if (res.data) {
          const newRecord = res.data;
          setSubAdmins((prev) => [
            newRecord,
            ...prev.filter(
              (item) =>
                item.id !== newRecord.id &&
                (item.email || '').toLowerCase() !== (newRecord.email || '').toLowerCase()
            ),
          ]);
        }
        setSearchQuery('');
        setShowCreateModal(false);
        triggerToast(res.message || 'Sub Admin account created successfully.', 'success');
        await loadSubAdmins(true);
      } else {
        const msg = res.message || 'Failed to create Sub Admin.';
        setCreateModalError(msg);
        triggerToast(msg, 'error');
      }
    } finally {
      setCreating(false);
    }
  };

  // Open Edit / Permission Modal
  const handleOpenEdit = (item: UserRecord) => {
    setEditModalError(null);
    const existingPerms: AdminPermissions = {
      ...DEFAULT_PERMISSIONS,
      ...(item.permissions || {}),
    };
    setEditingSubAdmin(item);
    setEditForm({
      name: item.name || '',
      phone: item.phone || '',
      isActive: item.is_active ?? true,
      permissions: existingPerms,
    });
  };

  // Submit Edit / Save Permissions
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubAdmin || savingEdit) return;

    setSavingEdit(true);
    setEditModalError(null);
    try {
      const res = await userApi.updateSubAdmin(editingSubAdmin.id, {
        name: editForm.name,
        phone: editForm.phone,
        isActive: editForm.isActive,
        permissions: editForm.permissions,
      });

      if (res.success) {
        if (res.data) {
          const updatedRecord = res.data;
          setSubAdmins((prev) =>
            prev.map((item) => (item.id === updatedRecord.id ? updatedRecord : item))
          );
        }
        setEditingSubAdmin(null);
        triggerToast(res.message || `Permissions updated for ${editForm.name}.`, 'success');
        await loadSubAdmins(true);
      } else {
        const msg = res.message || 'Failed to update Sub Admin.';
        setEditModalError(msg);
        triggerToast(msg, 'error');
      }
    } finally {
      setSavingEdit(false);
    }
  };

  // Quick Enable / Disable Toggle
  const handleToggleStatus = async (item: UserRecord) => {
    const ok = await userApi.toggleBlock(item.id, item.is_active);
    if (ok) {
      setSubAdmins((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, is_active: !item.is_active } : row))
      );
      triggerToast(
        `Sub Admin ${item.name} is now ${!item.is_active ? 'ACTIVE' : 'DISABLED'}.`,
        'success'
      );
      await loadSubAdmins(true);
    } else {
      triggerToast(`Failed to update status for ${item.name}.`, 'error');
    }
  };

  // Delete / Deactivate Sub Admin
  const handleDeleteConfirm = async () => {
    if (!deletingSubAdmin || deleting) return;
    setDeleting(true);
    try {
      const res = await userApi.deleteUser(deletingSubAdmin.id);
      if (res.success) {
        const targetId = deletingSubAdmin.id;
        if (!res.softDeleted) {
          setSubAdmins((prev) => prev.filter((row) => row.id !== targetId));
        }
        triggerToast(res.message || `Sub Admin ${deletingSubAdmin.name} removed.`, 'success');
        setDeletingSubAdmin(null);
        await loadSubAdmins(true);
      } else {
        triggerToast(res.message || 'Failed to remove Sub Admin.', 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  // Toggle permission helper for Create Form
  const toggleCreatePerm = (key: AdminPermissionKey) => {
    setCreateForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  // Toggle permission helper for Edit Form
  const toggleEditPerm = (key: AdminPermissionKey) => {
    setEditForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const setAllCreatePerms = (val: boolean) => {
    const next: AdminPermissions = {};
    ADMIN_PERMISSION_MODULES.forEach((m) => {
      next[m.key] = val;
    });
    setCreateForm((prev) => ({ ...prev, permissions: next }));
  };

  const setAllEditPerms = (val: boolean) => {
    const next: AdminPermissions = {};
    ADMIN_PERMISSION_MODULES.forEach((m) => {
      next[m.key] = val;
    });
    setEditForm((prev) => ({ ...prev, permissions: next }));
  };

  const filteredSubAdmins = subAdmins.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(q) ||
      (item.email || '').toLowerCase().includes(q) ||
      (item.phone || '').toLowerCase().includes(q)
    );
  });

  const getEnabledModules = (perms?: AdminPermissions) => {
    if (!perms) return [];
    return ADMIN_PERMISSION_MODULES.filter((m) => Boolean(perms[m.key]));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center justify-between ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="text-xs font-extrabold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E1D6] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#225944] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#171A18] tracking-tight">
                Sub Admin Management
              </h1>
              <p className="text-xs text-[#6B6B63]">
                Create Sub Admin accounts and control module-level access permissions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined text-[18px] text-[#6B6B63] absolute left-3 top-2.5">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sub-admins..."
              className="pl-9 pr-4 py-2 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold text-[#171A18] focus:outline-none focus:border-[#225944]"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Create Sub Admin</span>
          </button>
        </div>
      </div>

      {/* Main Content Table / Empty State */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E5E1D6] p-12 text-center shadow-xs">
          <div className="w-10 h-10 border-4 border-[#225944] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#171A18]">Loading Sub Admins...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center text-rose-800 font-semibold text-sm">
          <p>{error}</p>
          <button
            onClick={() => loadSubAdmins()}
            className="mt-3 px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold"
          >
            Retry
          </button>
        </div>
      ) : filteredSubAdmins.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E5E1D6] p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F3F4F0] text-[#225944] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">manage_accounts</span>
          </div>
          <h3 className="text-base font-extrabold text-[#171A18]">
            {searchQuery ? 'No matching Sub Admins found' : 'No Sub Admins created yet'}
          </h3>
          <p className="text-xs text-[#6B6B63] max-w-md mx-auto">
            {searchQuery
              ? 'Try clearing your search filter.'
              : 'Create a Sub Admin account and assign specific module permissions such as PG Management, Meals, Bookings, or Community Chat.'}
          </p>
          {!searchQuery && (
            <div className="pt-2">
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Create First Sub Admin</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E1D6] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F3F4F0]/80 border-b border-[#E5E1D6] text-[11px] font-extrabold uppercase text-[#6B6B63] tracking-wider">
                  <th className="py-3.5 px-4">Sub Admin</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Module Permissions</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D6] text-xs">
                {filteredSubAdmins.map((item) => {
                  const enabledModules = getEnabledModules(item.permissions);
                  return (
                    <tr key={item.id} className="hover:bg-[#F8FAF6] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#225944] text-[#EECA3A] font-bold flex items-center justify-center text-xs shrink-0">
                            {(item.name || 'S').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#171A18]">{item.name}</div>
                            <div className="text-[11px] text-[#6B6B63]">{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#171A18]">
                        {item.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={item.is_active ? 'active' : 'blocked'}
                          text={item.is_active ? 'ACTIVE' : 'DISABLED'}
                        />
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        {enabledModules.length === 0 ? (
                          <span className="text-[11px] text-rose-600 font-semibold">
                            No modules assigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {enabledModules.map((mod) => (
                              <span
                                key={mod.key}
                                className="px-2 py-0.5 rounded-lg bg-[#F3F4F0] border border-[#E5E1D6] text-[#171A18] text-[10px] font-bold"
                              >
                                ✓ {mod.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-3 py-1.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                            title="Edit Sub Admin & Permissions"
                          >
                            <span className="material-symbols-outlined text-[14px]">tune</span>
                            <span>Permissions</span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                              item.is_active
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {item.is_active ? 'Disable' : 'Enable'}
                          </button>

                          <button
                            onClick={() => setDeletingSubAdmin(item)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Delete Sub Admin"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE SUB ADMIN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E5E1D6] my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D6] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#225944] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#171A18]">Create New Sub Admin</h3>
                  <p className="text-[11px] text-[#6B6B63]">
                    Creates an authenticated InsForge user with custom module access
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#6B6B63] hover:text-[#171A18]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="overflow-y-auto py-4 space-y-5 pr-1">
              {createModalError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
                  <span>{createModalError}</span>
                  <button
                    type="button"
                    onClick={() => setCreateModalError(null)}
                    className="ml-3 font-extrabold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold text-[#171A18] focus:outline-none focus:border-[#225944]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="rahul@easehub.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold text-[#171A18] focus:outline-none focus:border-[#225944]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    Password * (min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold text-[#171A18] focus:outline-none focus:border-[#225944]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold text-[#171A18] focus:outline-none focus:border-[#225944]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
                <div>
                  <span className="text-xs font-bold text-[#171A18] block">Account Status</span>
                  <span className="text-[11px] text-[#6B6B63]">
                    Allow this Sub Admin to sign in immediately
                  </span>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.isActive}
                    onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                    className="rounded text-[#225944] focus:ring-[#225944] w-4 h-4"
                  />
                  <span className="text-xs font-bold text-[#171A18]">
                    {createForm.isActive ? 'Active' : 'Disabled'}
                  </span>
                </label>
              </div>

              {/* Module Permissions Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#171A18] uppercase tracking-wider">
                      Assign Module Permissions
                    </h4>
                    <p className="text-[11px] text-[#6B6B63]">
                      Sub Admin will only see and access checked modules
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAllCreatePerms(true)}
                      className="px-2.5 py-1 rounded-lg bg-[#F3F4F0] hover:bg-[#E5E1D6] text-[11px] font-bold text-[#171A18]"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllCreatePerms(false)}
                      className="px-2.5 py-1 rounded-lg bg-[#F3F4F0] hover:bg-[#E5E1D6] text-[11px] font-bold text-[#6B6B63]"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ADMIN_PERMISSION_MODULES.map((mod) => {
                    const checked = Boolean(createForm.permissions[mod.key]);
                    return (
                      <label
                        key={mod.key}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                          checked
                            ? 'bg-emerald-50/70 border-[#225944] text-[#171A18]'
                            : 'bg-white border-[#E5E1D6] text-[#6B6B63] hover:bg-[#F8FAF6]'
                        }`}
                      >
                        <span>{mod.label}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCreatePerm(mod.key)}
                          className="rounded text-[#225944] focus:ring-[#225944] w-4 h-4"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E1D6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#171A18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {creating ? 'Creating Sub Admin...' : 'Create Sub Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUB ADMIN / PERMISSIONS MODAL */}
      {editingSubAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E5E1D6] my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D6] shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-[#171A18]">
                  Sub Admin: {editingSubAdmin.name}
                </h3>
                <p className="text-xs text-[#6B6B63]">Email: {editingSubAdmin.email}</p>
              </div>
              <button
                onClick={() => setEditingSubAdmin(null)}
                className="p-1 rounded-lg text-[#6B6B63] hover:text-[#171A18]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="overflow-y-auto py-4 space-y-5 pr-1">
              {editModalError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
                  <span>{editModalError}</span>
                  <button
                    type="button"
                    onClick={() => setEditModalError(null)}
                    className="ml-3 font-extrabold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold text-[#171A18] focus:outline-none focus:border-[#225944]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6] text-xs font-semibold text-[#171A18] focus:outline-none focus:border-[#225944]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF6] border border-[#E5E1D6]">
                <div>
                  <span className="text-xs font-bold text-[#171A18] block">
                    Status: {editForm.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <span className="text-[11px] text-[#6B6B63]">
                    Disabled Sub Admins are immediately blocked from accessing Admin Panel
                  </span>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded text-[#225944] focus:ring-[#225944] w-4 h-4"
                  />
                  <span className="text-xs font-bold text-[#171A18]">
                    {editForm.isActive ? 'Active' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#171A18] uppercase tracking-wider">
                      Permissions
                    </h4>
                    <p className="text-[11px] text-[#6B6B63]">
                      Toggle module access for {editingSubAdmin.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAllEditPerms(true)}
                      className="px-2.5 py-1 rounded-lg bg-[#F3F4F0] hover:bg-[#E5E1D6] text-[11px] font-bold text-[#171A18]"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllEditPerms(false)}
                      className="px-2.5 py-1 rounded-lg bg-[#F3F4F0] hover:bg-[#E5E1D6] text-[11px] font-bold text-[#6B6B63]"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ADMIN_PERMISSION_MODULES.map((mod) => {
                    const checked = Boolean(editForm.permissions[mod.key]);
                    return (
                      <label
                        key={mod.key}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                          checked
                            ? 'bg-emerald-50/70 border-[#225944] text-[#171A18]'
                            : 'bg-white border-[#E5E1D6] text-[#6B6B63] hover:bg-[#F8FAF6]'
                        }`}
                      >
                        <span>{mod.label}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEditPerm(mod.key)}
                          className="rounded text-[#225944] focus:ring-[#225944] w-4 h-4"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E1D6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSubAdmin(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#171A18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSubAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <h3 className="text-lg font-extrabold text-[#171A18]">Remove Sub Admin?</h3>
            </div>

            <p className="text-xs text-[#6B6B63] leading-relaxed">
              Are you sure you want to delete or deactivate Sub Admin{' '}
              <strong className="text-[#171A18]">{deletingSubAdmin.name}</strong> (
              {deletingSubAdmin.email})? They will immediately lose access to the Admin Panel.
            </p>

            <div className="pt-3 border-t border-[#E5E1D6] flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingSubAdmin(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#171A18]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Delete Sub Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdmins;
