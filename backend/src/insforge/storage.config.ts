/**
 * EaseHub InsForge Storage Bucket Definitions & Security Configuration
 */

export interface StorageBucketConfig {
  id: string;
  name: string;
  public: boolean;
  fileSizeLimit: number; // in bytes
  allowedMimeTypes: string[];
  description: string;
}

export const INSFORGE_STORAGE_BUCKETS: Record<string, StorageBucketConfig> = {
  PROPERTY_IMAGES: {
    id: 'property-images',
    name: 'property-images',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    description: 'Public images for PGs and hostels'
  },
  MEAL_IMAGES: {
    id: 'meal-images',
    name: 'meal-images',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    description: 'Public images for meal providers and menu banners'
  },
  LAUNDRY_IMAGES: {
    id: 'laundry-images',
    name: 'laundry-images',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    description: 'Public images for laundry services'
  },
  SERVICE_IMAGES: {
    id: 'service-images',
    name: 'service-images',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    description: 'Public images for extra services'
  },
  PAYMENT_SCREENSHOTS: {
    id: 'payment-screenshots',
    name: 'payment-screenshots',
    public: false, // Private / Authenticated read, admin review access
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'],
    description: 'Private payment verification screenshots'
  },
  USER_ASSETS: {
    id: 'user-assets',
    name: 'user-assets',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    description: 'User profile pictures and avatars'
  }
};
