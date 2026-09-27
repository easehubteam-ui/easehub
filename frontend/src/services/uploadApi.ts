import { api } from './api';

export const uploadApi = {
  uploadImage: async (payload: { base64?: string; image?: string; filename?: string }) => {
    const res = await api.post('/upload', payload);
    return res.data?.data?.url || res.data?.url || '';
  },
};
