import { api } from './api';

export const userApi = {
  getUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },
};
