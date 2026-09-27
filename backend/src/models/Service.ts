import mongoose, { Schema, Document } from 'mongoose';

export type ServiceCategory =
  | 'PG'
  | 'MEALS'
  | 'LAUNDRY'
  | 'CLEANING'
  | 'WATER'
  | 'ELECTRICIAN'
  | 'PLUMBER'
  | 'INTERNET'
  | 'VEHICLE'
  | 'CUSTOM'
  | 'GENERAL'
  | string;

export interface IService extends Document {
  code?: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  description?: string;
  basePrice: number;
  priceUnit: string;
  providerName?: string;
  providerPhone?: string;
  corridor?: string;
  rating?: number;
  reviewCount?: number;
  images: string[];
  location?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    code: { type: String },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    category: { type: String, default: 'CLEANING' },
    description: { type: String },
    basePrice: { type: Number, required: true, min: 0 },
    priceUnit: { type: String, default: 'per session' },
    providerName: { type: String, default: '' },
    providerPhone: { type: String, default: '' },
    corridor: { type: String, default: '' },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    images: [{ type: String }],
    location: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service = mongoose.model<IService>('Service', ServiceSchema);

