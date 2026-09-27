import { insforge } from './insforge';
import { PGLocation } from './pgApi';

export interface LaundryProvider {
  id?: string;
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

const mapLaundryFromDB = (record: any): LaundryProvider => {
  const pricing = record.pricing || {};
  return {
    id: record.id,
    _id: record.id,
    code: record.code || `LP-${record.id.slice(0, 6)}`,
    name: record.name,
    ownerName: 'EaseHub Verified Partner',
    phone: '9876543210',
    email: 'laundry@easehub.com',
    description: record.description || 'Express Wash & Steam Iron Service',
    corridor: record.city || 'Metro Area',
    distance: '0.8 km',
    rating: 4.7,
    reviewCount: 18,
    status: record.status || 'active',
    tags: ['Express Wash', 'Steam Iron', 'Doorstep Pickup'],
    pricePerKg: Number(pricing.pricePerKg) || 50,
    perKgPrice: Number(pricing.pricePerKg) || 50,
    steamIronPerPc: Number(pricing.steamIronPerPc) || 15,
    turnaroundHours: 24,
    turnaroundTime: '24 Hours Express',
    image: record.image || (Array.isArray(record.images) && record.images[0]) || '',
    images: Array.isArray(record.images) ? record.images : [],
    services: Array.isArray(record.services) ? record.services : [{ name: 'Wash & Fold' }, { name: 'Steam Iron' }],
    pickupAvailable: record.pickup_available ?? true,
    location: {
      address: record.address || '',
      landmark: record.landmark || '',
      city: record.city || '',
      state: record.state || '',
      pincode: record.pincode || '',
      latitude: Number(record.latitude) || 12.9716,
      longitude: Number(record.longitude) || 77.5946,
    },
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
};

export const laundryApi = {
  getAll: async (): Promise<LaundryProvider[]> => {
    try {
      const { data, error } = await insforge.database
        .from('laundry_providers')
        .select('*')
        .eq('is_active', true);

      if (error || !Array.isArray(data)) return [];
      return data.map(mapLaundryFromDB);
    } catch (err) {
      return [];
    }
  },
  getById: async (id: string): Promise<LaundryProvider | null> => {
    try {
      const { data } = await insforge.database
        .from('laundry_providers')
        .select('*')
        .eq('id', id);

      const record = Array.isArray(data) && data.length > 0 ? data[0] : null;
      return record ? mapLaundryFromDB(record) : null;
    } catch (err) {
      return null;
    }
  },
  create: async (data: Partial<LaundryProvider>): Promise<LaundryProvider | null> => {
    const code = data.code || `LP-${Date.now().toString().slice(-6)}`;
    const dbPayload = {
      code,
      name: data.name || 'New Laundry Hub',
      description: data.description || 'Premium Laundry & Dry Cleaning',
      image: data.image || '',
      images: data.image ? [data.image] : [],
      services: data.services || [{ name: 'Wash & Fold' }, { name: 'Steam Iron' }],
      pricing: {
        pricePerKg: data.perKgPrice || data.pricePerKg || 50,
        steamIronPerPc: data.steamIronPerPc || 15
      },
      pickup_available: data.pickupAvailable ?? true,
      delivery_available: true,
      pickup_radius: '5km',
      address: data.location?.address || '',
      landmark: data.location?.landmark || '',
      city: data.location?.city || '',
      state: data.location?.state || '',
      pincode: data.location?.pincode || '',
      latitude: data.location?.latitude || 12.9716,
      longitude: data.location?.longitude || 77.5946,
      status: data.status || 'active',
      is_active: true
    };

    await insforge.database.from('laundry_providers').insert([dbPayload]);
    const { data: created } = await insforge.database.from('laundry_providers').select('*').eq('code', code);
    const rec = Array.isArray(created) && created.length > 0 ? created[0] : null;
    return rec ? mapLaundryFromDB(rec) : null;
  },
  update: async (id: string, data: Partial<LaundryProvider>): Promise<LaundryProvider | null> => {
    const dbPayload: any = {};
    if (data.name) dbPayload.name = data.name;
    if (data.description) dbPayload.description = data.description;
    if (data.image) {
      dbPayload.image = data.image;
      dbPayload.images = [data.image];
    }
    if (data.status) dbPayload.status = data.status;
    if (data.perKgPrice || data.pricePerKg || data.steamIronPerPc) {
      dbPayload.pricing = {
        pricePerKg: data.perKgPrice || data.pricePerKg || 50,
        steamIronPerPc: data.steamIronPerPc || 15
      };
    }
    if (data.location) {
      dbPayload.address = data.location.address;
      dbPayload.landmark = data.location.landmark;
      dbPayload.city = data.location.city;
      dbPayload.state = data.location.state;
      dbPayload.pincode = data.location.pincode;
      dbPayload.latitude = data.location.latitude;
      dbPayload.longitude = data.location.longitude;
    }

    await insforge.database.from('laundry_providers').update(dbPayload).eq('id', id);
    return laundryApi.getById(id);
  },
  delete: async (id: string) => {
    await insforge.database.from('laundry_providers').update({ is_active: false }).eq('id', id);
    return { success: true };
  },
};
