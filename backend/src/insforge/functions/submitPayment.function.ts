/**
 * InsForge Edge Function: submit-payment
 * Customer submits payment proof (UTR / screenshot) for verification.
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
    const { bookingId, paymentMethod = 'qr', utr, screenshotUrl } = payload;

    const cleanUtr = String(utr || '').trim();
    if (!bookingId || !['qr', 'online'].includes(paymentMethod) || cleanUtr.length < 6 || cleanUtr.length > 255) {
      return json({ success: false, error: 'A booking, supported payment method, and valid UTR are required' }, 400);
    }

    const authorization = req.headers.get('authorization');
    const anonKey = process.env.INSFORGE_ANON_KEY || '';
    const baseUrl = process.env.INSFORGE_PROJECT_URL || '';
    if (!authorization || !anonKey || !baseUrl) return json({ success: false, error: 'Authenticated InsForge context is unavailable' }, 401);

    if (typeof screenshotUrl === 'string' && /^https?:\/\//i.test(screenshotUrl)) {
      return json({ success: false, error: 'Store the private screenshot object path, not a public or signed URL' }, 400);
    }

    const client = createClient({ baseUrl, anonKey });
    client.setAccessToken(authorization.replace(/^Bearer\s+/i, ''));
    const { data: authData, error: authError } = await client.auth.getCurrentUser();
    if (authError || !authData?.user?.id) return json({ success: false, error: 'Authentication required' }, 401);

    const { data: profiles, error: profileError } = await client.database
      .from('users')
      .select('id')
      .eq('auth_user_id', authData.user.id)
      .limit(1);
    const profile = Array.isArray(profiles) ? profiles[0] : null;
    if (profileError || !profile?.id) return json({ success: false, error: 'Customer profile not found' }, 403);

    const { data: bookings, error: bookingError } = await client.database
      .from('bookings')
      .select('id, amount, user_id')
      .eq('id', bookingId)
      .eq('user_id', profile.id)
      .limit(1);
    const booking = Array.isArray(bookings) ? bookings[0] : null;
    if (bookingError || !booking) return json({ success: false, error: 'Booking not found or not owned by the customer' }, 404);

    const amount = Number(booking.amount);
    if (!Number.isFinite(amount) || amount <= 0) return json({ success: false, error: 'Booking has an invalid amount' }, 409);

    const { data: existingPayments, error: paymentLookupError } = await client.database
      .from('payments')
      .select('id, status')
      .eq('booking_id', booking.id)
      .eq('user_id', profile.id)
      .limit(1);
    if (paymentLookupError) return json({ success: false, error: paymentLookupError.message }, 409);

    const existing = Array.isArray(existingPayments) ? existingPayments[0] : null;
    if (existing && ['VERIFIED', 'COMPLETED'].includes(String(existing.status || '').toUpperCase())) {
      return json({ success: false, error: 'This payment has already been verified' }, 409);
    }

    const paymentPayload = {
      booking_id: booking.id,
      user_id: profile.id,
      amount,
      payment_method: paymentMethod,
      status: 'VERIFICATION_PENDING',
      utr: cleanUtr,
      screenshot_url: screenshotUrl || null,
      updated_at: new Date().toISOString(),
    };

    const result = existing
      ? await client.database.from('payments').update(paymentPayload).eq('id', existing.id).select('*')
      : await client.database.from('payments').insert([{ ...paymentPayload, created_at: new Date().toISOString() }]).select('*');
    if (result.error || !Array.isArray(result.data) || !result.data[0]) return json({ success: false, error: result.error?.message || 'Payment submission failed' }, 409);

    await client.database.from('notifications').insert([{
      user_id: profile.id,
      title: 'Payment Verification Pending',
      message: `Your payment details for booking ${booking.id} are awaiting admin verification.`,
      type: 'payment',
    }]);

    return json({ success: true, data: result.data[0] });
  } catch (err: any) {
    return json({ success: false, error: err.message || 'Payment submission failed' }, 500);
  }
}
