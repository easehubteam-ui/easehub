import { insforge } from './insforge';

export const adminApi = {
  getStats: async () => {
    try {
      const res = await insforge.functions.invoke('admin-stats');
      return res.data?.data || res.data || null;
    } catch (err) {
      return null;
    }
  },
};
