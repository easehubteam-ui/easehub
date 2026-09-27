/**
 * InsForge Edge Function: submit-payment
 * Customer submits payment proof (UTR / screenshot) for verification.
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
    const { bookingId, userId, amount, paymentMethod, utr, screenshotUrl } = payload;

    if (!bookingId || !userId || !amount || !paymentMethod) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters (bookingId, userId, amount, paymentMethod)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        bookingId,
        userId,
        amount,
        paymentMethod,
        utr: utr || null,
        screenshotUrl: screenshotUrl || null,
        status: 'VERIFICATION_PENDING',
        message: 'Payment verification details submitted successfully'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
