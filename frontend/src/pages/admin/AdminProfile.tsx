import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    setStatus('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E1D6] shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E5E1D6]">
          <div className="w-16 h-16 rounded-2xl bg-[#225944] text-[#EECA3A] text-2xl font-extrabold flex items-center justify-center border border-[#EECA3A]/40 shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#171A18]">{user?.name || 'Administrator'}</h2>
            <p className="text-xs text-[#6B6B63]">{user?.email || 'admin@easehub.local'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
              Role: {user?.role || 'SUPERADMIN'}
            </span>
          </div>
        </div>

        {status && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>{status}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-[#171A18] mb-3">Security & Password Update</h3>

          <div>
            <label className="block font-bold text-[#171A18] mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-[#E5E1D6] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#225944]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#171A18] mb-1">New Administrator Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-[#E5E1D6] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#225944]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#171A18] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-[#E5E1D6] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#225944]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-bold text-xs shadow-md transition-all mt-2"
          >
            Update Admin Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
