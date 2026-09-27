import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('BIT Durg');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'resident' | 'vendor'>('resident');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service to create an account.');
      return;
    }

    try {
      setIsSubmitting(true);
      const registeredUser = await register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: 'customer',
        city: college,
      });

      if (registeredUser) {
        navigate('/dashboard');
      } else {
        setErrorMsg('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8FAF6] text-[#191C1A] font-sans antialiased min-h-screen flex flex-col justify-between selection:bg-[#EECA3A] selection:text-[#171A18]">
      {/* Main Content */}
      <main className="w-full flex-1 pt-6 pb-12 bg-[#F8FAF6] flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white shadow-xl overflow-hidden border border-[#E5E1D6]">
            
            {/* Left Register Form (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="inline-flex p-1 rounded-full bg-[#EDEEEB] mb-6 border border-[#E5E1D6]">
                  <div className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#225944] text-white shadow-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">school</span>
                    <span>Student Resident</span>
                  </div>
                </div>

                <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
                  <img
                    src="/logo.jpg"
                    alt="EaseHub Logo"
                    className="w-10 h-10 rounded-xl object-cover shadow-xs border border-[#E5E1D6] group-hover:scale-105 transition-transform"
                  />
                  <span className="text-xl font-extrabold tracking-tight text-[#225944]">
                    Ease<span className="text-[#EECA3A]">Hub</span>
                  </span>
                </Link>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#225944] tracking-tight mb-1">
                  Create your EaseHub Account
                </h1>
                <p className="text-xs sm:text-sm text-[#6B6B63] mb-6">
                  {role === 'resident'
                    ? 'Get instant student discounts, meal vouchers, and zero-brokerage PG stays.'
                    : 'List your PG property or mess service on Bhilai’s #1 student platform.'}
                </p>

                {errorMsg && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-rose-600">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#191C1A] mb-1 font-semibold">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Verma"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-xs text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#191C1A] mb-1 font-semibold">Mobile Number</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98271 00000"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-xs text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#191C1A] mb-1 font-semibold">College / Campus</label>
                      <select
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F0] border border-[#E5E1D6] text-xs text-[#191C1A] focus:outline-none font-semibold cursor-pointer"
                      >
                        <option value="BIT Durg">BIT Durg</option>
                        <option value="Rungta Group Bhilai">Rungta Group Bhilai</option>
                        <option value="CSIT Durg">CSIT Durg</option>
                        <option value="SSIPMT Raipur">SSIPMT Raipur</option>
                        <option value="IIT Bhilai">IIT Bhilai</option>
                        <option value="Other Campus">Other Institute</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#191C1A] mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul@student.ac.in"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-xs text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#191C1A] mb-1 font-semibold">Create Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F0] border border-[#E5E1D6] text-xs text-[#191C1A] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                    />
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 rounded text-[#225944] focus:ring-0 accent-[#225944]"
                        required
                      />
                      <span className="text-xs text-[#6B6B63]">
                        I agree to EaseHub's <a href="#" className="text-[#225944] underline">Terms of Service</a> & <a href="#" className="text-[#225944] underline">Privacy Policy</a>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-full bg-[#225944] hover:bg-[#184232] text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Complete Registration</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-[#6B6B63]">
                  Already registered? <Link to="/login" className="font-extrabold text-[#225944] hover:underline">Sign in here</Link>
                </div>
              </div>
            </div>

            {/* Right Banner (5 cols) */}
            <div className="lg:col-span-5 bg-[#EECA3A] text-[#171A18] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171A18]/10 text-[#171A18]">
                  <span className="material-symbols-outlined text-[16px]">celebration</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Welcome Gift Pack</span>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                  Unlock Exclusive Campus Perks
                </h2>

                <p className="text-xs text-[#171A18]/90 leading-relaxed font-medium">
                  Create your profile to claim ₹500 off your first PG deposit, 3 free tiffin meal trials, and 20% off doorstep laundry pickups.
                </p>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-amber-300">
                    <span className="material-symbols-outlined text-[#225944] text-[20px]">verified_user</span>
                    <span className="text-xs font-bold">100% Broker-Free Accommodations</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-amber-300">
                    <span className="material-symbols-outlined text-[#225944] text-[20px]">skillet</span>
                    <span className="text-xs font-bold">Hygiene Certified Tiffin Providers</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-amber-300">
                    <span className="material-symbols-outlined text-[#225944] text-[20px]">schedule</span>
                    <span className="text-xs font-bold">Instant 24/7 Campus Assistance</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6 text-[11px] text-[#171A18]/80 font-medium">
                © {new Date().getFullYear()} EaseHub Technologies. Trusted by 4,200+ Students.
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
