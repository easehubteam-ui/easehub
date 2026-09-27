import mongoose, { Schema, Document } from 'mongoose';
import { LocationData } from './PG.js';

export interface ILaundryServiceItem {
  name: string;
  pricingType: 'per_kg' | 'per_piece' | 'flat';
  price: number;
  unit: string;
  estimatedTime?: string;
  description?: string;
}

export interface ILaundryProvider extends Document {
  code: string;
  name: string;
  ownerName: string;
  phone: string;
  email?: string;
  description?: string;
  images: string[];
  services: ILaundryServiceItem[];
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  pickupFee: number;
  deliveryFee: number;
  pickupRadius: string;
  deliveryRadius: string;
  operatingHours: string;
  pricePerKg: number;
  steamIronPerPc: number;
  turnaroundHours: number;
  corridor: string;
  location: LocationData;
  rating: number;
  reviewCount: number;
  status: 'active' | 'pending' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

const LaundryServiceItemSchema = new Schema<ILaundryServiceItem>(
  {
    name: { type: String, required: true },
    pricingType: { type: String, enum: ['per_kg', 'per_piece', 'flat'], default: 'per_kg' },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    estimatedTime: { type: String },
    description: { type: String },
  },
  { _id: false }
);

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

const LaundryProviderSchema = new Schema<ILaundryProvider>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    description: { type: String },
    images: [{ type: String }],
    services: [LaundryServiceItemSchema],
    pickupAvailable: { type: Boolean, default: true },
    deliveryAvailable: { type: Boolean, default: true },
    pickupFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    pickupRadius: { type: String, default: '5.0 km' },
    deliveryRadius: { type: String, default: '5.0 km' },
    operatingHours: { type: String, default: '8:00 AM - 8:00 PM' },
    pricePerKg: { type: Number, default: 40 },
    steamIronPerPc: { type: Number, default: 10 },
    turnaroundHours: { type: Number, default: 24 },
    corridor: { type: String, default: 'Smriti Nagar' },
    location: { type: LocationSchema, default: {} },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 140 },
    status: { type: String, enum: ['active', 'pending', 'paused'], default: 'active' },
  },
  { timestamps: true }
);

export const LaundryProvider = mongoose.model<ILaundryProvider>('LaundryProvider', LaundryProviderSchema);
