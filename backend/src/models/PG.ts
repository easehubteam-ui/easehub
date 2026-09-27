import mongoose, { Schema, Document } from 'mongoose';

export interface LocationData {
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface IPGProperty extends Document {
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
  location: LocationData;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<LocationData>(
  {
    address: { type: String, default: '' },
    landmark: { type: String, default: '' },
    city: { type: String, default: 'Bhilai' },
    state: { type: String, default: 'Chhattisgarh' },
    pincode: { type: String, default: '490006' },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const PGSchema = new Schema<IPGProperty>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['BOYS', 'GIRLS', 'CO-ED'], default: 'BOYS' },
    images: [{ type: String }],
    verified: { type: Boolean, default: true },
    corridor: { type: String, default: 'Junwani' },
    distance: { type: String, default: '350m to BIT Gate 2' },
    landlordName: { type: String, required: true },
    landlordPhone: { type: String, required: true },
    kycStatus: { type: String, default: 'Verified' },
    occupiedBeds: { type: Number, default: 0 },
    totalBeds: { type: Number, default: 30 },
    vacantBeds: { type: Number, default: 30 },
    roomMatrix: { type: String, default: 'Double Sharing' },
    monthlyRent: { type: Number, required: true },
    deposit: { type: Number, required: true },
    amenities: [{ type: String }],
    curfew: { type: String, default: '10:30 PM Curfew' },
    status: { type: String, enum: ['active', 'pending', 'revision', 'disabled'], default: 'active' },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 94 },
    location: { type: LocationSchema, default: {} },
  },
  { timestamps: true }
);

export const PG = mongoose.model<IPGProperty>('PG', PGSchema);
