import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { paymentApi } from '../../services/paymentApi';

interface PaymentStep {
  status: 'idle' | 'pending' | 'verified' | 'rejected';
  utr: string;
  rejectionReason?: string;
}

export const CustomerPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [utrInput, setUtrInput] = useState('');
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentStep>({
    status: 'idle',
    utr: '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotName(e.target.files[0].name);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput || utrInput.length < 6) {
      alert('Please enter a valid 12-digit UPI UTR / Transaction ID.');
      return;
    }

    try {
      await paymentApi.submitProof({
        amount: 6500,
        utr: utrInput,
        serviceName: 'PG Rent / EaseHub Escrow Booking',
        screenshotUrl: screenshotName || '',
      });
      setPaymentState({
        status: 'pending',
        utr: utrInput,
      });
    } catch (err) {
      console.error('Failed to submit payment proof:', err);
      setPaymentState({
        status: 'pending',
        utr: utrInput,
      });
    }
  };

  const handleSimulateAdminApprove = () => {
    setPaymentState((prev) => ({ ...prev, status: 'verified' }));
  };

  const handleSimulateAdminReject = () => {
    setPaymentState((prev) => ({
      ...prev,
      status: 'rejected',
      rejectionReason: 'UTR / Transaction ID does not match escrow receipt. Please verify and re-submit.',
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#225944]">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <span>/</span>
          <span>Payment Gateway &amp; Escrow</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#171A18]">EaseHub Secure UPI Payment</h1>
        <p className="text-xs text-[#6B6B63]">
          Pay via any UPI app (GPay, PhonePe, Paytm, BHIM) and upload UTR receipt for instant escrow lock.
        </p>
      </div>

      {/* Payment Status Banner */}
      {paymentState.status === 'pending' && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-extrabold text-sm">
              <span className="material-symbols-outlined text-amber-600 text-[22px] animate-spin">sync</span>
              <span>Payment Verification Pending</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              Under Review
            </span>
          </div>
          <p className="text-xs text-amber-800">
            Your transaction ID <strong className="font-mono text-[#171A18]">{paymentState.utr}</strong> has been submitted. EaseHub admin is verifying the deposit.
          </p>

          {/* Dev Simulation Buttons */}
          <div className="pt-2 border-t border-amber-500/20 flex items-center gap-3 text-xs">
            <span className="font-bold text-[#6B6B63]">Simulate Admin Outcome:</span>
            <button
              onClick={handleSimulateAdminApprove}
              className="px-3 py-1 rounded-xl bg-[#225944] text-white font-bold text-[11px]"
            >
              Approve Payment
            </button>
            <button
              onClick={handleSimulateAdminReject}
              className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-[11px]"
            >
              Reject Payment
            </button>
          </div>
        </div>
      )}

      {paymentState.status === 'verified' && (
        <div className="p-5 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-900 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-extrabold text-sm">
              <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
              <span>Payment Verified &amp; Escrow Locked!</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              Verified
            </span>
          </div>
          <p className="text-xs text-emerald-800">
            Payment for transaction <strong className="font-mono">{paymentState.utr}</strong> is verified. Funds are held in 100% Escrow Guard until completion.
          </p>
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 rounded-xl bg-[#225944] text-white font-bold text-xs"
          >
            Go to My Bookings
          </button>
        </div>
      )}

      {paymentState.status === 'rejected' && (
        <div className="p-5 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-900 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-extrabold text-sm">
              <span className="material-symbols-outlined text-rose-600 text-[22px]">cancel</span>
              <span>Payment Rejected</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
              Rejected
            </span>
          </div>
          <p className="text-xs text-rose-800">
            <strong>Reason:</strong> {paymentState.rejectionReason}
          </p>
          <button
            onClick={() => setPaymentState({ status: 'idle', utr: '' })}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
          >
            Re-submit Payment Details
          </button>
        </div>
      )}

      {/* Main Payment Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: QR Code & UPI Details (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="w-full pb-3 border-b border-[#E5E1D6] text-left">
            <span className="text-[10px] font-extrabold text-[#225944] uppercase tracking-wider">STEP 1: SCAN &amp; PAY</span>
            <h2 className="text-sm font-bold text-[#171A18]">EaseHub Official QR Code</h2>
          </div>

          {/* QR Code Container */}
          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] flex flex-col items-center space-y-2">
            <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-xs border border-[#E5E1D6] flex items-center justify-center">
              {/* Simulated QR Code Graphic */}
              <div className="w-full h-full bg-[#171A18] rounded-lg p-2 flex flex-col justify-between items-center text-white">
                <div className="w-full flex justify-between">
                  <div className="w-10 h-10 border-4 border-white bg-black"></div>
                  <div className="w-10 h-10 border-4 border-white bg-black"></div>
                </div>
                <div className="text-center font-bold text-[10px] text-[#EECA3A]">EASEHUB UPI QR</div>
                <div className="w-full flex justify-between">
                  <div className="w-10 h-10 border-4 border-white bg-black"></div>
                  <div className="w-6 h-6 bg-[#EECA3A]"></div>
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#171A18]">easehub@sbi</span>
          </div>

          <div className="w-full space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#F7F5EF] text-[#6B6B63] space-y-1 text-left">
              <div className="font-bold text-[#171A18]">Accepted UPI Apps:</div>
              <div className="text-[11px] font-medium text-[#225944]">GPay • PhonePe • Paytm • BHIM • Cred</div>
            </div>
          </div>
        </div>

        {/* Right Column: UTR & Screenshot Upload Form (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E5E1D6]">
            <span className="text-[10px] font-extrabold text-[#225944] uppercase tracking-wider">STEP 2: SUBMIT RECEIPT</span>
            <h2 className="text-sm font-bold text-[#171A18]">Enter UTR &amp; Payment Screenshot</h2>
          </div>

          <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#171A18] mb-1">
                UPI 12-Digit UTR / Ref Number <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={12}
                placeholder="e.g. 408291048291"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] text-xs font-mono font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171A18] mb-1">
                Upload Payment Screenshot (Optional)
              </label>
              <div className="p-4 rounded-xl bg-[#F7F5EF] border-2 border-dashed border-[#E5E1D6] text-center space-y-2">
                <span className="material-symbols-outlined text-[28px] text-[#6B6B63]">cloud_upload</span>
                <p className="text-xs text-[#6B6B63]">
                  {screenshotName ? <strong className="text-[#225944]">{screenshotName}</strong> : 'Click to select image file'}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label
                  htmlFor="screenshot-upload"
                  className="inline-block px-4 py-1.5 rounded-xl bg-white border border-[#E5E1D6] font-bold text-xs cursor-pointer hover:bg-[#E5E1D6]"
                >
                  Choose File
                </label>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F5EF] text-[11px] text-[#6B6B63] space-y-1">
              <span className="font-bold text-[#171A18]">100% Escrow Protection:</span>
              <p>Your payment is safely held until the service is delivered and verified by your 4-digit OTP.</p>
            </div>

            <button
              type="submit"
              disabled={paymentState.status === 'pending' || paymentState.status === 'verified'}
              className="w-full py-3 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Submit Payment for Verification</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentPage;
