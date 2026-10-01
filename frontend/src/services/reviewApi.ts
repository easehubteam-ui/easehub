import { insforge } from './insforge';
import { api } from './api';

export interface ReviewItem {
  id?: string;
  _id?: string;
  user?: any;
  userName?: string;
  college?: string;
  city?: string;
  serviceId?: string;
  targetName?: string;
  serviceType?: string;
  rating: number;
  badgeTitle?: string;
  comment?: string;
  reviewQuote?: string;
  videoUrl?: string;
  videoDuration?: string;
  status?: 'approved' | 'pending' | 'rejected';
  is_published?: boolean;
  tag?: string;
  cardBg?: string;
  createdAt?: string;
  dbId?: string;
}

export const reviewApi = {
  // Get all public/approved reviews
  getReviews: async (): Promise<ReviewItem[]> => {
    // 1. Try Express backend API
    try {
      const res = await api.get('/reviews');
      if (res.data?.data?.reviews && Array.isArray(res.data.data.reviews)) {
        return res.data.data.reviews;
      }
    } catch {}

    // 2. Try InsForge Direct
    try {
      const { data } = await insforge.database.from('reviews').select('*').eq('is_published', true);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {}

    return [];
  },

  // Get all reviews for admin moderation
  getAdminReviews: async (): Promise<ReviewItem[]> => {
    // 1. Try Express backend admin endpoint
    try {
      const res = await api.get('/reviews/admin/all');
      if (res.data?.data?.reviews && Array.isArray(res.data.data.reviews)) {
        return res.data.data.reviews;
      }
    } catch {}

    // 2. Try regular endpoint with all=true
    try {
      const res = await api.get('/reviews?all=true');
      if (res.data?.data?.reviews && Array.isArray(res.data.data.reviews)) {
        return res.data.data.reviews;
      }
    } catch {}

    // 3. Try InsForge database
    try {
      const { data } = await insforge.database.from('reviews').select('*');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {}

    return [];
  },

  // Update review status (approve / reject)
  updateStatus: async (id: string, status: 'approved' | 'pending' | 'rejected'): Promise<any> => {
    // 1. Try Express backend
    try {
      const res = await api.patch(`/reviews/${id}/status`, { status });
      if (res.data?.success) return res.data;
    } catch {}

    // 2. Try InsForge direct
    try {
      const { data, error } = await insforge.database
        .from('reviews')
        .update({ status, is_published: status === 'approved' })
        .eq('id', id);
      return { success: !error, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Delete review
  deleteReview: async (id: string): Promise<any> => {
    // 1. Try Express backend
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.data?.success) return res.data;
    } catch {}

    // 2. Try InsForge direct
    try {
      const { error } = await insforge.database.from('reviews').delete().eq('id', id);
      return { success: !error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Create review (from customer app or admin test)
  createReview: async (payload: {
    bookingId?: string;
    serviceId?: string;
    rating: number;
    comment?: string;
    userName?: string;
    college?: string;
    city?: string;
    targetName?: string;
    serviceType?: string;
    badgeTitle?: string;
    videoDuration?: string;
  }) => {
    // 1. Try Express API
    try {
      const res = await api.post('/reviews', payload);
      if (res.data?.success) return res.data.data?.review;
    } catch {}

    // 2. Fallback to InsForge function or table
    try {
      const { data: userRes } = await insforge.auth.getCurrentUser();
      const userId = userRes?.user?.id || 'usr_resident';

      const insertPayload = {
        userId,
        bookingId: payload.bookingId || '',
        rating: payload.rating,
        comment: payload.comment || '',
        userName: payload.userName || 'Student Resident',
        targetName: payload.targetName || 'EaseHub Partner',
        is_published: true,
      };

      const res = await insforge.functions.invoke('create-review', { body: insertPayload });
      return res.data;
    } catch (err: any) {
      return { error: err.message };
    }
  },
};
