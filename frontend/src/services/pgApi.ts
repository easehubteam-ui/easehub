import { api } from './api';

export interface PGLocation {
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface PGProperty {
  _id: string;
  code: string;
  name: string;
  gender: 'BOYS' | 'GIRLS' | 'CO-ED';
  images: string[];
  verified: boolean;
  corridor: string;
  distance: string;
  landlordName: string;
  landlordPhone: string;
  kycStatus: string;
  occupiedBeds: number;
  totalBeds: number;
  vacantBeds: number;
  roomMatrix: string;
  monthlyRent: number;
  deposit: number;
  amenities: string[];
  curfew: string;
  status: 'active' | 'pending' | 'revision' | 'disabled';
  rating: number;
  reviewCount: number;
  location: PGLocation;
  createdAt?: string;
  updatedAt?: string;
}

export const pgApi = {
  getAll: async () => {
    const res = await api.get('/pg');
    return res.data?.data?.pgs ?? [];
  },
  getById: async (id: string) => {
    const res = await api.get(`/pg/${id}`);
    return res.data?.data?.pg ?? null;
  },
  create: async (data: Partial<PGProperty>) => {
    const res = await api.post('/pg', data);
    return res.data?.data?.pg;
  },
  update: async (id: string, data: Partial<PGProperty>) => {
    const res = await api.put(`/pg/${id}`, data);
    return res.data?.data?.pg;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/pg/${id}`);
    return res.data;
  },
  updateLocation: async (id: string, location: PGLocation) => {
    const res = await api.put(`/pg/${id}/location`, location);
    return res.data?.data?.pg;
  },
};
