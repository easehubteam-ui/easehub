import mongoose from 'mongoose';
import { Review, IReview } from '../models/Review.js';
import { insforgeAdmin } from '../config/insforge.js';

// Pre-seeded initial video reviews for startup and instant fallback
const initialVideoReviews: any[] = [
  {
    _id: 'rev-vid-1',
    id: 'rev-vid-1',
    userName: 'Aman Verma',
    college: 'BIT Durg • CSE 2nd Year',
    city: 'Durg',
    targetName: 'Shiv Shakti Boys PG, Junwani',
    serviceType: 'PG',
    rating: 5,
    badgeTitle: 'Found my stay in 15 mins',
    reviewQuote: 'EaseHub verified the PG owner, booked my single room 400m from BIT Gate 2, and waived all brokerage fees. Smoothest college move ever.',
    comment: 'Found my stay in 15 mins! EaseHub verified the PG owner, booked my single room 400m from BIT Gate 2, and waived all brokerage fees.',
    videoDuration: '0:48',
    cardBg: 'bg-[#9D76F7]',
    tag: '🛏️ Verified PG',
    status: 'approved',
    is_published: true,
    createdAt: new Date('2026-09-15'),
  },
  {
    _id: 'rev-vid-2',
    id: 'rev-vid-2',
    userName: 'Sneha Agrawal',
    college: 'NIT Raipur • Architecture',
    city: 'Raipur',
    targetName: 'Maa Annapurna Student Mess',
    serviceType: 'Meals',
    rating: 5,
    badgeTitle: 'Food arrives hot everyday',
    reviewQuote: 'Subscribed to Maa Annapurna mess on EaseHub. The daily 2-meal plan reaches my hostel gate right on time, and I pause billing during semester breaks.',
    comment: 'Food arrives hot everyday! Subscribed to Maa Annapurna mess on EaseHub.',
    videoDuration: '0:55',
    cardBg: 'bg-[#F0EDE6]',
    tag: '🍲 Daily Mess',
    status: 'approved',
    is_published: true,
    createdAt: new Date('2026-09-18'),
  },
  {
    _id: 'rev-vid-3',
    id: 'rev-vid-3',
    userName: 'Rohan Sharma',
    college: 'Rungta College • ECE 3rd Year',
    city: 'Bhilai',
    targetName: 'QuickWash Student Express',
    serviceType: 'Laundry',
    rating: 5,
    badgeTitle: 'Laundry picked from hostel door',
    reviewQuote: 'Bag picked up Thursday evening from my room, returned clean, ironed, and folded on Saturday morning. Saves me 4 hours every single weekend.',
    comment: 'Bag picked up Thursday evening from my room, returned clean, ironed, and folded on Saturday morning.',
    videoDuration: '0:42',
    cardBg: 'bg-[#E0F2FE]',
    tag: '🧺 Express Wash',
    status: 'approved',
    is_published: true,
    createdAt: new Date('2026-09-20'),
  },
  {
    _id: 'rev-vid-4',
    id: 'rev-vid-4',
    userName: 'Priya Patel',
    college: 'SSGI Bhilai • B.Tech AI',
    city: 'Bhilai',
    targetName: 'Tulsi Girls Premium Living',
    serviceType: 'PG',
    rating: 5,
    badgeTitle: 'Safe with biometric entry',
    reviewQuote: 'As a girl moving from Bilaspur to Bhilai for college, safety was priority #1. EaseHub’s verified list with female wardens made my parents fully stress-free.',
    comment: 'Safe with biometric entry. EaseHub’s verified list with female wardens made my parents fully stress-free.',
    videoDuration: '1:02',
    cardBg: 'bg-[#225944]',
    tag: '🛡️ Safe Stay',
    status: 'approved',
    is_published: true,
    createdAt: new Date('2026-09-22'),
  },
  {
    _id: 'rev-vid-5',
    id: 'rev-vid-5',
    userName: 'Kunal Dewangan',
    college: 'CSVTU Campus • M.Tech',
    city: 'Durg',
    targetName: 'HomeZaika Pure Veg Tiffin',
    serviceType: 'Meals',
    rating: 5,
    badgeTitle: 'Zero brokerage, total honesty',
    reviewQuote: 'No local broker haggling, no surprise maintenance fees. The ₹5,500/month rent listed on EaseHub was the exact amount drafted in the digital agreement.',
    comment: 'Zero brokerage, total honesty. Exact rent listed on EaseHub with digital agreement.',
    videoDuration: '0:50',
    cardBg: 'bg-[#EECA3A]',
    tag: '💰 Zero Brokerage',
    status: 'approved',
    is_published: true,
    createdAt: new Date('2026-09-25'),
  },
];

