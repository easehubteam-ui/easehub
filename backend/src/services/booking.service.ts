import mongoose from 'mongoose';
import { Booking, IBooking } from '../models/Booking.js';

// In-memory store starts EMPTY (No fake bookings)
const memoryBookingStore: any[] = [];

export class BookingService {
  static async getAllBookings() {
    if (mongoose.connection.readyState !== 1) {
      return memoryBookingStore;
    }
    return await Booking.find().populate('user service').sort({ createdAt: -1 });
  }

  static async getUserBookings(userId: string) {
    if (mongoose.connection.readyState !== 1) {
      return memoryBookingStore.filter((b) => b.user === userId);
    }
    return await Booking.find({ user: userId }).populate('service').sort({ createdAt: -1 });
  }

  static async getBookingById(id: string) {
    if (mongoose.connection.readyState !== 1) {
      return memoryBookingStore.find((b) => b._id === id || b.bookingNumber === id) || null;
    }
    return await Booking.findById(id).populate('user service');
  }

  static async createBooking(userId: string, data: any) {
    const bookingNumber = `#BK-BH-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
      bookingNumber,
      user: userId,
      userName: data.userName || 'Customer',
      userPhone: data.userPhone || '',
      service: data.serviceId || data.service,
      serviceName: data.serviceName || 'EaseHub Service',
      serviceType: data.serviceType || 'General',
      roomType: data.roomType || 'Standard',
      status: 'pending',
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
      scheduledTime: data.scheduledTime || '10:00 AM',
      address: data.address || '',
      description: data.description || '',
      amount: Number(data.amount || 0),
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState !== 1) {
      const mockDoc = { _id: 'bk_' + Date.now(), ...payload };
      memoryBookingStore.unshift(mockDoc);
      return mockDoc;
    }

    return await Booking.create(payload as any);
  }

  static async updateStatus(id: string, status: string, additionalData: any = {}) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryBookingStore.findIndex((b) => b._id === id || b.bookingNumber === id);
      if (idx !== -1) {
        memoryBookingStore[idx] = { ...memoryBookingStore[idx], status, ...additionalData, updatedAt: new Date() };
        return memoryBookingStore[idx];
      }
      return null;
    }
    return await Booking.findByIdAndUpdate(id, { status, ...additionalData, updatedAt: new Date() }, { new: true });
  }

  static async cancelBooking(id: string, userId?: string) {
    return await this.updateStatus(id, 'cancelled');
  }
}
