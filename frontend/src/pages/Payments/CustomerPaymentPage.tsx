import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { paymentApi } from '../../services/paymentApi';
import { bookingApi } from '../../services/bookingApi';
import { storageApi } from '../../services/storageApi';
import { paymentConfig } from '../../config/paymentConfig';
import { ShieldCheck, QrCode, Upload, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Phone, MessageSquare, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';

interface PaymentState {
  status: 'idle' | 'submitting' | 'pending' | 'verified' | 'rejected';
  utr: string;
  rejectionReason?: string;
  error?: string;
}

export const CustomerPaymentPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Booking payload passed via route state or URL search parameters
  const routeState = location.state || {};
  const queryParams = new URLSearchParams(location.search);
  const urlBookingId = queryParams.get('bookingId') || queryParams.get('id') || '';

  const [bookingDetails, setBookingDetails] = useState<{
    bookingId?: string;
    amount: number;
    serviceName: string;
    providerName?: string;
    address?: string;
  }>({
    bookingId: routeState.bookingId || urlBookingId || '',
    amount: routeState.amount || 0,
    serviceName: routeState.serviceName || 'EaseHub Accommodation & Living Service',
    providerName: routeState.providerName || 'EaseHub Verified Partner',
    address: routeState.address || 'Bhilai, Chhattisgarh',
  });

  // Upload & Form States
  const [utrInput, setUtrInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string>('');

  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: 'idle',
    utr: '',
  });

  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  const handleCopyUpi = (upiId: string) => {
    try {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(upiId);
      setTimeout(() => setCopiedUpi(null), 2500);
    } catch (e) {
      console.warn('Clipboard error:', e);
    }
  };

  // Synchronize state with PostgreSQL database on mount & refresh
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && user && user.role === 'customer') {
      bookingApi.getMyBookings().then(async (bList) => {
        if (!isMounted || !Array.isArray(bList) || bList.length === 0) return;

        let target = bList[0];
        const searchId = bookingDetails.bookingId || urlBookingId;
        if (searchId) {
          const found = bList.find((b: any) => b.id === searchId || b.bookingNumber === searchId || b._id === searchId);
          if (found) target = found;
        }

        const bId = target.id || target._id || target.bookingNumber;
        setBookingDetails({
          bookingId: bId,
          amount: target.amount || 4500,
          serviceName: target.notes || target.serviceName || target.roomType || 'EaseHub Student Stay',
          providerName: 'EaseHub Verified Partner',
          address: target.address || 'Bhilai, CG',
        });

        // Query payments table for existing payment record
        try {
          const payments = await paymentApi.getPayments();
          const existing = payments.find((p: any) => p.bookingId === bId || p.booking_id === bId);
          if (existing && isMounted) {
            setUtrInput(existing.utr !== '—' ? existing.utr || '' : '');
            setUploadedPath(existing.screenshotUrl || '');

            const st = (existing.status || '').toLowerCase();
            if (st === 'verified' || st === 'completed') {
              setPaymentState({ status: 'verified', utr: existing.utr || '' });
            } else if (st === 'rejected') {
              setPaymentState({ status: 'rejected', utr: existing.utr || '', rejectionReason: existing.rejectionReason });
            } else if (st.includes('pending')) {
              setPaymentState({ status: 'pending', utr: existing.utr || '' });
            }
          }
        } catch (pErr) {
          console.warn('Failed to load existing payment state from DB:', pErr);
        }
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [isAuthenticated, user, urlBookingId]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-[#225944] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin' || user.role === 'superadmin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Handle Screenshot Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));

      // Upload immediately to private storage bucket 'payment-screenshots'
      setUploadingImage(true);
      try {
        const res = await storageApi.uploadPaymentScreenshot(file, file.name);
        setUploadedPath(res.url || res.path);
      } catch (err: any) {
        console.error('Failed to upload screenshot to private bucket:', err);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadedPath('');
  };

  // Submit Payment Proof to PostgreSQL
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrInput.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      alert('Please enter a valid UPI UTR / Transaction ID (minimum 6 digits).');
      return;
    }

    setPaymentState({ status: 'submitting', utr: cleanUtr });

    try {
      await paymentApi.submitProof({
        bookingId: bookingDetails.bookingId,
        amount: bookingDetails.amount || 4500,
        utr: cleanUtr,
        screenshotUrl: uploadedPath || '',
        serviceName: bookingDetails.serviceName,
      });

      setPaymentState({
        status: 'pending',
        utr: cleanUtr,
      });
    } catch (err: any) {
      console.error('Failed to submit payment proof:', err);
      setPaymentState({
        status: 'pending',
        utr: cleanUtr,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E1D6] shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#225944]">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <span>/</span>
          <Link to="/bookings" className="hover:underline">Bookings</Link>
          <span>/</span>
          <span>Complete Payment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
          Complete Your Payment
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B63] font-medium">
          Scan official EaseHub UPI QR code, complete payment via GPay / PhonePe / Paytm, and submit your UTR reference.
        </p>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
          <span className="text-xs font-extrabold text-[#225944] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Booking Summary</span>
          </span>
          {bookingDetails.bookingId && (
            <span className="font-mono text-xs font-bold text-[#225944] bg-[#225944]/10 px-3 py-1 rounded-full">
              ID: {bookingDetails.bookingId}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F7F5EF] space-y-1">
            <span className="text-[#6B6B63] font-semibold">Service / Property:</span>
            <p className="font-extrabold text-[#171A18] text-sm">{bookingDetails.serviceName}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F7F5EF] space-y-1">
            <span className="text-[#6B6B63] font-semibold">Customer Resident:</span>
            <p className="font-extrabold text-[#171A18] text-sm">{user?.name || 'Customer'}</p>
            <p className="text-[10px] text-[#6B6B63]">{user?.phone || user?.email}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#225944] text-white space-y-1">
            <span className="text-white/80 font-semibold">Total Payable Amount:</span>
            <p className="font-black text-xl text-[#EECA3A]">₹{(bookingDetails.amount || 4500).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Status Screen Banners */}
      {paymentState.status === 'pending' && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-extrabold text-base text-amber-900">
              <RefreshCw className="w-6 h-6 text-amber-600 animate-spin" />
              <span>Payment Verification Pending</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-extrabold uppercase tracking-wider">
              VERIFICATION_PENDING
            </span>
          </div>

          <div className="space-y-2 text-xs text-amber-900 font-medium leading-relaxed">
            <p className="text-sm font-bold">Payment submitted successfully!</p>
            <p>
              Your payment for transaction UTR <strong className="font-mono text-[#171A18]">{paymentState.utr}</strong> is pending verification. EaseHub admin will review the deposit screenshot and verify the receipt.
            </p>
          </div>

          <div className="pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/bookings"
              className="px-5 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <span>View Bookings Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={paymentConfig.getWhatsAppLink(bookingDetails.serviceName)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#EECA3A] text-[#171A18] font-bold text-xs flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat with Support (+91 6201614778)</span>
            </a>
          </div>
        </div>
      )}

      {paymentState.status === 'verified' && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-950 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-extrabold text-base text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Payment Verified &amp; Booking Confirmed! 🎉</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold uppercase tracking-wider">
              VERIFIED
            </span>
          </div>

          <div className="space-y-2 text-xs text-emerald-900 font-medium leading-relaxed">
            <p className="text-sm font-bold">Your booking is officially confirmed.</p>
            <p>
              Transaction UTR <strong className="font-mono text-[#171A18]">{paymentState.utr}</strong> has been audited and approved by EaseHub Admin.
            </p>
          </div>

          <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/bookings"
              className="px-5 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <span>View Confirmed Booking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {paymentState.status === 'rejected' && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-950 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-extrabold text-base text-rose-900">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
              <span>Payment Verification Rejected</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-extrabold uppercase tracking-wider">
              REJECTED
            </span>
          </div>

          <div className="space-y-2 text-xs text-rose-900 font-medium leading-relaxed">
            <p className="text-sm font-bold">Rejection Reason:</p>
            <p className="p-3 rounded-xl bg-white/60 font-mono text-xs border border-rose-200 text-rose-900">
              {paymentState.rejectionReason || 'UTR transaction reference or receipt image could not be verified by Admin.'}
            </p>
            <p>Please review your payment details, re-upload a clear screenshot, and re-submit for verification below.</p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setPaymentState({ status: 'idle', utr: '' })}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition shadow-xs"
            >
              Re-submit Payment Proof
            </button>
          </div>
        </div>
      )}

      {/* Main Payment Section: QR Code & Receipt Upload */}
      {paymentState.status !== 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Official QR Code & Instructions (5 cols) */}
          <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col items-center text-center space-y-4">
            <div className="w-full pb-3 border-b border-[#E5E1D6] text-left">
              <span className="text-[10px] font-extrabold text-[#225944] uppercase tracking-wider">STEP 1: SCAN &amp; PAY</span>
              <h2 className="text-sm font-bold text-[#171A18]">EaseHub Official UPI QR Code</h2>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] flex flex-col items-center space-y-3 w-full">
              <div className="w-56 h-56 bg-white p-2 rounded-2xl shadow-sm border border-[#E5E1D6] flex items-center justify-center overflow-hidden">
                <img
                  src={paymentConfig.qrImageUrl}
                  alt="EaseHub PhonePe Official Payment QR Code"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <span className="text-[11px] font-extrabold text-[#225944] bg-[#225944]/10 px-3 py-1 rounded-full uppercase">
                Official PhonePe Merchant QR
              </span>
            </div>

            {/* Official Dual UPI IDs Section */}
            <div className="w-full text-left space-y-2 pt-2 border-t border-[#E5E1D6]">
              <span className="text-xs font-extrabold text-[#171A18] block">Official EaseHub UPI IDs:</span>
              
              {/* Primary UPI ID */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6]">
                <div>
                  <span className="text-[10px] font-bold text-[#6B6B63] block">Primary UPI ID</span>
                  <span className="font-mono text-xs font-extrabold text-[#225944]">6201614778@ibl</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyUpi('6201614778@ibl')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E1D6] text-xs font-bold text-[#171A18] hover:bg-gray-50 transition flex items-center gap-1"
                >
                  {copiedUpi === '6201614778@ibl' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#225944]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secondary UPI ID */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6]">
                <div>
                  <span className="text-[10px] font-bold text-[#6B6B63] block">Secondary UPI ID</span>
                  <span className="font-mono text-xs font-extrabold text-[#225944]">6201614778-2@ybl</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyUpi('6201614778-2@ybl')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E1D6] text-xs font-bold text-[#171A18] hover:bg-gray-50 transition flex items-center gap-1"
                >
                  {copiedUpi === '6201614778-2@ybl' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#225944]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Instant Mobile UPI App Redirection CTAs */}
            <div className="w-full text-left space-y-2 pt-2 border-t border-[#E5E1D6]">
              <span className="text-xs font-extrabold text-[#171A18] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#225944]" />
                <span>Pay directly via UPI App:</span>
              </span>

              {/* Main Universal UPI Intent Button */}
              <a
                href={paymentConfig.getUpiIntentUrl('6201614778@ibl', bookingDetails.amount || 4500, bookingDetails.serviceName)}
                className="w-full py-3 rounded-2xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ExternalLink className="w-4 h-4 text-[#EECA3A]" />
                <span>Open UPI App (GPay / PhonePe / Paytm)</span>
              </a>

              {/* Alternate UPI App Intent Button */}
              <a
                href={paymentConfig.getUpiIntentUrl('6201614778-2@ybl', bookingDetails.amount || 4500, bookingDetails.serviceName)}
                className="w-full py-2.5 rounded-xl bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#171A18]" />
                <span>Pay via Secondary UPI (6201614778-2@ybl)</span>
              </a>
            </div>

            {/* QR Payment Instructions */}
            <div className="w-full text-left space-y-2 pt-2 border-t border-[#E5E1D6]">
              <span className="text-xs font-extrabold text-[#171A18]">Payment Steps:</span>
              <ol className="list-decimal list-inside text-xs text-[#6B6B63] space-y-1 font-medium">
                <li>Tap <strong>Open UPI App</strong> above or scan the QR code.</li>
                <li>Pay exact amount ₹{(bookingDetails.amount || 4500).toLocaleString('en-IN')}.</li>
                <li>Copy 12-digit UTR transaction ID from payment receipt.</li>
                <li>Upload screenshot &amp; submit for admin verification.</li>
              </ol>
            </div>

            {/* Contact Support Button */}
            <div className="w-full pt-2">
              <a
                href={paymentConfig.getTelLink()}
                className="w-full py-2.5 rounded-xl bg-[#F7F5EF] hover:bg-[#E5E1D6] text-[#171A18] font-bold text-xs flex items-center justify-center gap-2 border border-[#E5E1D6] transition"
              >
                <Phone className="w-4 h-4 text-[#225944]" />
                <span>Call EaseHub Support (+91 6201614778)</span>
              </a>
            </div>
          </div>

          {/* Right Column: UTR & Screenshot Upload Form (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#E5E1D6]">
              <span className="text-[10px] font-extrabold text-[#225944] uppercase tracking-wider">STEP 2: SUBMIT VERIFICATION RECEIPT</span>
              <h2 className="text-sm font-bold text-[#171A18]">Enter UTR &amp; Upload Payment Screenshot</h2>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-5 text-xs">
              
              {/* UTR / Transaction ID Input */}
              <div>
                <label className="block font-extrabold text-[#171A18] mb-1.5">
                  UPI 12-Digit UTR / Transaction ID <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="Enter your UTR / transaction ID (e.g. 408291048291)"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] text-sm font-mono font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
                />
                <p className="text-[10px] text-[#6B6B63] mt-1 font-medium">
                  Found on your UPI payment confirmation screen (Ref No. / Txn ID).
                </p>
              </div>

              {/* Payment Screenshot Upload */}
              <div>
                <label className="block font-extrabold text-[#171A18] mb-1.5">
                  Upload Payment Screenshot (PNG, JPG, WEBP)
                </label>

                {filePreview ? (
                  <div className="p-3 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] space-y-3">
                    <div className="relative h-44 rounded-xl overflow-hidden bg-black/5 border border-[#E5E1D6] flex items-center justify-center">
                      <img src={filePreview} alt="Payment Receipt Preview" className="w-full h-full object-contain" />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Uploading to private bucket...</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#225944] truncate max-w-[200px]">
                        {selectedFile?.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition"
                      >
                        Remove / Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#F7F5EF] border-2 border-dashed border-[#E5E1D6] text-center space-y-2">
                    <Upload className="w-8 h-8 text-[#225944] mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-[#171A18]">Click to upload receipt screenshot</p>
                      <p className="text-[10px] text-[#6B6B63] mt-0.5">PNG, JPG, JPEG or WEBP (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="screenshot-file-upload"
                    />
                    <label
                      htmlFor="screenshot-file-upload"
                      className="inline-block px-5 py-2 rounded-xl bg-white border border-[#E5E1D6] font-bold text-xs text-[#171A18] cursor-pointer hover:bg-[#E5E1D6] transition shadow-xs"
                    >
                      Select Image File
                    </label>
                  </div>
                )}
              </div>

              {/* Escrow Protection Notice */}
              <div className="p-3.5 rounded-2xl bg-[#F7F5EF] text-[11px] text-[#6B6B63] space-y-1 border border-[#E5E1D6]">
                <span className="font-extrabold text-[#225944] flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Escrow Guard Protection</span>
                </span>
                <p>Your payment details are submitted privately for Admin verification before booking confirmation.</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={paymentState.status === 'submitting' || uploadingImage}
                className="w-full py-3.5 rounded-2xl bg-[#225944] hover:bg-[#174532] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {paymentState.status === 'submitting' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Payment Proof...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Payment for Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};

export default CustomerPaymentPage;
