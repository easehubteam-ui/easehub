import mongoose from 'mongoose';
import { Payment, IPayment } from '../models/Payment.js';
import { BookingService } from './booking.service.js';
import { NotificationService } from './notification.service.js';

// In-memory store starts EMPTY (No fake payments)
const memoryPaymentStore: any[] = [];

export class PaymentService {
  static async getAllPayments() {
    if (mongoose.connection.readyState !== 1) {
      return memoryPaymentStore;
    }
    return await Payment.find().populate('booking user').sort({ createdAt: -1 });
  }

  static async getUserPayments(userId: string) {
    if (mongoose.connection.readyState !== 1) {
      return memoryPaymentStore.filter((p) => p.user === userId);
    }
    return await Payment.find({ user: userId }).populate('booking').sort({ createdAt: -1 });
  }

  static async createEscrowPayment(userId: string, data: any) {
    const paymentNumber = `#PAY-BH-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
      paymentNumber,
      booking: data.bookingId || data.booking,
      user: userId,
      userName: data.userName || 'Customer',
      serviceName: data.serviceName || 'EaseHub Service',
      amount: Number(data.amount || 0),
      method: data.method || 'qr',
      status: 'verification_pending',
      utr: data.utr || data.transactionId || '',
      screenshotUrl: data.screenshotUrl || data.proofUrl || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState !== 1) {
      const mockDoc = { _id: 'pm_' + Date.now(), ...payload };
      memoryPaymentStore.unshift(mockDoc);
      return mockDoc;
    }

    return await Payment.create(payload as any);
  }

  static async verifyPayment(id: string, adminId: string) {
    let paymentObj: any = null;
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryPaymentStore.findIndex((p) => p._id === id || p.paymentNumber === id);
      if (idx !== -1) {
        memoryPaymentStore[idx].status = 'verified';
        memoryPaymentStore[idx].verifiedAt = new Date();
        memoryPaymentStore[idx].verifiedBy = adminId;
        paymentObj = memoryPaymentStore[idx];
      }
    } else {
      paymentObj = await Payment.findByIdAndUpdate(
        id,
        { status: 'verified', verifiedAt: new Date(), verifiedBy: adminId },
        { new: true }
      );
    }

    if (paymentObj) {
      const bookingId = paymentObj.booking?._id || paymentObj.booking;
      if (bookingId) {
        await BookingService.updateStatus(bookingId.toString(), 'confirmed');
      }
      const targetUserId = paymentObj.user?._id || paymentObj.user || adminId;
      await NotificationService.sendNotification(
        targetUserId.toString(),
        'Payment Verified & Booking Confirmed',
        `Your payment of ₹${paymentObj.amount} for ${paymentObj.serviceName || 'your booking'} has been verified!`,
        'payment'
      );
    }

    return paymentObj;
  }

  static async rejectPayment(id: string, adminId: string, rejectionReason: string) {
    let paymentObj: any = null;
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryPaymentStore.findIndex((p) => p._id === id || p.paymentNumber === id);
      if (idx !== -1) {
        memoryPaymentStore[idx].status = 'rejected';
        memoryPaymentStore[idx].rejectionReason = rejectionReason;
        memoryPaymentStore[idx].verifiedBy = adminId;
        paymentObj = memoryPaymentStore[idx];
      }
    } else {
      paymentObj = await Payment.findByIdAndUpdate(
        id,
        { status: 'rejected', rejectionReason, verifiedBy: adminId },
        { new: true }
      );
    }

    if (paymentObj) {
      const bookingId = paymentObj.booking?._id || paymentObj.booking;
      if (bookingId) {
        await BookingService.updateStatus(bookingId.toString(), 'rejected');
      }
      const targetUserId = paymentObj.user?._id || paymentObj.user || adminId;
      await NotificationService.sendNotification(
        targetUserId.toString(),
        'Payment Proof Rejected',
        `Your payment proof was rejected. Reason: ${rejectionReason}`,
        'payment'
      );
    }

    return paymentObj;
  }

  static async getPaymentStats() {
    const list = await this.getAllPayments();
    const verified = list.filter((p: any) => p.status === 'verified');
    const pending = list.filter((p: any) => p.status === 'verification_pending');

    const totalEscrowVolume = verified.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const pendingAmount = pending.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    return {
      totalEscrowVolume,
      pendingCount: pending.length,
      pendingAmount,
      verifiedCount: verified.length,
    };
  }
}
