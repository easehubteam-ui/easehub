import mongoose from 'mongoose';
import { Service, IService } from '../models/Service.js';

// In-memory store starts EMPTY (No seed or dummy business data)
const memoryServiceStore: IService[] = [];

export class ExtraService {
  static async getAll() {
    if (mongoose.connection.readyState !== 1) {
      return memoryServiceStore;
    }
    return await Service.find().sort({ createdAt: -1 });
  }

  static async getById(id: string) {
    if (mongoose.connection.readyState !== 1) {
      return memoryServiceStore.find((s) => (s._id as any).toString() === id || (s as any).code === id) || null;
    }
    return await Service.findById(id);
  }

  static async create(data: any) {
    const code = data.code || `#SV-BH-${Math.floor(1000 + Math.random() * 9000)}`;
    const slug = data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `service-${Date.now()}`;

    const payload = {
      code,
      name: data.name,
      slug,
      category: data.category || 'GENERAL',
      description: data.description || '',
      basePrice: Number(data.basePrice || 0),
      priceUnit: data.priceUnit || 'per session',
      providerName: data.providerName || '',
      providerPhone: data.providerPhone || '',
      corridor: data.corridor || '',
      rating: 5.0,
      reviewCount: 0,
      images: data.photos || data.images || [],
      isActive: data.isActive ?? true,
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
        _id: 'sv_' + Date.now(),
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryServiceStore.unshift(mockDoc);
      return mockDoc;
    }

    return await Service.create(payload);
  }

  static async update(id: string, data: any) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryServiceStore.findIndex((s) => (s._id as any).toString() === id);
      if (idx !== -1) {
        memoryServiceStore[idx] = { ...memoryServiceStore[idx], ...data, updatedAt: new Date() };
        return memoryServiceStore[idx];
      }
      return null;
    }
    return await Service.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id: string) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryServiceStore.findIndex((s) => (s._id as any).toString() === id);
      if (idx !== -1) {
        memoryServiceStore.splice(idx, 1);
        return true;
      }
      return false;
    }
    await Service.findByIdAndDelete(id);
    return true;
  }
}