const memoryReviewStore: any[] = [...initialVideoReviews];

export class ReviewService {
  static async getReviews(filter: { publishedOnly?: boolean; targetId?: string; status?: string } = {}) {
    // 1. Try InsForge PostgreSQL Database first
    try {
      let query = insforgeAdmin.database.from('reviews').select('*');
      if (filter.publishedOnly) {
        query = query.eq('is_published', true);
      }
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback to local MongoDB / In-memory
    }

    // 2. Try MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const mongoFilter: any = {};
      if (filter.publishedOnly) mongoFilter.is_published = true;
      if (filter.status) mongoFilter.status = filter.status;
      if (filter.targetId) mongoFilter.serviceId = filter.targetId;
      const results = await Review.find(mongoFilter).populate('user').sort({ createdAt: -1 });
      if (results.length > 0) return results;
    }

    // 3. In-memory fallback
    return memoryReviewStore.filter((r) => {
      if (filter.publishedOnly && !r.is_published) return false;
      if (filter.status && r.status !== filter.status) return false;
      return true;
    });
  }

  static async getAdminReviews() {
    return await this.getReviews({ publishedOnly: false });
  }

  static async createReview(userId: string, data: any) {
    const payload = {
      user: userId,
      userName: data.userName || data.author || 'Verified Resident',
      college: data.college || 'College Resident',
      city: data.city || 'Bhilai',
      serviceId: data.serviceId || data.bookingId || '',
      targetName: data.targetName || data.property_name || 'EaseHub Partner',
      serviceType: data.serviceType || 'PG',
      rating: Number(data.rating || 5),
      badgeTitle: data.badgeTitle || 'Student Review',
      comment: data.comment || '',
      reviewQuote: data.reviewQuote || data.comment || '',
      videoUrl: data.videoUrl || '',
      videoDuration: data.videoDuration || '0:45',
      status: (data.status as any) || 'approved',
      is_published: data.is_published ?? true,
      tag: data.tag || 'Verified Review',
      cardBg: data.cardBg || 'bg-[#9D76F7]',
      createdAt: new Date(),
    };

    // Try InsForge Postgres
    try {
      await insforgeAdmin.database.from('reviews').insert([payload]);
    } catch {}

    // Try MongoDB
    if (mongoose.connection.readyState === 1) {
      return await Review.create(payload as any);
    }

    // Memory Store
    const mock = { _id: 'rv_' + Date.now(), id: 'rv_' + Date.now(), ...payload };
    memoryReviewStore.unshift(mock);
    return mock;
  }

  static async updateReviewStatus(id: string, status: 'approved' | 'pending' | 'rejected') {
    const isPublished = status === 'approved';

    // 1. Update in InsForge if possible
    try {
      await insforgeAdmin.database
        .from('reviews')
        .update({ status, is_published: isPublished })
        .eq('id', id);
    } catch {}

    // 2. Update in MongoDB if connected
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      await Review.findByIdAndUpdate(id, { status, is_published: isPublished });
    }

    // 3. Update in Memory store
    const item = memoryReviewStore.find((r) => r.id === id || r._id === id || String(r._id) === id);
    if (item) {
      item.status = status;
      item.is_published = isPublished;
      return item;
    }

    return { id, status, is_published: isPublished };
  }

  static async deleteReview(id: string) {
    try {
      await insforgeAdmin.database.from('reviews').delete().eq('id', id);
    } catch {}

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      await Review.findByIdAndDelete(id);
    }

    const index = memoryReviewStore.findIndex((r) => r.id === id || r._id === id || String(r._id) === id);
    if (index !== -1) {
      memoryReviewStore.splice(index, 1);
    }
    return { success: true, id };
  }
}
