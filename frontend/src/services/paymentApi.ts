import { insforge } from './insforge';
import { storageApi } from './storageApi';

export interface PaymentRecord {
  id?: string;
  _id?: string;
  paymentNumber?: string;
  booking?: any;
  user?: any;
  userName?: string;
  serviceName?: string;
  amount: number;
  method: 'qr' | 'online';
  status: 'pending' | 'verification_pending' | 'verified' | 'rejected' | 'refunded' | 'VERIFICATION_PENDING' | 'VERIFIED' | 'REJECTED';
  utr?: string;
  screenshotUrl?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export const paymentApi = {
  getPayments: async () => {
    try {
      const { data } = await insforge.database.from('payments').select('*');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },
  getStats: async () => {
    const res = await insforge.functions.invoke('admin-stats');
    return res.data || {};
  },
  submitProof: async (data: { bookingId?: string; amount: number; utr: string; screenshotUrl?: string; serviceName?: string }) => {
    const { data: userRes } = await insforge.auth.getCurrentUser();
    if (!userRes?.user) throw new Error('Authentication required');

    const { data: profiles } = await insforge.database
      .from('users')
      .select('id')
      .eq('auth_user_id', userRes.user.id);

    const profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;
    if (!profile) throw new Error('User profile not found');

    const payload = {
      bookingId: data.bookingId || '',
      userId: profile.id,
      amount: data.amount,
      paymentMethod: 'qr',
      utr: data.utr,
      screenshotUrl: data.screenshotUrl || ''
    };

    const res = await insforge.functions.invoke('submit-payment', { body: payload });
    return res.data;
  },
  verify: async (id: string) => {
    const { data: userRes } = await insforge.auth.getCurrentUser();
    const adminUserId = userRes?.user?.id || '';

    const res = await insforge.functions.invoke('admin-payment-action', {
      body: { paymentId: id, adminUserId, action: 'VERIFIED' }
    });
    return res.data;
  },
  reject: async (id: string, reason: string) => {
    const { data: userRes } = await insforge.auth.getCurrentUser();
    const adminUserId = userRes?.user?.id || '';

    const res = await insforge.functions.invoke('admin-payment-action', {
      body: { paymentId: id, adminUserId, action: 'REJECTED', rejectionReason: reason }
    });
    return res.data;
  },
};
