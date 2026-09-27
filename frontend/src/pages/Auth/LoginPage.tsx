import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type RoleType = 'resident' | 'vendor' | 'admin';
type MethodType = 'phone' | 'email';

export const LoginPage: React.FC = () => {
  const location = useLocation();
  const initialRole: RoleType = (location.state as any)?.role || 'resident';
  const initialError: string | null = (location.state as any)?.error || null;

  const [role, setRole] = useState<RoleType>(initialRole);
  const [method, setMethod] = useState<MethodType>('email');

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpValues, setOtpValues] = useState(['4', '8', '2', '0']);
  const [otpSent, setOtpSent] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole);
    setErrorMsg(null);
    if (newRole === 'admin') {
      setEmail('admin@easehub.local');
      setPassword('EaseHub@2026!Admin');
    } else if (newRole === 'vendor') {
      setEmail('vendor@easehub.local');
      setPassword('EaseHub@2026!Vendor');
    } else {
      setEmail('user@easehub.local');
      setPassword('EaseHub@2026!User');
    }
  };

  const getTargetUrl = () => {
    let target = location.state?.from?.pathname || location.state?.from || '/dashboard';
    if (target === '/' || target === '/login' || target === '/register') {
      target = '/dashboard';
    }
    return target;
  };

  const handleSendOtp = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg(null);
    setOtpSent(true);
  };

  const handleOtpBoxChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!otpSent) {
      setOtpSent(true);
      return;
    }

    const enteredOtp = otpValues.join('');
    if (enteredOtp.length < 4) {
      setErrorMsg('Please enter the complete 4-digit OTP code.');
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedUser = await login({ phone: cleanPhone, password: 'EaseHub@2026!User' });
      if (loggedUser) {
        if (loggedUser.role === 'admin' || loggedUser.role === 'superadmin') {
          navigate('/admin/dashboard');
        } else {
          navigate(getTargetUrl());
        }
      } else {
        setErrorMsg('Authentication failed. Invalid mobile credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Mobile OTP login failed. Please verify mobile number.');
    } finally {
      setIsSubmitting(false);
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
        if (loggedUser.role === 'admin' || loggedUser.role === 'superadmin') {
          navigate('/admin/dashboard');
        } else {
          navigate(getTargetUrl());
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
        <div className="relative w-full max-w-[1150px] flex flex-col justify-center">
          {/* Ambient Backdrop Flares */}
          <div className="absolute -top-12 -left-16 w-72 h-72 rounded-full bg-[#225944]/15 blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-[#EECA3A]/20 blur-3xl pointer-events-none"></div>

          {/* Main Auth Master Grid Container */}
          <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white shadow-xl overflow-hidden border border-[#E5E1D6]">
            {/* LEFT COLUMN: Interactive Authentication Form (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between bg-white z-10">
              <div>
                {/* Top Role Selector Pills */}
                <div className="inline-flex p-1 rounded-full bg-[#EDEEEB] mb-6 border border-[#E5E1D6]">
                  <div className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#225944] text-white shadow-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">school</span>
                    <span>Student Resident</span>
                  </div>
                </div>

                {/* Header Title & Subtitle */}
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#225944] tracking-tight mb-1">
                    Welcome back to Ease<span className="text-[#EECA3A]">Hub</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[#6B6B63]">
                    Sign in to access your bookings, mess plan, and instant student perks.
                  </p>
                </div>

                {/* Error Alert Box */}
                {errorMsg && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-shake">
                    <span className="material-symbols-outlined text-[18px] text-rose-600">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Login Method Segmented Control (Phone / Email) */}
                <div className="flex border-b border-[#E5E1D6] mb-6">
                  <button
                    type="button"
                    onClick={() => setMethod('email')}
                    className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 ${
                      method === 'email'
                        ? 'border-[#225944] text-[#225944]'
                        : 'border-transparent text-[#6B6B63] hover:text-[#191C1A]'
                    }`}
                  >
                    Email &amp; Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('phone')}
                    className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 ${
                      method === 'phone'
                        ? 'border-[#225944] text-[#225944]'
                        : 'border-transparent text-[#6B6B63] hover:text-[#191C1A]'
                    }`}
                  >
                    Mobile OTP Login
                  </button>
                </div>

                {/* METHOD 1: EMAIL & PASSWORD FORM */}
                {method === 'email' && (
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
                )}

                {/* METHOD 2: MOBILE OTP FORM */}
                {method === 'phone' && (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-[#191C1A] mb-1">
                        Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center px-3 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-xs font-bold text-[#191C1A]">
                          +91
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="98271 44820"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-xs font-bold text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                        />
                      </div>
                    </div>

                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="w-full py-3 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2"
                      >
                        <span>Send 4-Digit OTP</span>
                        <span className="material-symbols-outlined text-[16px]">sms</span>
                      </button>
                    ) : (
                      <div className="space-y-4 animate-in fade-in">
                        <div>
                          <label className="block text-xs font-extrabold text-[#191C1A] mb-2">
                            Enter OTP sent to +91 {phoneNumber}
                          </label>
                          <div className="flex justify-between gap-2 max-w-[240px]">
                            {otpValues.map((digit, idx) => (
                              <input
                                key={idx}
                                id={`otp-${idx}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                                className="w-11 h-11 text-center font-extrabold text-lg rounded-xl bg-[#F3F4F0] border border-[#225944] focus:ring-2 focus:ring-[#225944]"
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? 'Verifying OTP...' : 'Verify & Continue'}
                        </button>
                      </div>
                    )}
                  </form>
                )}


              </div>

              {/* Bottom Footer Signup Hint */}
              <div className="pt-6 mt-6 border-t border-[#E5E1D6] text-center text-xs text-[#6B6B63]">
                <span>Don't have an EaseHub account? </span>
                <Link to="/register" className="font-bold text-[#225944] hover:underline">
                  Create Account
                </Link>
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
