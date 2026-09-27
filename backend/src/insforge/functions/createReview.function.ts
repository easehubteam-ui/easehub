/**
 * InsForge Edge Function: create-review
 * Customer leaves review for a completed booking.
 */

export interface CreateReviewPayload {
  userId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

export async function handleCreateReview(
  payload: CreateReviewPayload,
  context: { dbClient: any }
): Promise<{ success: boolean; data?: any; error?: string; statusCode: number }> {
  try {
    const { userId, bookingId, rating, comment } = payload;

    if (!userId || !bookingId || !rating || rating < 1 || rating > 5) {
      return {
        success: false,
        error: 'Invalid input (userId, bookingId, rating between 1 and 5 required)',
        statusCode: 400
      };
    }

    // Verify booking exists and belongs to user
    const booking = await context.dbClient.from('bookings').select('*').eq('id', bookingId).single();
    if (!booking) {
      return {
        success: false,
        error: 'Booking not found',
        statusCode: 404
      };
    }

    if (booking.user_id !== userId) {
      return {
        success: false,
        error: 'Unauthorized: Booking does not belong to user',
        statusCode: 403
      };
    }

    // Insert review
    const review = await context.dbClient
      .from('reviews')
      .insert({
        user_id: userId,
        booking_id: bookingId,
        rating,
        comment: comment || null,
        is_published: true
      })
      .select()
      .single();

    return {
      success: true,
      data: review,
      statusCode: 201
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error executing create-review function',
      statusCode: 500
    };
  }
}
