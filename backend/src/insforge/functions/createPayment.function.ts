/**
 * InsForge Edge Function: create-payment
 * Initializes payment record for a booking.
 */

export default async function (req: Request) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload: any = await req.json().catch(() => ({}));
    const { bookingId, userId, amount, paymentMethod } = payload;

    if (!bookingId || !userId || !amount || !paymentMethod) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required payment details (bookingId, userId, amount, paymentMethod)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const paymentData = {
      booking_id: bookingId,
      user_id: userId,
      amount,
      payment_method: paymentMethod,
      status: 'VERIFICATION_PENDING'
    };

    return new Response(JSON.stringify({
      success: true,
      data: {
        payment: paymentData,
        message: 'Payment record created. Please upload screenshot/UTR.'
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
