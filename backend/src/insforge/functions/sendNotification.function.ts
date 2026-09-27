/**
 * InsForge Edge Function: send-notification
 * Dispatches automated notifications to users.
 */

export interface SendNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: string;
  data?: Record<string, any>;
}

export async function handleSendNotification(
  payload: SendNotificationPayload,
  context: { dbClient: any }
): Promise<{ success: boolean; data?: any; error?: string; statusCode: number }> {
  try {
    const { userId, title, message, type = 'general', data = {} } = payload;

    if (!userId || !title || !message) {
      return {
        success: false,
        error: 'Missing parameters (userId, title, message are required)',
        statusCode: 400
      };
    }

    const notification = await context.dbClient
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
        data
      })
      .select()
      .single();

    return {
      success: true,
      data: notification,
      statusCode: 201
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error processing send-notification function',
      statusCode: 500
    };
  }
}
