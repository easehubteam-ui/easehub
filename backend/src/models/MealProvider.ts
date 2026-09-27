import mongoose, { Schema, Document } from 'mongoose';
import { LocationData } from './PG.js';

export interface IMealProvider extends Document {
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

const MealProviderSchema = new Schema<IMealProvider>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    fssai: { type: String, required: true },
    corridor: { type: String, default: 'Civic Center' },
    distance: { type: String, default: 'Near BIT Campus' },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 120 },
    status: { type: String, enum: ['active', 'pending', 'paused'], default: 'active' },
    tags: [{ type: String }],
    dailyPrice: { type: Number, default: 70 },
    monthlyPrice: { type: Number, default: 2400 },
    activeTiffins: { type: Number, default: 50 },
    kitchenCapacity: { type: String, default: '300 Meals/day' },
    inspectionGrade: { type: String, default: 'Grade A (95/100)' },
    deliveryRadius: { type: String, default: '4.0 km buffer' },
    breakfastMenu: { type: String, default: 'Poha, Chai' },
    lunchMenu: { type: String, default: '4 Roti, Dal, Sabzi, Rice' },
    dinnerMenu: { type: String, default: 'Roti, Dal, Sabzi, Rice' },
    breakfastPrice: { type: Number, default: 40 },
    lunchPrice: { type: Number, default: 80 },
    dinnerPrice: { type: Number, default: 80 },
    image: { type: String, default: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
    isVeg: { type: Boolean, default: true },
    location: { type: LocationSchema, default: {} },
  },
  { timestamps: true }
);

export const MealProvider = mongoose.model<IMealProvider>('MealProvider', MealProviderSchema);
