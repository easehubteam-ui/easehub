import { api } from './api';

export interface NotificationItem {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data?.data?.notifications || [];
  },
  markRead: async (id: string) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data?.data?.notification;
  },
};
