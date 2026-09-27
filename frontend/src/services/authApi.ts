import { api } from './api';

export const authApi = {
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  adminLogin: async (data: any) => {
    const res = await api.post('/auth/admin/login', data);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  forgotPassword: async (data: { emailOrPhone: string }) => {
    const res = await api.post('/auth/forgot-password', data);
    return res.data;
  },
  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },
  health: async () => {
    const res = await api.get('/auth/health');
    return res.data;
  },
};
