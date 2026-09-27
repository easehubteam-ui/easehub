import { insforge } from './insforge';
import { PGLocation } from './pgApi';

export interface MealProvider {
  id?: string;
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

const mapMealFromDB = (record: any): MealProvider => {
  const menu = record.menu || {};
  return {
    id: record.id,
    _id: record.id,
    code: record.code || `MP-${record.id.slice(0, 6)}`,
    name: record.name,
    fssai: 'FSSAI-12345678',
    corridor: record.city || 'Central Hub',
    distance: '1.2 km',
    rating: 4.9,
    reviewCount: 24,
    status: record.status || 'active',
    tags: Array.isArray(record.meal_types) ? record.meal_types : ['Healthy', 'Home Cooked'],
    dailyPrice: Number(record.daily_price) || 120,
    monthlyPrice: Number(record.monthly_price) || 3200,
    activeTiffins: 45,
    kitchenCapacity: '100 Tiffins/Day',
    inspectionGrade: 'A+',
    deliveryRadius: '5 km',
    breakfastMenu: menu.breakfast || 'Poha / Idli + Tea',
    lunchMenu: menu.lunch || 'Roti, Dal, Sabzi, Rice',
    dinnerMenu: menu.dinner || 'Roti, Paneer Sabzi, Rice, Sweet',
    breakfastPrice: 40,
    lunchPrice: 80,
    dinnerPrice: 90,
    image: record.image || (Array.isArray(record.images) && record.images[0]) || '',
    isVeg: record.is_veg ?? true,
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

export const mealApi = {
  getAll: async (): Promise<MealProvider[]> => {
    try {
      const { data, error } = await insforge.database
        .from('meal_providers')
        .select('*')
        .eq('is_active', true);

      if (error || !Array.isArray(data)) return [];
      return data.map(mapMealFromDB);
    } catch (err) {
      return [];
    }
  },
  getById: async (id: string): Promise<MealProvider | null> => {
    try {
      const { data } = await insforge.database
        .from('meal_providers')
        .select('*')
        .eq('id', id);

      const record = Array.isArray(data) && data.length > 0 ? data[0] : null;
      return record ? mapMealFromDB(record) : null;
    } catch (err) {
      return null;
    }
  },
  create: async (data: Partial<MealProvider>): Promise<MealProvider | null> => {
    const code = data.code || `MP-${Date.now().toString().slice(-6)}`;
    const dbPayload = {
      code,
      name: data.name || 'New Meal Kitchen',
      description: data.corridor || 'Fresh & Healthy Tiffin Service',
      image: data.image || '',
      images: data.image ? [data.image] : [],
      is_veg: data.isVeg ?? true,
      meal_types: data.tags || ['North Indian', 'South Indian'],
      daily_price: data.dailyPrice || 120,
      monthly_price: data.monthlyPrice || 3200,
      menu: {
        breakfast: data.breakfastMenu || 'Idli / Dosa',
        lunch: data.lunchMenu || 'Full Meals',
        dinner: data.dinnerMenu || 'Roti Sabzi'
      },
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

    await insforge.database.from('meal_providers').insert([dbPayload]);
    const { data: created } = await insforge.database.from('meal_providers').select('*').eq('code', code);
    const rec = Array.isArray(created) && created.length > 0 ? created[0] : null;
    return rec ? mapMealFromDB(rec) : null;
  },
  update: async (id: string, data: Partial<MealProvider>): Promise<MealProvider | null> => {
    const dbPayload: any = {};
    if (data.name) dbPayload.name = data.name;
    if (data.dailyPrice !== undefined) dbPayload.daily_price = data.dailyPrice;
    if (data.monthlyPrice !== undefined) dbPayload.monthly_price = data.monthlyPrice;
    if (data.isVeg !== undefined) dbPayload.is_veg = data.isVeg;
    if (data.image) {
      dbPayload.image = data.image;
      dbPayload.images = [data.image];
    }
    if (data.status) dbPayload.status = data.status;
    if (data.location) {
      dbPayload.address = data.location.address;
      dbPayload.landmark = data.location.landmark;
      dbPayload.city = data.location.city;
      dbPayload.state = data.location.state;
      dbPayload.pincode = data.location.pincode;
      dbPayload.latitude = data.location.latitude;
      dbPayload.longitude = data.location.longitude;
    }

    await insforge.database.from('meal_providers').update(dbPayload).eq('id', id);
    return mealApi.getById(id);
  },
  delete: async (id: string) => {
    await insforge.database.from('meal_providers').update({ is_active: false }).eq('id', id);
    return { success: true };
  },
  updateLocation: async (id: string, location: PGLocation) => {
    await insforge.database.from('meal_providers').update({
      address: location.address,
      landmark: location.landmark,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      latitude: location.latitude,
      longitude: location.longitude,
    }).eq('id', id);
    return mealApi.getById(id);
  },
};
