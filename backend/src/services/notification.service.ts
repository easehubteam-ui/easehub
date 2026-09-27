import mongoose from 'mongoose';
import { Notification, INotification } from '../models/Notification.js';

// In-memory store starts EMPTY (No fake notifications)
const memoryNotificationStore: any[] = [];

export class NotificationService {
  static async getUserNotifications(userId: string) {
    if (mongoose.connection.readyState !== 1) {
      return memoryNotificationStore.filter((n) => n.user === userId);
    }
    return await Notification.find({ user: userId }).sort({ createdAt: -1 });
  }

  static async markAsRead(id: string) {
    if (mongoose.connection.readyState !== 1) {
      const found = memoryNotificationStore.find((n) => n._id === id);
      if (found) found.read = true;
      return found;
    }
    return await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
  }

  static async sendNotification(userId: string, title: string, message: string, type = 'system') {
    if (mongoose.connection.readyState !== 1) {
      const mock = {
        _id: 'nt_' + Date.now(),
        user: userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date(),
      };
      memoryNotificationStore.unshift(mock);
      return mock;
    }
    return await Notification.create({ user: userId, title, message, type });
  }
}
