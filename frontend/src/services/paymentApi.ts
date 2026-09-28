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
    const { data: userRes } = await insforge.auth.getCurrentUser();
    if (!userRes?.user) throw new Error('Authentication required');

    // 1. Get user profile from 'users' table
    let { data: profiles } = await insforge.database
      .from('users')
      .select('id')
      .eq('auth_user_id', userRes.user.id);

    let profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;

    if (!profile) {
      const { data: emailProfiles } = await insforge.database
        .from('users')
        .select('id')
        .eq('email', userRes.user.email || '');

      if (Array.isArray(emailProfiles) && emailProfiles.length > 0) {
        profile = emailProfiles[0];
      } else {
        const authUser: any = userRes.user;
        const { data: insertedUser } = await insforge.database
          .from('users')
          .insert([{
            auth_user_id: authUser.id,
            name: authUser.name || authUser.profile?.name || 'EaseHub Customer',
            email: authUser.email || '',
            phone: authUser.phone || authUser.profile?.phone || '6201614778',
            role: 'customer'
          }])
          .select('id');
        if (insertedUser && insertedUser.length > 0) {
          profile = insertedUser[0];
        }
      }
    }

    const userId = profile?.id;
    if (!userId) throw new Error('User profile resolution failed');

    // 2. Resolve target booking UUID in 'bookings' table
    let targetBookingId: string | null = null;
    const rawBookingId = (data.bookingId || '').trim();

    if (rawBookingId) {
      const { data: bFound } = await insforge.database
        .from('bookings')
        .select('id')
        .or(`id.eq.${rawBookingId},booking_number.eq.${rawBookingId}`);

      if (Array.isArray(bFound) && bFound.length > 0) {
        targetBookingId = bFound[0].id;
      }
    }

    if (!targetBookingId) {
      const { data: userBookings } = await insforge.database
        .from('bookings')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (Array.isArray(userBookings) && userBookings.length > 0) {
        targetBookingId = userBookings[0].id;
      }
    }

    if (!targetBookingId) {
      const bkNum = 'BK' + Date.now().toString().slice(-6);
      const { data: newBk } = await insforge.database
        .from('bookings')
        .insert([{
          booking_number: bkNum,
          user_id: userId,
          booking_type: 'PG',
          status: 'PENDING',
          scheduled_date: new Date().toISOString(),
          address: 'Bhilai, Chhattisgarh',
          notes: data.serviceName || 'EaseHub Student Stay & Services',
          amount: data.amount || 4500
        }])
        .select('id');

      if (Array.isArray(newBk) && newBk.length > 0) {
        targetBookingId = newBk[0].id;
      } else {
        throw new Error('Failed to generate booking record for payment.');
      }
    }

    // 3. Upsert / Insert payment record in 'payments' PostgreSQL table
    const { data: existingPayment } = await insforge.database
      .from('payments')
      .select('id')
      .eq('booking_id', targetBookingId)
      .limit(1);

    let paymentResult: any;
    if (Array.isArray(existingPayment) && existingPayment.length > 0) {
      const { data: updated, error: updateErr } = await insforge.database
        .from('payments')
        .update({
          amount: data.amount,
          payment_method: 'qr',
          status: 'VERIFICATION_PENDING',
          utr: data.utr,
          screenshot_url: data.screenshotUrl || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPayment[0].id)
        .select('*');

      if (updateErr) throw updateErr;
      paymentResult = updated?.[0];
    } else {
      const { data: inserted, error: insertErr } = await insforge.database
        .from('payments')
        .insert([{
          booking_id: targetBookingId,
          user_id: userId,
          amount: data.amount,
          payment_method: 'qr',
          status: 'VERIFICATION_PENDING',
          utr: data.utr,
          screenshot_url: data.screenshotUrl || ''
        }])
        .select('*');

      if (insertErr) throw insertErr;
      paymentResult = inserted?.[0];
    }

    // Invoke edge function asynchronously if deployed
    insforge.functions.invoke('submit-payment', {
      body: {
        bookingId: targetBookingId,
        userId,
        amount: data.amount,
        paymentMethod: 'qr',
        utr: data.utr,
        screenshotUrl: data.screenshotUrl || ''
      }
    }).catch(() => {});

    return paymentResult;
  },

  verify: async (id: string) => {
    const { data: userRes } = await insforge.auth.getCurrentUser();
    const adminUserId = userRes?.user?.id || null;

    const { data: updatedPayment, error: paymentErr } = await insforge.database
      .from('payments')
      .update({
        status: 'VERIFIED',
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*');

    if (paymentErr) throw paymentErr;

    const paymentRecord = updatedPayment?.[0];
    if (paymentRecord?.booking_id) {
      await insforge.database
        .from('bookings')
        .update({
          status: 'CONFIRMED',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.booking_id);
    }

    if (paymentRecord?.user_id) {
      try {
        await insforge.database
          .from('notifications')
          .insert([{
            user_id: paymentRecord.user_id,
            title: 'Payment Verified & Booking Confirmed! 🎉',
            message: `Your payment of ₹${paymentRecord.amount} (UTR: ${paymentRecord.utr}) has been verified. Your EaseHub booking is now CONFIRMED!`,
            type: 'payment_verified'
          }]);
      } catch (err) {
        console.warn('Failed to send verification notification:', err);
      }
    }

    insforge.functions.invoke('admin-payment-action', {
      body: { paymentId: id, adminUserId, action: 'VERIFIED' }
    }).catch(() => {});

    return { success: true, payment: paymentRecord };
  },

  reject: async (id: string, reason: string) => {
    const { data: userRes } = await insforge.auth.getCurrentUser();
    const adminUserId = userRes?.user?.id || null;

    const { data: updatedPayment, error: paymentErr } = await insforge.database
      .from('payments')
      .update({
        status: 'REJECTED',
        rejection_reason: reason,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*');

    if (paymentErr) throw paymentErr;

    const paymentRecord = updatedPayment?.[0];
    if (paymentRecord?.booking_id) {
      await insforge.database
        .from('bookings')
        .update({
          status: 'REJECTED',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.booking_id);
    }

    if (paymentRecord?.user_id) {
      try {
        await insforge.database
          .from('notifications')
          .insert([{
            user_id: paymentRecord.user_id,
            title: 'Payment Verification Rejected',
            message: `Your payment submission (UTR: ${paymentRecord.utr}) was rejected: ${reason}. Please re-submit with valid payment proof.`,
            type: 'payment_rejected'
          }]);
      } catch (err) {
        console.warn('Failed to send rejection notification:', err);
      }
    }

    insforge.functions.invoke('admin-payment-action', {
      body: { paymentId: id, adminUserId, action: 'REJECTED', rejectionReason: reason }
    }).catch(() => {});

    return { success: true, payment: paymentRecord };
  },
};

