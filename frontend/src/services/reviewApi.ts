import { insforge } from './insforge';

export interface ReviewItem {
  id?: string;
  _id?: string;
  user?: any;
  userName?: string;
  serviceId?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export const reviewApi = {
  getReviews: async () => {
    try {
      const { data } = await insforge.database.from('reviews').select('*').eq('is_published', true);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },
  createReview: async (data: { bookingId?: string; serviceId?: string; rating: number; comment?: string }) => {
    const { data: userRes } = await insforge.auth.getCurrentUser();
    if (!userRes?.user) throw new Error('Authentication required');

    const { data: profiles } = await insforge.database
      .from('users')
      .select('id')
      .eq('auth_user_id', userRes.user.id);

    const profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;
    if (!profile) throw new Error('User profile not found');

    const payload = {
      userId: profile.id,
      bookingId: data.bookingId || '',
      rating: data.rating,
      comment: data.comment || ''
    };

    const res = await insforge.functions.invoke('create-review', { body: payload });
    return res.data;
  },
};
