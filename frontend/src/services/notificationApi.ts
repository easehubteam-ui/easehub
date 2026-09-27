import { insforge } from './insforge';

export interface NotificationItem {
  id?: string;
  _id?: string;
  user?: string;
  title: string;
  message: string;
  type: string;
  read?: boolean;
  isRead?: boolean;
  is_read?: boolean;
  createdAt?: string;
}

export const notificationApi = {
  getNotifications: async () => {
    try {
      const { data: userRes } = await insforge.auth.getCurrentUser();
      if (!userRes?.user) return [];

      const { data: profiles } = await insforge.database
        .from('users')
        .select('id')
        .eq('auth_user_id', userRes.user.id);

      const profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;
      if (!profile) return [];

      const { data } = await insforge.database
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id);

      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },
  markRead: async (id: string) => {
    await insforge.database
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    return { success: true };
  },
  sendNotification: async (payload: { userId: string; title: string; message: string; type?: string; data?: any }) => {
    const res = await insforge.functions.invoke('send-notification', { body: payload });
    return res.data;
  }
};
