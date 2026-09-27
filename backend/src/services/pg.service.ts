import mongoose from 'mongoose';
import { PG, IPGProperty } from '../models/PG.js';

// In-memory fallback store starts EMPTY (No dummy / seed data)
const memoryPGStore: IPGProperty[] = [];

export class PGService {
  static async getAll() {
    if (mongoose.connection.readyState !== 1) {
      return memoryPGStore;
    }
    return await PG.find().sort({ createdAt: -1 });
  }

  static async getById(id: string) {
    if (mongoose.connection.readyState !== 1) {
      return memoryPGStore.find((p) => (p._id as any).toString() === id || p.code === id) || null;
    }
    return await PG.findById(id);
  }

  static async create(data: any) {
    const code = data.code || `#PG-BH-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
      code,
      name: data.name,
      gender: data.gender || 'BOYS',
      images: data.photos || data.images || [],
      verified: data.verified ?? true,
      corridor: data.corridor || '',
      distance: data.distance || '',
      landlordName: data.landlordName || '',
      landlordPhone: data.landlordPhone || '',
      kycStatus: data.kycStatus || 'Pending Verification',
      occupiedBeds: Number(data.occupiedBeds || 0),
      totalBeds: Number(data.totalBeds || 0),
      vacantBeds: Number(data.vacantBeds || data.totalBeds || 0),
      roomMatrix: data.roomMatrix || '',
      monthlyRent: Number(data.monthlyRent || 0),
      deposit: Number(data.deposit || 0),
      amenities: data.amenities || [],
      curfew: data.curfew || '',
      status: data.status || 'active',
      location: {
        address: data.address || `${data.landmark || ''}, ${data.city || ''}`.trim(),
        landmark: data.landmark || '',
        city: data.city || '',
        state: data.state || 'Chhattisgarh',
        pincode: data.pincode || '',
        latitude: Number(data.latitude || 0),
        longitude: Number(data.longitude || 0),
      },
    };

    if (mongoose.connection.readyState !== 1) {
      const mockDoc: any = {
        _id: 'pg_' + Date.now(),
        ...payload,
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryPGStore.unshift(mockDoc);
      return mockDoc;
    }

    return await PG.create(payload);
  }

  static async update(id: string, data: any) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryPGStore.findIndex((p) => (p._id as any).toString() === id);
      if (idx !== -1) {
        memoryPGStore[idx] = { ...memoryPGStore[idx], ...data, updatedAt: new Date() };
        return memoryPGStore[idx];
      }
      return null;
    }
    return await PG.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id: string) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryPGStore.findIndex((p) => (p._id as any).toString() === id);
      if (idx !== -1) {
        memoryPGStore.splice(idx, 1);
        return true;
      }
      return false;
    }
    await PG.findByIdAndDelete(id);
    return true;
  }
}
