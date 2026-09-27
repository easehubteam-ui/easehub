import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message || error);
    console.warn('Backend server running in fallback mode until MongoDB is started.');
  }
};
