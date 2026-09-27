import { api } from './api';

export const uploadApi = {
  uploadImage: async (payload: { base64?: string; image?: string; filename?: string }) => {
    const res = await api.post('/upload', payload);
    return res.data?.data?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';
  },
};
