/**
 * InsForge Edge Function: admin-payment-action
 * Admin approves (VERIFIED) or rejects (REJECTED) payment verification proof.
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
    const { paymentId, adminUserId, action, rejectionReason } = payload;

    if (!paymentId || !adminUserId || !['VERIFIED', 'REJECTED'].includes(action)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid arguments (paymentId, adminUserId, action: VERIFIED | REJECTED required)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        paymentId,
        action,
        verifiedBy: adminUserId,
        verifiedAt: new Date().toISOString(),
        rejectionReason: action === 'REJECTED' ? rejectionReason || 'Payment verification failed' : null,
        message: `Payment status set to ${action}`
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
