import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { StatCard } from '../../components/admin/StatCard';
import { paymentApi } from '../../services/paymentApi';

interface PaymentItem {
  id: string;
  txnId: string;
  customerName: string;
  amount: string;
  method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  payoutStatus: 'settled' | 'pending';
  timestamp: string;
}

const defaultPayments: PaymentItem[] = [];

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [stats, setStats] = useState<any>({
    totalEscrowVolume: 0,
    pendingCount: 0,
    pendingAmount: 0,
    verifiedCount: 0,
  });

  const fetchPayments = async () => {
    try {
      const list = await paymentApi.getPayments();
      const statsData = await paymentApi.getStats();

      if (statsData) setStats(statsData);

      if (Array.isArray(list)) {
        const mapped: PaymentItem[] = list.map((p: any) => ({
          id: p.paymentNumber || p._id || p.id,
          txnId: p.utr || (p.id ? `TXN_${String(p.id).slice(0, 8)}` : '—'),
          customerName: p.userName || p.user?.fullName || p.user?.name || '—',
          amount: `₹${(p.amount || 0).toLocaleString('en-IN')}`,
          method: p.method === 'qr' ? 'UPI QR Escrow' : (p.method || 'Online Gateway'),
          status: p.status === 'verified' ? 'completed' : p.status === 'rejected' ? 'failed' : 'pending',
          payoutStatus: p.status === 'verified' ? 'settled' : 'pending',
          timestamp: p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN') : '—',
        }));
        setPayments(mapped);
      }
    } catch (err) {
      console.error('Failed to load admin payments:', err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns: Column<PaymentItem>[] = [
    {
      key: 'id',
      header: 'Payment ID',
      render: (item) => <span className="font-mono font-bold text-[#225944]">{item.id}</span>,
    },
    {
      key: 'txnId',
      header: 'Gateway Txn Ref',
      render: (item) => <span className="font-mono text-[10px] text-[#6B6B63]">{item.txnId}</span>,
    },
    { key: 'customerName', header: 'Customer' },
    {
      key: 'amount',
      header: 'Amount Paid',
      render: (item) => <span className="font-extrabold text-[#171A18]">{item.amount}</span>,
    },
    { key: 'method', header: 'Payment Method' },
    {
      key: 'status',
      header: 'Payment Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'payoutStatus',
      header: 'Vendor Payout',
      render: (item) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            item.payoutStatus === 'settled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {item.payoutStatus.toUpperCase()}
        </span>
      ),
    },
    { key: 'timestamp', header: 'Date & Time' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Platform Volume" value={`₹${(stats.totalEscrowVolume || 0).toLocaleString('en-IN')}`} icon="account_balance_wallet" color="bg-[#225944]" />
        <StatCard title="Verified Gateways" value={`${stats.verifiedCount || 0} Txns`} icon="verified" color="bg-emerald-600" />
        <StatCard title="Vendor Payouts Pending" value={`₹${(stats.pendingAmount || 0).toLocaleString('en-IN')}`} icon="payments" color="bg-amber-600" />
      </div>

      <DataTable
        title="Payment Transactions & Gateway Audits"
        subtitle="Detailed log of all customer payments, refunds, and vendor settlement payouts"
        columns={columns}
        data={payments}
        searchPlaceholder="Search customer, payment ID, or txn ref..."
      />
    </div>
  );
};

export default Payments;
