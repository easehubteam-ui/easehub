import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!email.trim() || resendCooldown > 0 || isSubmitting) return;
    setError(null);
    setMessage(null);
    try {
      setIsSubmitting(true);
      const res = await authApi.forgotPassword({ emailOrPhone: email });
      if (res.success) {
        setMessage('If an account exists for this email, a new reset code has been sent.');
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to resend the reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if ((!token && (!email.trim() || !resetCode.trim())) || !password || !confirmPassword) {
      setError(token ? 'Please fill in both password fields.' : 'Enter your email, reset code, and new password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.resetPassword({
        email,
        code: resetCode,
        token: token || undefined,
        newPassword: password,
      });
      if (res.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(err?.message || err?.response?.data?.message || 'Invalid or expired password reset token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-[#F8FAF6] text-[#191C1A] font-sans antialiased flex flex-col justify-center p-3 sm:p-6 selection:bg-[#EECA3A] selection:text-[#171A18]">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl border border-[#E5E1D6]">
        <div className="text-center mb-4 sm:mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <img
              src="/logo.png"
              alt="EaseHub Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-xs border border-[#E5E1D6]"
            />
            <span className="text-xl font-extrabold tracking-tight text-[#225944]">
              Ease<span className="text-[#EECA3A]">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl font-extrabold text-[#225944] tracking-tight">Set New Password</h1>
          <p className="text-xs text-[#6B6B63] mt-1">Enter the code sent to your email and choose a new password.</p>
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

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {!token && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#191C1A] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full px-3.5 py-3 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-sm text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#191C1A] mb-1">Reset Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  required
                  className="w-full px-3.5 py-3 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-sm tracking-[0.25em] text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <Link to="/forgot-password" className="font-bold text-[#225944] hover:underline">
                  Back to email
                </Link>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSubmitting || resendCooldown > 0 || !email.trim()}
                  className="font-bold text-[#225944] underline underline-offset-2 disabled:text-[#6B6B63] disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-semibold text-[#191C1A] mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-3.5 py-3 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-sm text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
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
              minLength={6}
              autoComplete="new-password"
              className="w-full px-3.5 py-3 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-sm text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-[#225944] hover:bg-[#184232] text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
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

    </div>
  );
};

export default ResetPasswordPage;
