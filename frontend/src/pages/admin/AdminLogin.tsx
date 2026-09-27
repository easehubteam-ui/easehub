import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await loginAdmin({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#171A18] flex items-center justify-center p-4 font-sans selection:bg-[#EECA3A] selection:text-[#171A18]">
      <div className="w-full max-w-md bg-white border border-[#E5E1D6] rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#225944] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#171A18]">EaseHub Admin Console</h1>
          <p className="text-xs text-[#6B6B63]">Sign in to access management dashboard & controls</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-2xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1.5">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@easehub.local"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAF6] border border-[#E5E1D6] text-sm text-[#171A18] focus:outline-none focus:border-[#225944] focus:bg-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAF6] border border-[#E5E1D6] text-sm text-[#171A18] focus:outline-none focus:border-[#225944] focus:bg-white transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#225944] hover:bg-[#184232] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In as Superadmin</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <a href="/" className="text-xs text-[#225944] font-semibold hover:underline">
            ← Return to EaseHub Customer App
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
