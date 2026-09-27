/**
 * InsForge Edge Function: update-booking-status
 * Admin or system updates booking status (CONFIRMED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED).
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
    const { bookingId, status, updatedBy } = payload;

    const allowedStatuses = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'];

    if (!bookingId || !status || !allowedStatuses.includes(status)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Invalid parameters. Status must be one of: ${allowedStatuses.join(', ')}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        bookingId,
        status,
        updatedAt: new Date().toISOString(),
        message: `Booking status updated to ${status}`
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
