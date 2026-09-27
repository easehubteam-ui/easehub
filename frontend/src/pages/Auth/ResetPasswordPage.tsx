import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.resetPassword({ token, newPassword: password });
      if (res.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or expired password reset token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#191C1A] font-sans antialiased flex flex-col justify-between p-4 sm:p-6 selection:bg-[#EECA3A] selection:text-[#171A18]">
      <div className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E5E1D6]">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <img
              src="/logo.jpg"
              alt="EaseHub Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-xs border border-[#E5E1D6]"
            />
            <span className="text-xl font-extrabold tracking-tight text-[#225944]">
              Ease<span className="text-[#EECA3A]">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl font-extrabold text-[#225944] tracking-tight">Set New Password</h1>
          <p className="text-xs text-[#6B6B63] mt-1">Enter your new secure account password below</p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#191C1A] mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-xs text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191C1A] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-xs text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#6B6B63]">
          Back to{' '}
          <Link to="/login" className="font-extrabold text-[#225944] hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      <footer className="text-center text-[10px] text-[#6B6B63] py-2">
        © {new Date().getFullYear()} EaseHub Technologies. All rights reserved.
      </footer>
    </div>
  );
};

export default ResetPasswordPage;
