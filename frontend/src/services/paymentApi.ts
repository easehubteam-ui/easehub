import { api } from './api';

export interface PaymentRecord {
  _id: string;
  paymentNumber: string;
  booking: any;
  user: any;
  userName?: string;
  serviceName?: string;
  amount: number;
  method: 'qr' | 'online';
  status: 'pending' | 'verification_pending' | 'verified' | 'rejected' | 'refunded';
  utr?: string;
  screenshotUrl?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export const paymentApi = {
  getPayments: async () => {
    const res = await api.get('/payments');
    return res.data?.data?.payments || [];
  },
  getStats: async () => {
    const res = await api.get('/payments/stats');
    return res.data?.data || {};
  },
  submitProof: async (data: { bookingId?: string; amount: number; utr: string; screenshotUrl?: string; serviceName?: string }) => {
    const res = await api.post('/payments/submit', data);
    return res.data?.data?.payment;
  },
  verify: async (id: string) => {
    const res = await api.put(`/payments/${id}/verify`);
    return res.data?.data?.payment;
  },
  reject: async (id: string, reason: string) => {
    const res = await api.put(`/payments/${id}/reject`, { reason });
    return res.data?.data?.payment;
  },
};
