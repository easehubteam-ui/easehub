import { insforge } from './insforge';
import { PGLocation } from './pgApi';

export interface ExtraServiceItem {
  id?: string;
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

const mapServiceFromDB = (record: any): ExtraServiceItem => {
  const hasLat = record.latitude !== null && record.latitude !== undefined && !isNaN(Number(record.latitude)) && Number(record.latitude) !== 0;
  const hasLng = record.longitude !== null && record.longitude !== undefined && !isNaN(Number(record.longitude)) && Number(record.longitude) !== 0;

  return {
    id: record.id,
    _id: record.id,
    code: record.slug || `SRV-${record.id.slice(0, 6)}`,
    name: record.name,
    slug: record.slug,
    category: record.category || 'General',
    description: record.description || 'Professional & Verified Service',
    basePrice: Number(record.starting_price) || 299,
    priceUnit: 'per visit',
    providerName: 'EaseHub Verified Technician',
    providerPhone: '9876543210',
    corridor: record.city || 'City Wide',
    rating: 4.9,
    reviewCount: 30,
    images: Array.isArray(record.images) && record.images.length > 0 ? record.images : (record.image ? [record.image] : []),
    isActive: record.is_active ?? true,
    location: {
      address: record.address || '',
      landmark: '',
      city: record.city || '',
      state: record.state || '',
      pincode: record.pincode || '',
      latitude: hasLat ? Number(record.latitude) : undefined,
      longitude: hasLng ? Number(record.longitude) : undefined,
    },
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
};

export const serviceApi = {
  getAll: async (): Promise<ExtraServiceItem[]> => {
    try {
      const { data, error } = await insforge.database
        .from('services')
        .select('*')
        .eq('is_active', true);

      if (error || !Array.isArray(data)) return [];
      return data.map(mapServiceFromDB);
    } catch (err) {
      return [];
    }
  },
  getServices: async (): Promise<ExtraServiceItem[]> => {
    return serviceApi.getAll();
  },
  getById: async (id: string): Promise<ExtraServiceItem | null> => {
    try {
      const { data } = await insforge.database
        .from('services')
        .select('*')
        .eq('id', id);

      const record = Array.isArray(data) && data.length > 0 ? data[0] : null;
      return record ? mapServiceFromDB(record) : null;
    } catch (err) {
      return null;
    }
  },
  create: async (data: Partial<ExtraServiceItem>): Promise<ExtraServiceItem | null> => {
    const slug = data.slug || data.code || `service-${Date.now()}`;
    const dbPayload = {
      slug,
      name: data.name || 'New Extra Service',
      description: data.description || 'Verified Home Service',
      category: data.category || 'General',
      image: Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : '',
      images: data.images || [],
      starting_price: data.basePrice || 299,
      pricing: { basePrice: data.basePrice || 299, unit: data.priceUnit || 'per visit' },
      coverage_area: data.corridor || 'City Wide',
      address: data.location?.address || '',
      city: data.location?.city || '',
      state: data.location?.state || '',
      pincode: data.location?.pincode || '',
      latitude: data.location?.latitude ?? null,
      longitude: data.location?.longitude ?? null,
      is_active: true
    };

    await insforge.database.from('services').insert([dbPayload]);
    const { data: created } = await insforge.database.from('services').select('*').eq('slug', slug);
    const rec = Array.isArray(created) && created.length > 0 ? created[0] : null;
    return rec ? mapServiceFromDB(rec) : null;
  },
  update: async (id: string, data: Partial<ExtraServiceItem>): Promise<ExtraServiceItem | null> => {
    const dbPayload: any = {};
    if (data.name) dbPayload.name = data.name;
    if (data.category) dbPayload.category = data.category;
    if (data.description) dbPayload.description = data.description;
    if (data.basePrice !== undefined) dbPayload.starting_price = data.basePrice;
    if (data.images) {
      dbPayload.images = data.images;
      dbPayload.image = data.images[0] || '';
    }
    if (data.isActive !== undefined) dbPayload.is_active = data.isActive;
    if (data.location) {
      dbPayload.address = data.location.address;
      dbPayload.city = data.location.city;
      dbPayload.state = data.location.state;
      dbPayload.pincode = data.location.pincode;
      dbPayload.latitude = data.location.latitude;
      dbPayload.longitude = data.location.longitude;
    }

    await insforge.database.from('services').update(dbPayload).eq('id', id);
    return serviceApi.getById(id);
  },
  delete: async (id: string) => {
    await insforge.database.from('services').update({ is_active: false }).eq('id', id);
    return { success: true };
  },
  updateLocation: async (id: string, location: PGLocation) => {
    await insforge.database.from('services').update({
      address: location.address,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      latitude: location.latitude,
      longitude: location.longitude,
    }).eq('id', id);
    return serviceApi.getById(id);
  },
};
