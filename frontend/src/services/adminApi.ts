import { api } from './api';

export const adminApi = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data?.data || null;
  },
};
