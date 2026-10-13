import dotenv from 'dotenv';
import path from 'path';

// Load .env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/easehub',
  JWT_SECRET: process.env.JWT_SECRET || 'easehub_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  INSFORGE_PROJECT_URL: process.env.INSFORGE_PROJECT_URL || 'http://localhost:8000',
  INSFORGE_ANON_KEY: process.env.INSFORGE_ANON_KEY || 'insforge-anon-key-placeholder',
  INSFORGE_SERVICE_ROLE_KEY: process.env.INSFORGE_SERVICE_ROLE_KEY || 'insforge-service-role-key-placeholder',
};
