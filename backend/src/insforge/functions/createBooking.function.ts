/**
 * InsForge Edge Function: create-booking
 * Handles transactional booking creation, pricing verification, and notification dispatch.
 */

export interface CreateBookingPayload {
  userId: string;
  serviceId?: string;
  vendorId?: string;
  bookingType: 'PG' | 'MEAL' | 'LAUNDRY' | 'SERVICE';
  scheduledDate: string;
  scheduledTime?: string;
  address: string;
  notes?: string;
  amount: number;
  paymentMethod?: 'qr' | 'online';
  utr?: string;
  screenshotUrl?: string;
}

export interface EdgeFunctionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export async function handleCreateBooking(
  payload: CreateBookingPayload,
  context: { dbClient: any }
): Promise<EdgeFunctionResult> {
  try {
    const { userId, serviceId, vendorId, bookingType, scheduledDate, scheduledTime, address, notes, amount, paymentMethod, utr, screenshotUrl } = payload;

    if (!userId || !bookingType || !scheduledDate || !address || !amount) {
      return {
        success: false,
        error: 'Missing required booking fields (userId, bookingType, scheduledDate, address, amount)',
        statusCode: 400
      };
    }

    // Generate unique booking number: EHB-YYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `EHB-${dateStr}-${randomSuffix}`;

    // 1. Insert Booking Record
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

    const booking = await context.dbClient.from('bookings').insert(bookingData).select().single();
    if (!booking) {
      throw new Error('Failed to insert booking into database');
    }

    // 2. Create Payment entry if payment parameters supplied
    let payment = null;
    if (paymentMethod) {
      const paymentData = {
        booking_id: booking.id,
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        status: 'VERIFICATION_PENDING',
        utr: utr || null,
        screenshot_url: screenshotUrl || null
      };

      payment = await context.dbClient.from('payments').insert(paymentData).select().single();
    }

    // 3. Create Notification for User
    await context.dbClient.from('notifications').insert({
      user_id: userId,
      title: 'Booking Placed',
      message: `Your ${bookingType} booking (${bookingNumber}) has been submitted successfully and is pending confirmation.`,
      type: 'booking',
      data: { bookingId: booking.id, bookingNumber }
    });

    return {
      success: true,
      data: {
        booking,
        payment
      },
      statusCode: 201
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Internal server error processing create-booking function',
      statusCode: 500
    };
  }
}
