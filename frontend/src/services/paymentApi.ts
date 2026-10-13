import { insforge } from './insforge';

export interface PaymentRecord {
  id?: string;
  _id?: string;
  paymentNumber?: string;
  bookingId?: string;
  userId?: string;
  booking?: any;
  user?: any;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
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
  getMyPaymentForBooking: async (bookingId: string): Promise<PaymentRecord | null> => {
    if (!bookingId) return null;

    const { data: userRes } = await insforge.auth.getCurrentUser();
    if (!userRes?.user) throw new Error('Authentication required');

    const { data: profiles } = await insforge.database
      .from('users')
      .select('id')
      .eq('auth_user_id', userRes.user.id)
      .limit(1);
    const profile = Array.isArray(profiles) ? profiles[0] : null;
    if (!profile?.id) return null;

    const { data, error } = await insforge.database
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    const payment = Array.isArray(data) ? data[0] : null;
    if (!payment) return null;

    return {
      id: payment.id,
      _id: payment.id,
      paymentNumber: `PAY-${payment.id?.slice(0, 8).toUpperCase() || 'REC'}`,
      bookingId: payment.booking_id,
      userId: payment.user_id,
      amount: Number(payment.amount) || 0,
      method: payment.payment_method || 'qr',
      status: payment.status || 'VERIFICATION_PENDING',
      utr: payment.utr || '',
      screenshotUrl: payment.screenshot_url || '',
      rejectionReason: payment.rejection_reason || '',
      verifiedAt: payment.verified_at || '',
      createdAt: payment.created_at || '',
    };
  },

  getPayments: async (): Promise<PaymentRecord[]> => {
    try {
      const { data: rawPayments, error } = await insforge.database
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !Array.isArray(rawPayments)) {
        console.warn('Error fetching raw payments from DB:', error);
        return [];
      }

      if (rawPayments.length === 0) return [];

      // Collect distinct user_ids and booking_ids
      const userIds = Array.from(new Set(rawPayments.map((p: any) => p.user_id).filter(Boolean)));
      const bookingIds = Array.from(new Set(rawPayments.map((p: any) => p.booking_id).filter(Boolean)));

      // Fetch matching users
      let userMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await insforge.database
          .from('users')
          .select('id, name, email, phone')
          .in('id', userIds);
        if (Array.isArray(usersData)) {
          usersData.forEach((u: any) => {
            userMap[u.id] = u;
          });
        }
      }

      // Fetch matching bookings
      let bookingMap: Record<string, any> = {};
      if (bookingIds.length > 0) {
        const { data: bookingsData } = await insforge.database
          .from('bookings')
          .select('id, booking_number, address, notes, amount')
          .in('id', bookingIds);
        if (Array.isArray(bookingsData)) {
          bookingsData.forEach((b: any) => {
            bookingMap[b.id] = b;
          });
        }
      }

      // Map into PaymentRecord[]
      return rawPayments.map((p: any) => {
        const userObj = userMap[p.user_id] || null;
        const bookingObj = bookingMap[p.booking_id] || null;

        return {
          id: p.id,
          _id: p.id,
          paymentNumber: 'PAY-' + (p.id ? p.id.slice(0, 8).toUpperCase() : 'REC'),
          bookingId: p.booking_id,
          userId: p.user_id,
          amount: Number(p.amount) || 0,
          method: p.payment_method || 'qr',
          status: p.status || 'VERIFICATION_PENDING',
          utr: p.utr || '—',
          screenshotUrl: p.screenshot_url || '',
          rejectionReason: p.rejection_reason || '',
          verifiedAt: p.verified_at || '',
          createdAt: p.created_at || '',
          userName: userObj?.name || 'EaseHub Resident',
          userEmail: userObj?.email || '',
          userPhone: userObj?.phone || '',
          user: userObj,
          serviceName: bookingObj?.notes || bookingObj?.address || 'EaseHub Accommodation & Living Service',
          booking: bookingObj,
        };
      });
    } catch (err) {
      console.error('Failed to get payments:', err);
      return [];
    }
  },

  getStats: async () => {
    try {
      const list = await paymentApi.getPayments();
      let totalEscrowVolume = 0;
      let pendingCount = 0;
      let pendingAmount = 0;
      let verifiedCount = 0;

      list.forEach((p: any) => {
        const st = (p.status || '').toUpperCase();
        const amt = Number(p.amount) || 0;
        if (st === 'VERIFIED' || st === 'COMPLETED') {
          verifiedCount++;
          totalEscrowVolume += amt;
        } else if (st === 'VERIFICATION_PENDING' || st === 'PENDING') {
          pendingCount++;
          pendingAmount += amt;
          totalEscrowVolume += amt;
        }
      });

      return {
        totalEscrowVolume,
        pendingCount,
        pendingAmount,
        verifiedCount
      };
    } catch (err) {
      return {
        totalEscrowVolume: 0,
        pendingCount: 0,
        pendingAmount: 0,
        verifiedCount: 0
      };
    }
  },

  submitProof: async (data: { bookingId?: string; amount: number; utr: string; screenshotUrl?: string; serviceName?: string }) => {
    const rawBookingId = (data.bookingId || '').trim();
    if (!rawBookingId) throw new Error('A valid booking is required before submitting payment proof.');
    const { data: result, error } = await insforge.functions.invoke('submit-payment', {
      body: {
        bookingId: rawBookingId,
        paymentMethod: 'qr',
        utr: data.utr.trim(),
        screenshotUrl: data.screenshotUrl || null,
      }
    });
    if (error || !result?.success) throw new Error(error?.message || result?.error || 'Payment submission failed.');
    return result.data;
  },

  verify: async (id: string) => {
    const { data, error } = await insforge.functions.invoke('admin-payment-action', {
      body: { paymentId: id, action: 'VERIFIED' }
    });
    if (error || !data?.success) throw new Error(error?.message || data?.error || 'Payment approval failed.');
    return data;
  },

  reject: async (id: string, reason: string) => {
    const cleanReason = reason.trim();
    if (!cleanReason) throw new Error('A rejection reason is required.');

    const { data, error } = await insforge.functions.invoke('admin-payment-action', {
      body: { paymentId: id, action: 'REJECTED', rejectionReason: cleanReason }
    });
    if (error || !data?.success) throw new Error(error?.message || data?.error || 'Payment rejection failed.');
    return data;
  },
};

