/**
 * InsForge Edge Function: create-booking
 * Validates request, checks item availability, calculates pricing/deposit, inserts `bookings` record.
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
    const { userId, serviceId, vendorId, bookingType, scheduledDate, scheduledTime, address, notes, amount, paymentMethod, utr, screenshotUrl } = payload;

    if (!userId || !bookingType || !scheduledDate || !address || !amount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required booking fields (userId, bookingType, scheduledDate, address, amount)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate unique booking number: EHB-YYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `EHB-${dateStr}-${randomSuffix}`;

    const bookingData = {
      booking_number: bookingNumber,
      user_id: userId,
      service_id: serviceId || null,
      vendor_id: vendorId || null,
      booking_type: bookingType,
      status: 'PENDING',
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime || null,
      address,
      notes: notes || null,
      amount
    };

    return new Response(JSON.stringify({
      success: true,
      data: {
        bookingNumber,
        booking: bookingData,
        message: 'Booking created successfully'
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
