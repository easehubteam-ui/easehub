import { api } from './api';
import { PGLocation } from './pgApi';

export interface MealProvider {
  _id: string;
  code: string;
  name: string;
  fssai: string;
  corridor: string;
  distance: string;
  rating: number;
  reviewCount: number;
  status: 'active' | 'pending' | 'paused';
  tags: string[];
  dailyPrice: number;
  monthlyPrice: number;
  activeTiffins: number;
  kitchenCapacity: string;
  inspectionGrade: string;
  deliveryRadius: string;
  breakfastMenu: string;
  lunchMenu: string;
  dinnerMenu: string;
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
  image: string;
  isVeg: boolean;
  location: PGLocation;
  createdAt?: string;
  updatedAt?: string;
}

export const mealApi = {
  getAll: async () => {
    const res = await api.get('/meals');
    return res.data?.data?.providers ?? res.data?.data?.mealProviders ?? [];
  },
  getById: async (id: string) => {
    const res = await api.get(`/meals/${id}`);
    return res.data?.data?.provider ?? null;
  },
  create: async (data: Partial<MealProvider>) => {
    const res = await api.post('/meals', data);
    return res.data?.data?.provider;
  },
  update: async (id: string, data: Partial<MealProvider>) => {
    const res = await api.put(`/meals/${id}`, data);
    return res.data?.data?.provider;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/meals/${id}`);
    return res.data;
  },
  updateLocation: async (id: string, location: PGLocation) => {
    const res = await api.put(`/meals/${id}/location`, location);
    return res.data?.data?.provider;
  },
};
