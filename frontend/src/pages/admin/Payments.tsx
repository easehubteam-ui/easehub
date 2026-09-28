import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { StatCard } from '../../components/admin/StatCard';
import { paymentApi, PaymentRecord } from '../../services/paymentApi';
import { storageApi, BUCKETS } from '../../services/storageApi';
import { CheckCircle2, XCircle, Eye, ShieldCheck, FileText, Lock, AlertTriangle } from 'lucide-react';

export const Payments: React.FC = () => {
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [signedScreenshotUrl, setSignedScreenshotUrl] = useState<string | null>(null);
  const [loadingScreenshot, setLoadingScreenshot] = useState<boolean>(false);
  
  // Action Modal States
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [stats, setStats] = useState<any>({
    totalEscrowVolume: 0,
    pendingCount: 0,
    pendingAmount: 0,
    verifiedCount: 0,
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const list = await paymentApi.getPayments();
      const statsData = await paymentApi.getStats();

      if (statsData) setStats(statsData);

      if (Array.isArray(list)) {
        setPaymentsList(list);
      } else {
        setPaymentsList([]);
      }
    } catch (err) {
      console.error('Failed to load admin payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // When a payment detail modal opens, generate a signed URL for private screenshot
  useEffect(() => {
    let isMounted = true;
    if (selectedPayment && selectedPayment.screenshotUrl) {
      setLoadingScreenshot(true);
      const raw = selectedPayment.screenshotUrl;
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        setSignedScreenshotUrl(raw);
        setLoadingScreenshot(false);
      } else {
        storageApi.getSignedUrl(BUCKETS.PAYMENT_SCREENSHOTS, raw, 3600)
          .then((url) => {
            if (isMounted) setSignedScreenshotUrl(url);
          })
          .catch(() => {
            if (isMounted) setSignedScreenshotUrl(null);
          })
          .finally(() => {
            if (isMounted) setLoadingScreenshot(false);
          });
      }
    } else {
      setSignedScreenshotUrl(null);
    }
    return () => { isMounted = false; };
  }, [selectedPayment]);

  const handleApprove = async (paymentId: string) => {
    setActionLoading(true);
    try {
      await paymentApi.verify(paymentId);
      setSelectedPayment(null);
      await fetchPayments();
    } catch (err) {
      console.error('Failed to approve payment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedPayment) return;
    setActionLoading(true);
    try {
      await paymentApi.reject(selectedPayment.id || selectedPayment._id || '', rejectionReason || 'UTR receipt verification failed.');
      setRejectionModalOpen(false);
      setSelectedPayment(null);
      setRejectionReason('');
      await fetchPayments();
    } catch (err) {
      console.error('Failed to reject payment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayments = paymentsList.filter((p) => {
    const st = (p.status || '').toLowerCase();
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return st === 'pending' || st === 'verification_pending';
    if (activeTab === 'verified') return st === 'verified' || st === 'completed';
    if (activeTab === 'rejected') return st === 'rejected';
    return true;
  });

  const columns: Column<PaymentRecord>[] = [
    {
      key: 'paymentNumber',
      header: 'Payment ID',
      render: (item) => (
        <span className="font-mono font-bold text-[#225944]">
          {item.paymentNumber || item._id || item.id}
        </span>
      ),
    },
    {
      key: 'utr',
      header: 'UPI UTR / Ref',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-[#171A18]">
          {item.utr || '—'}
        </span>
      ),
    },
    {
      key: 'userName',
      header: 'Customer',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#171A18] text-xs">{item.userName || item.user?.name || 'Customer'}</span>
          <span className="text-[10px] text-[#6B6B63]">{item.user?.phone || item.user?.email || ''}</span>
        </div>
      ),
    },
    {
      key: 'serviceName',
      header: 'Property / Service',
      render: (item) => (
        <span className="text-xs font-semibold text-[#171A18] truncate max-w-[180px] block">
          {item.serviceName || item.booking?.serviceName || 'EaseHub Booking'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      render: (item) => (
        <span className="font-extrabold text-[#225944]">
          ₹{(item.amount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (item) => {
        const st = (item.status || '').toLowerCase();
        let badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
        let label = 'VERIFICATION_PENDING';

        if (st === 'verified' || st === 'completed') {
          badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          label = 'VERIFIED';
        } else if (st === 'rejected') {
          badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300';
          label = 'REJECTED';
        }

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeStyle}`}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Submitted Date',
      render: (item) => (
        <span className="text-xs text-[#6B6B63]">
          {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item) => (
        <button
          onClick={() => setSelectedPayment(item)}
          className="px-3 py-1.5 rounded-xl bg-[#225944] text-white font-bold text-xs hover:bg-[#184232] transition flex items-center gap-1 shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Audit &amp; Verify</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Escrow Volume"
          value={`₹${(stats.totalEscrowVolume || 0).toLocaleString('en-IN')}`}
          icon="account_balance_wallet"
          color="bg-[#225944]"
        />
        <StatCard
          title="Pending Verifications"
          value={`${stats.pendingCount || paymentsList.filter(p => (p.status||'').toLowerCase().includes('pending')).length} Payments`}
          icon="pending_actions"
          color="bg-amber-600"
        />
        <StatCard
          title="Verified Transactions"
          value={`${stats.verifiedCount || paymentsList.filter(p => (p.status||'').toLowerCase() === 'verified').length} Payments`}
          icon="verified"
          color="bg-emerald-600"
        />
        <StatCard
          title="Pending Payout Amount"
          value={`₹${(stats.pendingAmount || 0).toLocaleString('en-IN')}`}
          icon="payments"
          color="bg-indigo-600"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-[#E5E1D6] shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Payments', count: paymentsList.length },
          { id: 'pending', label: 'Verification Pending', count: paymentsList.filter(p => (p.status||'').toLowerCase().includes('pending')).length },
          { id: 'verified', label: 'Verified Payments', count: paymentsList.filter(p => (p.status||'').toLowerCase() === 'verified' || (p.status||'').toLowerCase() === 'completed').length },
          { id: 'rejected', label: 'Rejected Payments', count: paymentsList.filter(p => (p.status||'').toLowerCase() === 'rejected').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#225944] text-white shadow-xs'
                : 'text-[#6B6B63] hover:bg-[#F7F5EF] hover:text-[#171A18]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#F7F5EF] text-[#171A18]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Data Table */}
      <DataTable
        title="Payment Screenshots & UTR Audit Log"
        subtitle="Audit customer UTR transaction reference numbers and private payment screenshots before approving escrow deposit"
        columns={columns}
        data={filteredPayments}
        searchPlaceholder="Search UTR, payment ID, customer name..."
      />

      {/* View Detail & Verification Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D6]">
              <div>
                <span className="font-mono text-xs font-bold text-[#225944]">
                  {selectedPayment.paymentNumber || selectedPayment.id}
                </span>
                <h3 className="font-extrabold text-lg text-[#171A18]">
                  Payment Audit &amp; Verification
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-8 h-8 rounded-full bg-[#F7F5EF] text-[#6B6B63] hover:text-[#171A18] flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F7F5EF] space-y-1">
                <span className="text-[#6B6B63] font-semibold">Customer Resident:</span>
                <p className="font-extrabold text-[#171A18] text-sm">{selectedPayment.userName || selectedPayment.user?.name || 'Customer'}</p>
                <p className="text-[10px] text-[#6B6B63]">{selectedPayment.user?.phone || selectedPayment.user?.email || ''}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F5EF] space-y-1">
                <span className="text-[#6B6B63] font-semibold">Property / Service:</span>
                <p className="font-extrabold text-[#171A18] text-sm">{selectedPayment.serviceName || 'EaseHub Booking'}</p>
                <p className="text-[10px] text-[#225944] font-bold">Payable: ₹{(selectedPayment.amount || 0).toLocaleString('en-IN')}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F5EF] space-y-1">
                <span className="text-[#6B6B63] font-semibold">UPI UTR / Transaction Ref:</span>
                <p className="font-mono font-black text-[#225944] text-base">{selectedPayment.utr || 'NOT_PROVIDED'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F5EF] space-y-1">
                <span className="text-[#6B6B63] font-semibold">Current Payment Status:</span>
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    {(selectedPayment.status || 'VERIFICATION_PENDING').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Screenshot (Private Bucket Authorized View) */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#171A18] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#225944]" />
                <span>Private Payment Screenshot (Bucket: payment-screenshots)</span>
              </span>

              <div className="h-64 w-full rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] flex items-center justify-center overflow-hidden p-2">
                {loadingScreenshot ? (
                  <div className="text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-[#225944] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-[#225944]">Generating signed URL for private bucket...</p>
                  </div>
                ) : signedScreenshotUrl ? (
                  <a href={signedScreenshotUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                    <img
                      src={signedScreenshotUrl}
                      alt="Payment Receipt"
                      className="w-full h-full object-contain rounded-xl hover:scale-102 transition-transform"
                    />
                  </a>
                ) : (
                  <div className="text-center text-xs text-[#6B6B63] p-4">
                    <FileText className="w-8 h-8 text-[#6B6B63] mx-auto mb-1" />
                    <p className="font-bold text-[#171A18]">No Screenshot Uploaded</p>
                    <p className="text-[10px]">Customer submitted UTR ref without screenshot attachment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Action Controls */}
            <div className="pt-3 border-t border-[#E5E1D6] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2.5 rounded-xl border border-[#E5E1D6] text-xs font-bold text-[#171A18] hover:bg-[#F7F5EF]"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setRejectionModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Payment</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleApprove(selectedPayment.id || selectedPayment._id || '')}
                  className="px-5 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#EECA3A]" />
                  <span>Approve &amp; Confirm Booking</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#171A18]">Reject Payment Submission?</h3>
              <p className="text-xs text-[#6B6B63] mt-1">
                Provide a reason for rejecting UTR <strong className="font-mono text-[#171A18]">{selectedPayment.utr}</strong>.
              </p>
            </div>

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. UTR / Transaction ID does not match escrow receipt. Please verify and re-submit."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#E5E1D6] text-xs font-semibold text-[#171A18] focus:outline-none"
            />

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#E5E1D6] text-xs font-bold text-[#171A18]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRejectConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Payments;
