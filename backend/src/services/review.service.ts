import mongoose from 'mongoose';
import { Review, IReview } from '../models/Review.js';

// In-memory store starts EMPTY (No fake reviews)
const memoryReviewStore: any[] = [];

export class ReviewService {
  static async getReviews(targetId?: string) {
    if (mongoose.connection.readyState !== 1) {
      return memoryReviewStore;
    }
    return await Review.find().populate('user').sort({ createdAt: -1 });
  }

  static async createReview(userId: string, data: any) {
    const payload = {
      user: userId,
      userName: data.userName || 'Student',
      serviceId: data.serviceId || data.bookingId,
      rating: Number(data.rating || 5),
      comment: data.comment || '',
      createdAt: new Date(),
    };

    if (mongoose.connection.readyState !== 1) {
      const mock = { _id: 'rv_' + Date.now(), ...payload };
      memoryReviewStore.unshift(mock);
      return mock;
    }

    return await Review.create(payload as any);
  }
}
