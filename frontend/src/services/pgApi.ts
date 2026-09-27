import { insforge } from './insforge';
import { getPublicImageUrl, BUCKETS } from './storageApi';

export interface PGLocation {
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export interface PGProperty {
  id?: string;
  _id: string;
  code: string;
  name: string;
  gender: 'BOYS' | 'GIRLS' | 'CO-ED';
  images: string[];
  verified: boolean;
  corridor?: string;
  distance?: string;
  landlordName?: string;
  landlordPhone?: string;
  kycStatus?: string;
  occupiedBeds?: number;
  totalBeds?: number;
  vacantBeds?: number;
  roomMatrix?: string;
  monthlyRent: number;
  deposit: number;
  amenities: string[];
  curfew?: string;
  status: 'active' | 'pending' | 'revision' | 'disabled';
  rating: number;
  reviewCount: number;
  location: PGLocation;
  createdAt?: string;
  updatedAt?: string;
}

const mapPGFromDB = (record: any): PGProperty => {
  const hasLat = record.latitude !== null && record.latitude !== undefined && !isNaN(Number(record.latitude)) && Number(record.latitude) !== 0;
  const hasLng = record.longitude !== null && record.longitude !== undefined && !isNaN(Number(record.longitude)) && Number(record.longitude) !== 0;
  const rawImages = Array.isArray(record.images) && record.images.length > 0 ? record.images : (record.image ? [record.image] : []);
  const normalizedImages = rawImages.map((img: string) => getPublicImageUrl(BUCKETS.PROPERTY_IMAGES, img)).filter((img: string | null): img is string => img !== null);

  return {
    id: record.id,
    _id: record.id,
    code: record.code || `PG-${record.id.slice(0, 6)}`,
    name: record.name,
    gender: record.gender || 'BOYS',
    images: normalizedImages,
    verified: true,
    corridor: record.city || 'Main',
    distance: '0.5 km',
    landlordName: 'EaseHub Verified Host',
    landlordPhone: '9999999999',
    kycStatus: 'Verified',
    occupiedBeds: 10,
    totalBeds: 20,
    vacantBeds: 10,
    roomMatrix: record.room_type || 'Single / Double Sharing',
    monthlyRent: Number(record.price) || 0,
    deposit: Number(record.security_deposit) || 0,
    amenities: Array.isArray(record.amenities) ? record.amenities : [],
    curfew: '10:30 PM',
    status: record.status || 'active',
    rating: 4.8,
    reviewCount: 12,
    location: {
      address: record.address || '',
      landmark: record.landmark || '',
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

export const pgApi = {
  getAll: async (): Promise<PGProperty[]> => {
    try {
      const { data, error } = await insforge.database
        .from('pgs')
        .select('*')
        .eq('is_active', true);

      if (error || !Array.isArray(data)) return [];
      return data.map(mapPGFromDB);
    } catch (err) {
      return [];
    }
  },
  getById: async (id: string): Promise<PGProperty | null> => {
    try {
      const { data } = await insforge.database
        .from('pgs')
        .select('*')
        .eq('id', id);

      const record = Array.isArray(data) && data.length > 0 ? data[0] : null;
      return record ? mapPGFromDB(record) : null;
    } catch (err) {
      return null;
    }
  },
  create: async (data: Partial<PGProperty>): Promise<PGProperty | null> => {
    const code = data.code || `PG-${Date.now().toString().slice(-6)}`;
    const dbPayload = {
      code,
      name: data.name || 'New PG',
      description: data.corridor || 'EaseHub Verified Accommodation',
      property_type: 'PG',
      gender: data.gender || 'BOYS',
      room_type: data.roomMatrix || 'Single / Double Sharing',
      price: data.monthlyRent || 0,
      security_deposit: data.deposit || 0,
      amenities: data.amenities || [],
      images: data.images || [],
      address: data.location?.address || '',
      landmark: data.location?.landmark || '',
      city: data.location?.city || '',
      state: data.location?.state || '',
      pincode: data.location?.pincode || '',
      latitude: data.location?.latitude ?? null,
      longitude: data.location?.longitude ?? null,
      status: data.status || 'active',
      is_active: true
    };

    await insforge.database.from('pgs').insert([dbPayload]);
    const { data: created } = await insforge.database.from('pgs').select('*').eq('code', code);
    const rec = Array.isArray(created) && created.length > 0 ? created[0] : null;
    return rec ? mapPGFromDB(rec) : null;
  },
  update: async (id: string, data: Partial<PGProperty>): Promise<PGProperty | null> => {
    const dbPayload: any = {};
    if (data.name) dbPayload.name = data.name;
    if (data.gender) dbPayload.gender = data.gender;
    if (data.monthlyRent !== undefined) dbPayload.price = data.monthlyRent;
    if (data.deposit !== undefined) dbPayload.security_deposit = data.deposit;
    if (data.amenities) dbPayload.amenities = data.amenities;
    if (data.images) dbPayload.images = data.images;
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

    await insforge.database.from('pgs').update(dbPayload).eq('id', id);
    return pgApi.getById(id);
  },
  delete: async (id: string) => {
    await insforge.database.from('pgs').update({ is_active: false }).eq('id', id);
    return { success: true };
  },
  updateLocation: async (id: string, location: PGLocation) => {
    await insforge.database.from('pgs').update({
      address: location.address,
      landmark: location.landmark,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      latitude: location.latitude,
      longitude: location.longitude,
    }).eq('id', id);
    return pgApi.getById(id);
  },
};
