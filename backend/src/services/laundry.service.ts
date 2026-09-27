import mongoose from 'mongoose';
import { LaundryProvider, ILaundryProvider } from '../models/LaundryProvider.js';

// In-memory store starts EMPTY (No seed or dummy business data)
const memoryLaundryStore: ILaundryProvider[] = [];

export class LaundryService {
  static async getAll() {
    if (mongoose.connection.readyState !== 1) {
      return memoryLaundryStore;
    }
    return await LaundryProvider.find().sort({ createdAt: -1 });
  }

  static async getById(id: string) {
    if (mongoose.connection.readyState !== 1) {
      return memoryLaundryStore.find((l) => (l._id as any).toString() === id || l.code === id) || null;
    }
    return await LaundryProvider.findById(id);
  }

  static async create(data: any) {
    const code = data.code || `#LND-BH-${Math.floor(100 + Math.random() * 900)}`;
    const payload = {
      code,
      name: data.name,
      ownerName: data.ownerName || '',
      phone: data.phone || '',
      email: data.email || '',
      description: data.description || '',
      images: data.photos || data.images || [],
      services: data.servicesOffered
        ? data.servicesOffered.map((s: string) => ({ name: s, pricingType: 'per_kg', price: data.pricePerKg || 40, unit: 'kg' }))
        : [{ name: 'Wash & Fold', pricingType: 'per_kg', price: data.pricePerKg || 40, unit: 'kg' }],
      pricePerKg: Number(data.pricePerKg || 0),
      steamIronPerPc: Number(data.steamIronPerPc || 0),
      turnaroundHours: Number(data.turnaroundHours || 24),
      corridor: data.corridor || '',
      location: {
        address: data.address || `${data.landmark || ''}, ${data.city || ''}`.trim(),
        landmark: data.landmark || '',
        city: data.city || '',
        state: data.state || 'Chhattisgarh',
        pincode: data.pincode || '',
        latitude: Number(data.latitude || 0),
        longitude: Number(data.longitude || 0),
      },
      status: data.status || 'active',
    };

    if (mongoose.connection.readyState !== 1) {
      const mockDoc: any = {
        _id: 'lnd_' + Date.now(),
        ...payload,
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryLaundryStore.unshift(mockDoc);
      return mockDoc;
    }

    return await LaundryProvider.create(payload);
  }

  static async update(id: string, data: any) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryLaundryStore.findIndex((l) => (l._id as any).toString() === id);
      if (idx !== -1) {
        memoryLaundryStore[idx] = { ...memoryLaundryStore[idx], ...data, updatedAt: new Date() };
        return memoryLaundryStore[idx];
      }
      return null;
    }
    return await LaundryProvider.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id: string) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryLaundryStore.findIndex((l) => (l._id as any).toString() === id);
      if (idx !== -1) {
        memoryLaundryStore.splice(idx, 1);
        return true;
      }
      return false;
    }
    await LaundryProvider.findByIdAndDelete(id);
    return true;
  }
}
