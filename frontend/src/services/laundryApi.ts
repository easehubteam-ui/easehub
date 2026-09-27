import { api } from './api';
import { PGLocation } from './pgApi';

export interface LaundryProvider {
  _id: string;
  code: string;
  name: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  description?: string;
  corridor: string;
  distance?: string;
  rating: number;
  reviewCount: number;
  status: 'active' | 'pending' | 'paused';
  tags?: string[];
  pricePerKg?: number;
  perKgPrice?: number;
  steamIronPerPc?: number;
  turnaroundHours?: number;
  turnaroundTime?: string;
  image?: string;
  images?: string[];
  services?: { name: string }[];
  pickupAvailable?: boolean;
  location: PGLocation;
  createdAt?: string;
  updatedAt?: string;
}

export const laundryApi = {
  getAll: async () => {
    const res = await api.get('/laundry');
    return res.data?.data?.providers ?? res.data?.data?.laundryProviders ?? [];
  },
  getById: async (id: string) => {
    const res = await api.get(`/laundry/${id}`);
    return res.data?.data?.provider ?? null;
  },
  create: async (data: Partial<LaundryProvider>) => {
    const res = await api.post('/laundry', data);
    return res.data?.data?.provider;
  },
  update: async (id: string, data: Partial<LaundryProvider>) => {
    const res = await api.put(`/laundry/${id}`, data);
    return res.data?.data?.provider;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/laundry/${id}`);
    return res.data;
  },
};
