/**
 * InsForge Edge Function: verify-payment
 * Customer submits payment proof (UTR / screenshot) for an existing booking.
 */

export interface VerifyPaymentPayload {
  bookingId: string;
  userId: string;
  amount: number;
  paymentMethod: 'qr' | 'online';
  utr?: string;
  screenshotUrl?: string;
}

export async function handleVerifyPayment(
  payload: VerifyPaymentPayload,
  context: { dbClient: any }
): Promise<{ success: boolean; data?: any; error?: string; statusCode: number }> {
  try {
    const { bookingId, userId, amount, paymentMethod, utr, screenshotUrl } = payload;

    if (!bookingId || !userId || !amount || !paymentMethod) {
      return {
        success: false,
        error: 'Missing required parameters (bookingId, userId, amount, paymentMethod)',
        statusCode: 400
      };
    }

    // Check existing payment entry for booking
    const { data: existingPayment } = await context.dbClient
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    let paymentResult;
    if (existingPayment) {
      paymentResult = await context.dbClient
        .from('payments')
        .update({
          payment_method: paymentMethod,
          amount,
          utr: utr || existingPayment.utr,
          screenshot_url: screenshotUrl || existingPayment.screenshot_url,
          status: 'VERIFICATION_PENDING',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPayment.id)
        .select()
        .single();
    } else {
      paymentResult = await context.dbClient
        .from('payments')
        .insert({
          booking_id: bookingId,
          user_id: userId,
          amount,
          payment_method: paymentMethod,
          status: 'VERIFICATION_PENDING',
          utr: utr || null,
          screenshot_url: screenshotUrl || null
        })
        .select()
        .single();
    }

    // Notify user that payment verification is pending
    await context.dbClient.from('notifications').insert({
      user_id: userId,
      title: 'Payment Verification Pending',
      message: `Your payment details for booking reference ${bookingId} have been uploaded and are being verified by our team.`,
      type: 'payment',
      data: { bookingId, paymentId: paymentResult?.id }
    });

    return {
      success: true,
      data: paymentResult,
      statusCode: 200
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error processing verify-payment function',
      statusCode: 500
    };
  }
}
