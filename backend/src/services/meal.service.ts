import mongoose from 'mongoose';
import { MealProvider, IMealProvider } from '../models/MealProvider.js';

// In-memory store starts EMPTY (No seed or dummy business data)
const memoryMealStore: IMealProvider[] = [];

export class MealService {
  static async getAll() {
    if (mongoose.connection.readyState !== 1) {
      return memoryMealStore;
    }
    return await MealProvider.find().sort({ createdAt: -1 });
  }

  static async getById(id: string) {
    if (mongoose.connection.readyState !== 1) {
      return memoryMealStore.find((m) => (m._id as any).toString() === id || m.code === id) || null;
    }
    return await MealProvider.findById(id);
  }

  static async create(data: any) {
    const code = data.code || `#ML-BH-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
      code,
      name: data.name,
      fssai: data.fssai || '',
      corridor: data.corridor || '',
      distance: data.distance || '',
      rating: 5.0,
      reviewCount: 0,
      status: data.status || 'active',
      tags: data.tags || ['Monthly Subscription'],
      dailyPrice: Number(data.dailyPrice || 0),
      monthlyPrice: Number(data.monthlyPrice || 0),
      activeTiffins: Number(data.activeTiffins || 0),
      kitchenCapacity: data.kitchenCapacity || '',
      inspectionGrade: data.inspectionGrade || 'FSSAI Verified',
      deliveryRadius: data.deliveryRadius || '',
      breakfastMenu: data.breakfastMenu || '',
      lunchMenu: data.lunchMenu || '',
      dinnerMenu: data.dinnerMenu || '',
      breakfastPrice: Number(data.breakfastPrice || 0),
      lunchPrice: Number(data.lunchPrice || 0),
      dinnerPrice: Number(data.dinnerPrice || 0),
      image: data.image || data.photos?.[0] || '',
      isVeg: data.isVeg ?? true,
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
        _id: 'ml_' + Date.now(),
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryMealStore.unshift(mockDoc);
      return mockDoc;
    }

    return await MealProvider.create(payload);
  }

  static async update(id: string, data: any) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryMealStore.findIndex((m) => (m._id as any).toString() === id);
      if (idx !== -1) {
        memoryMealStore[idx] = { ...memoryMealStore[idx], ...data, updatedAt: new Date() };
        return memoryMealStore[idx];
      }
      return null;
    }
    return await MealProvider.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id: string) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryMealStore.findIndex((m) => (m._id as any).toString() === id);
      if (idx !== -1) {
        memoryMealStore.splice(idx, 1);
        return true;
      }
      return false;
    }
    await MealProvider.findByIdAndDelete(id);
    return true;
  }
}
