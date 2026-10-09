import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isAdminRole, getFirstAllowedAdminPath } from '../../types';

export const LoginPage: React.FC = () => {
  const location = useLocation();
  const initialError: string | null = (location.state as any)?.error || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { user, isAuthenticated, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const getTargetUrl = () => {
    let target = location.state?.from?.pathname || location.state?.from || '/dashboard';
    if (target === '/' || target === '/login' || target === '/register') {
      target = '/dashboard';
    }
    return target;
  };

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdminRole(user.role)) {
        navigate(getFirstAllowedAdminPath(user), { replace: true });
      } else {
        navigate(getTargetUrl(), { replace: true });
      }
    }
  }, [isAuthenticated, user]);

  const handleGoogleSubmit = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMsg(null);
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedUser = await login({ email: email.trim(), password });
      if (loggedUser) {
        if (isAdminRole(loggedUser.role)) {
          navigate(getFirstAllowedAdminPath(loggedUser), { replace: true });
        } else {
          navigate(getTargetUrl(), { replace: true });
        }
      } else {
        setErrorMsg('Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-[#F8FAF6] text-[#191C1A] font-sans antialiased flex flex-col justify-between selection:bg-[#EECA3A] selection:text-[#171A18]">
      <main className="flex-1 p-3 sm:p-4 md:p-6 flex items-center justify-center relative">
        <div className="relative w-full max-w-[1100px] flex flex-col justify-center">
          {/* Ambient Backdrop Flares */}
          <div className="absolute -top-12 -left-16 w-72 h-72 rounded-full bg-[#225944]/15 blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-[#EECA3A]/20 blur-3xl pointer-events-none"></div>

          {/* Main Auth Master Grid Container */}
          <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white shadow-xl overflow-hidden border border-[#E5E1D6]">
            {/* LEFT COLUMN: Interactive Authentication Form (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between bg-white z-10">
              <div>
                {/* Header Title & Subtitle */}
                <div className="mb-6">
                  <div className="inline-flex p-1 rounded-full bg-[#EDEEEB] mb-3 border border-[#E5E1D6]">
                    <div className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#225944] text-white shadow-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">school</span>
                      <span>Customer &amp; Resident Login</span>
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#225944] tracking-tight mb-1">
                    Welcome back to Ease<span className="text-[#EECA3A]">Hub</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[#6B6B63]">
                    Sign in to access your bookings, mess plan, and instant student perks.
                  </p>
                </div>

                {/* Error Alert Box */}
                {errorMsg && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
                      <span>{errorMsg}</span>
                    </div>
                    {errorMsg.includes('Admin') && (
                      <Link
                        to="/admin/login"
                        className="mt-1 self-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#225944] text-white text-xs font-extrabold hover:bg-[#184232] transition shadow-xs"
                      >
                        <span>Go to Admin Login</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    )}
                  </div>
                )}

                {/* EMAIL & PASSWORD AUTHENTICATION FORM */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#191C1A] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#6B6B63] text-[18px]">
                        mail
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@bitdurg.ac.in"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-xs font-bold text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-extrabold text-[#191C1A]">Password</label>
                      <Link to="/forgot-password" className="text-[11px] font-bold text-[#225944] hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#6B6B63] text-[18px]">
                        lock
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-xs font-bold text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-[#6B6B63] hover:text-[#191C1A]"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6B6B63] font-semibold">
                      <input
                        type="checkbox"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                        className="rounded text-[#225944] focus:ring-[#225944]"
                      />
                      <span>Remember me on this browser</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to EaseHub</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Google OAuth Section */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E1D6]"></div>
                  </div>
                  <div className="relative inline-block px-3 bg-white text-xs font-semibold text-[#6B6B63]">
                    or continue with
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isGoogleLoading || isSubmitting}
                  onClick={handleGoogleSubmit}
                  className="w-full py-3 rounded-xl bg-white hover:bg-[#F3F4F0] border border-[#E5E1D6] text-[#191C1A] font-extrabold text-xs transition shadow-2xs flex items-center justify-center gap-2.5 disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#225944] border-t-transparent rounded-full animate-spin"></span>
                      <span>Signing in with Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Footer Signup Hint & Admin Portal Link */}
              <div className="pt-6 mt-6 border-t border-[#E5E1D6] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B6B63]">
                <div>
                  <span>Don't have an account? </span>
                  <Link to="/register" className="font-bold text-[#225944] hover:underline">
                    Create Account
                  </Link>
                </div>
                <div>
                  <Link to="/admin/login" className="font-bold text-[#225944] hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                    <span>Admin Portal</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Visual Brand Showcase (5 cols) */}
            <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#225944] via-[#184232] to-[#02412e] p-8 text-white flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#EECA3A]/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#EECA3A] mb-4 border border-white/10">
                  <span>🎓 Bhilai &amp; Durg Campus Network</span>
                </div>
                <h2 className="text-2xl font-black leading-tight tracking-tight mb-3">
                  Simplifying Student Living Across Chhattisgarh.
                </h2>
                <p className="text-xs text-white/80 leading-relaxed">
                  Join 12,000+ students from BIT Durg, IIT Bhilai, Rungta &amp; CSVTU managing zero-brokerage PG stays and fresh daily tiffin subscriptions.
                </p>
              </div>

              {/* Verified Feature Chips */}
              <div className="relative z-10 space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EECA3A] text-[#171A18] flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">100% Escrow Guard</div>
                    <div className="text-[10px] text-white/70">Funds released only after student OTP verification</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#225944] flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[18px]">near_me</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">Express Doorstep SLAs</div>
                    <div className="text-[10px] text-white/70">30-min technician dispatch across all campus corridors</div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-white/60 flex items-center justify-between">
                <span>© 2026 EaseHub Platform</span>
                <span>v2.4.8 Central Node</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
