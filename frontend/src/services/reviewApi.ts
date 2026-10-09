import { insforge } from './insforge';

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
  video_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  videoDuration?: string;
  status?: 'approved' | 'pending' | 'rejected';
  is_published?: boolean;
  tag?: string;
  cardBg?: string;
  createdAt?: string;
  dbId?: string;
}

export const reviewApi = {
  // Get all public/approved reviews directly from PostgreSQL
  getReviews: async (): Promise<ReviewItem[]> => {
    try {
      const { data, error } = await insforge.database
        .from('reviews')
        .select('*')
        .eq('is_published', true);

      if (error || !Array.isArray(data)) {
        return [];
      }
      return data;
    } catch {
      return [];
    }
  },

  // Get all reviews for admin moderation
  getAdminReviews: async (): Promise<ReviewItem[]> => {
    try {
      const { data, error } = await insforge.database
        .from('reviews')
        .select('*');

      if (error || !Array.isArray(data)) {
        return [];
      }
      return data;
    } catch {
      return [];
    }
  },

  // Update review status (approve / reject)
  updateStatus: async (id: string, status: 'approved' | 'pending' | 'rejected'): Promise<any> => {
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
    try {
      const { data: userRes } = await insforge.auth.getCurrentUser();
      let userId = userRes?.user?.id;

      if (!userId) {
        throw new Error('You must be logged in to post a review.');
      }

      // Check if user has a corresponding row in public.users
      const { data: profiles } = await insforge.database
        .from('users')
        .select('id, name')
        .eq('auth_user_id', userId);

      const dbUserId = profiles && profiles[0]?.id ? profiles[0].id : userId;
      const authorName = profiles && profiles[0]?.name ? profiles[0].name : payload.userName || 'Resident';

      const insertRecord = {
        user_id: dbUserId,
        booking_id: payload.bookingId || null,
        rating: payload.rating,
        comment: payload.comment || '',
        user_name: authorName,
        target_name: payload.targetName || 'EaseHub Verified Partner',
        service_type: payload.serviceType || 'PG',
        is_published: true,
        status: 'approved'
      };

      const { data, error } = await insforge.database
        .from('reviews')
        .insert([insertRecord]);

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (err: any) {
      return { error: err.message };
    }
  },
};
