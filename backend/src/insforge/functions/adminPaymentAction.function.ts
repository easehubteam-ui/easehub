/**
 * InsForge Edge Function: admin-payment-action
 * Admin accepts (VERIFIED) or rejects (REJECTED) a payment proof.
 */

export interface AdminPaymentActionPayload {
  paymentId: string;
  adminUserId: string;
  action: 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

export async function handleAdminPaymentAction(
  payload: AdminPaymentActionPayload,
  context: { dbClient: any }
): Promise<{ success: boolean; data?: any; error?: string; statusCode: number }> {
  try {
    const { paymentId, adminUserId, action, rejectionReason } = payload;

    if (!paymentId || !adminUserId || !['VERIFIED', 'REJECTED'].includes(action)) {
      return {
        success: false,
        error: 'Invalid arguments (paymentId, adminUserId, action: VERIFIED | REJECTED required)',
        statusCode: 400
      };
    }

    // Get payment details
    const payment = await context.dbClient.from('payments').select('*').eq('id', paymentId).single();
    if (!payment) {
      return {
        success: false,
        error: 'Payment record not found',
        statusCode: 444
      };
    }

    const updatedPayment = await context.dbClient
      .from('payments')
      .update({
        status: action,
        verified_by: adminUserId,
        verified_at: new Date().toISOString(),
        rejection_reason: action === 'REJECTED' ? rejectionReason || 'Payment verification failed' : null
      })
      .eq('id', paymentId)
      .select()
      .single();

    // Update associated booking status
    const bookingStatus = action === 'VERIFIED' ? 'CONFIRMED' : 'PENDING';
    await context.dbClient
      .from('bookings')
      .update({ status: bookingStatus })
      .eq('id', payment.booking_id);

    // Send notification to customer
    const notificationMessage = action === 'VERIFIED'
      ? `Your payment of ₹${payment.amount} has been verified and your booking is now CONFIRMED!`
      : `Your payment of ₹${payment.amount} could not be verified. Reason: ${rejectionReason || 'Invalid UTR/Screenshot'}. Please re-submit payment proof.`;

    await context.dbClient.from('notifications').insert({
      user_id: payment.user_id,
      title: action === 'VERIFIED' ? 'Payment Verified 🎉' : 'Payment Verification Failed ⚠️',
      message: notificationMessage,
      type: 'payment',
      data: { bookingId: payment.booking_id, paymentId }
    });

    return {
      success: true,
      data: updatedPayment,
      statusCode: 200
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error processing admin-payment-action function',
      statusCode: 500
    };
  }
}
