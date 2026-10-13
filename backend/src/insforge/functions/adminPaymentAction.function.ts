/**
 * InsForge Edge Function: admin-payment-action
 * Admin approves (VERIFIED) or rejects (REJECTED) payment verification proof.
 */

import { createClient } from '@insforge/sdk';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' }
});

export default async function (req: Request) {
  try {
    if (req.method !== 'POST') {
      return json({ success: false, error: 'Method not allowed' }, 405);
    }

    const payload: any = await req.json().catch(() => ({}));
    const { paymentId, action, rejectionReason } = payload;

    if (!paymentId || !['VERIFIED', 'REJECTED'].includes(action)) {
      return json({ success: false, error: 'paymentId and a valid action are required' }, 400);
    }

    const authorization = req.headers.get('authorization');
    const anonKey = process.env.INSFORGE_ANON_KEY || '';
    const baseUrl = process.env.INSFORGE_PROJECT_URL || '';
    if (!authorization || !anonKey || !baseUrl) {
      return json({ success: false, error: 'Authenticated InsForge context is unavailable' }, 401);
    }

    // Use the caller's token for every database operation. RLS remains the
    // authorization boundary; the request body is never trusted for identity.
    const client = createClient({ baseUrl, anonKey });
    client.setAccessToken(authorization.replace(/^Bearer\s+/i, ''));

    const { data: authData, error: authError } = await client.auth.getCurrentUser();
    if (authError || !authData?.user?.id) {
      return json({ success: false, error: 'Authentication required' }, 401);
    }

    const { data: profiles, error: profileError } = await client.database
      .from('users')
      .select('id, role, is_active')
      .eq('auth_user_id', authData.user.id)
      .limit(1);
    const admin = Array.isArray(profiles) ? profiles[0] : null;
    if (profileError || !admin || !['admin', 'superadmin'].includes(String(admin.role).toLowerCase()) || admin.is_active === false) {
      return json({ success: false, error: 'Admin authorization required' }, 403);
    }

    const { data: payments, error: paymentLookupError } = await client.database
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .limit(1);
    const payment = Array.isArray(payments) ? payments[0] : null;
    if (paymentLookupError || !payment) return json({ success: false, error: 'Payment not found' }, 404);

    const currentStatus = String(payment.status || '').toUpperCase();
    if (['VERIFIED', 'COMPLETED', 'REJECTED'].includes(currentStatus)) {
      return json({ success: false, error: 'Payment has already reached a final status' }, 409);
    }

    const now = new Date().toISOString();
    const reason = String(rejectionReason || '').trim();
    if (action === 'REJECTED' && !reason) return json({ success: false, error: 'Rejection reason is required' }, 400);

    const { data: updatedPayments, error: updateError } = await client.database
      .from('payments')
      .update({
        status: action,
        verified_by: admin.id,
        verified_at: now,
        rejection_reason: action === 'REJECTED' ? reason : null,
        updated_at: now,
      })
      .eq('id', paymentId)
      .select('*');
    if (updateError || !Array.isArray(updatedPayments) || !updatedPayments[0]) {
      return json({ success: false, error: updateError?.message || 'Payment update failed' }, 409);
    }

    if (payment.booking_id) {
      const { error: bookingError } = await client.database
        .from('bookings')
        .update({ status: action === 'VERIFIED' ? 'CONFIRMED' : 'REJECTED', updated_at: now })
        .eq('id', payment.booking_id);
      if (bookingError) return json({ success: false, error: bookingError.message }, 409);
    }

    if (payment.user_id) {
      await client.database.from('notifications').insert([{
        user_id: payment.user_id,
        title: action === 'VERIFIED' ? 'Payment Verified & Booking Confirmed! 🎉' : 'Payment Verification Rejected',
        message: action === 'VERIFIED'
          ? `Your payment of ₹${payment.amount} has been verified. Your booking is now CONFIRMED.`
          : `Your payment submission was rejected: ${reason}. Please re-submit valid payment proof.`,
        type: action === 'VERIFIED' ? 'payment_verified' : 'payment_rejected',
      }]);
    }

    return json({
      success: true,
      data: {
        payment: updatedPayments[0],
        verifiedBy: admin.id,
        verifiedAt: now,
        action,
      },
    });
  } catch (err: any) {
    return json({ success: false, error: err.message || 'Payment action failed' }, 500);
  }
}
