import { api } from './api';
import { PGLocation } from './pgApi';

export interface ExtraServiceItem {
  _id: string;
  code: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  basePrice: number;
  priceUnit: string;
  providerName: string;
  providerPhone: string;
  corridor: string;
  rating: number;
  reviewCount: number;
  images: string[];
  isActive: boolean;
  location: PGLocation;
  createdAt?: string;
  updatedAt?: string;
}

export const serviceApi = {
  getAll: async () => {
    const res = await api.get('/services');
    return res.data?.data?.services ?? [];
  },
  getServices: async () => {
    const res = await api.get('/services');
    return res.data?.data?.services ?? [];
  },
  getById: async (id: string) => {
    const res = await api.get(`/services/${id}`);
    return res.data?.data?.service ?? null;
  },
  create: async (data: Partial<ExtraServiceItem>) => {
    const res = await api.post('/services', data);
    return res.data?.data?.service;
  },
  update: async (id: string, data: Partial<ExtraServiceItem>) => {
    const res = await api.put(`/services/${id}`, data);
    return res.data?.data?.service;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/services/${id}`);
    return res.data;
  },
  updateLocation: async (id: string, location: PGLocation) => {
    const res = await api.put(`/services/${id}/location`, location);
    return res.data?.data?.service;
  },
};
