import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const location = useLocation();
  const initialError: string | null = (location.state as any)?.error || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const { user, isAuthenticated, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await loginAdmin({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Administrator access is required.');
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
          <p className="text-xs text-[#6B6B63]">Sign in to access management dashboard &amp; controls</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-4 rounded-2xl text-center space-y-2">
            <p>{error}</p>
            {error.includes('Administrator access') && (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#184232] transition shadow-2xs mt-1"
              >
                <span>Go to Customer Login</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1.5">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@easehub.in"
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
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <span>Sign In to Admin Console</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 flex items-center justify-between text-xs font-bold">
          <Link to="/" className="text-[#225944] hover:underline">
            ← Return to EaseHub
          </Link>
          <Link to="/login" className="text-[#225944] hover:underline">
            Customer Login →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
