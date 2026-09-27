import { api } from './api';

export interface ReviewItem {
  _id: string;
  user: any;
  userName?: string;
  serviceId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export const reviewApi = {
  getReviews: async () => {
    const res = await api.get('/reviews');
    return res.data?.data?.reviews || [];
  },
  createReview: async (data: { serviceId?: string; rating: number; comment?: string }) => {
    const res = await api.post('/reviews', data);
    return res.data?.data?.review;
  },
};
