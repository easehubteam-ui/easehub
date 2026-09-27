/**
 * EaseHub InsForge Storage API Service
 * Centralized file upload and storage management service.
 */
import { insforge } from './insforge';

export const BUCKETS = {
  PROPERTY_IMAGES: 'property-images',
  MEAL_IMAGES: 'meal-images',
  LAUNDRY_IMAGES: 'laundry-images',
  SERVICE_IMAGES: 'service-images',
  PAYMENT_SCREENSHOTS: 'payment-screenshots',
  USER_ASSETS: 'user-assets',
} as const;

/**
 * Centralized helper for public Storage image URLs.
 * Handles: null, undefined, empty string, single path, full URL, array of image paths.
 * Rules:
 * - If full valid URL: return as is.
 * - If storage path: convert using InsForge public storage URL.
 * - If no image: return null (UI renders a clean category placeholder).
 * - Zero Unsplash, zero random external fallbacks.
 */
export const getPublicImageUrl = (bucket: string, storedValue: any): string | null => {
  if (!storedValue) return null;

  let rawPath = '';
  if (typeof storedValue === 'string') {
    rawPath = storedValue.trim();
  } else if (Array.isArray(storedValue) && storedValue.length > 0) {
    if (typeof storedValue[0] === 'string') {
      rawPath = storedValue[0].trim();
    }
  }

  if (!rawPath) return null;

  // Filter out any leftover unsplash fallback strings
  if (rawPath.includes('unsplash.com')) {
    return null;
  }

  // If already a valid full HTTP/HTTPS/data URL, return directly
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('data:')) {
    return rawPath;
  }

  const projectUrl = (import.meta.env && import.meta.env.VITE_INSFORGE_PROJECT_URL) || 'https://rs8ysej4.us-east.insforge.app';
  const cleanPath = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
  const encodedSegments = cleanPath.split('/').map((s) => encodeURIComponent(s)).join('/');
  return `${projectUrl}/api/storage/buckets/${bucket}/objects/${encodedSegments}`;
};

export const storageApi = {
  /**
   * Helper to generate unique object paths: folder/timestamp-filename
   */
  generatePath(prefix: string, fileName: string): string {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}/${timestamp}-${random}-${cleanFileName}`;
  },

  /**
   * Upload property image to 'property-images' bucket (Public read)
   */
  uploadPropertyImage: async (file: File | Blob, fileName: string = 'property.jpg') => {
    const path = storageApi.generatePath('properties', fileName);
    const { error } = await insforge.storage.from(BUCKETS.PROPERTY_IMAGES).upload(path, file);
    if (error) throw new Error(error.message || 'Failed to upload property image');
    
    const url = getPublicImageUrl(BUCKETS.PROPERTY_IMAGES, path) || '';
    return { path, url };
  },

  /**
   * Upload meal image to 'meal-images' bucket (Public read)
   */
  uploadMealImage: async (file: File | Blob, fileName: string = 'meal.jpg') => {
    const path = storageApi.generatePath('meals', fileName);
    const { error } = await insforge.storage.from(BUCKETS.MEAL_IMAGES).upload(path, file);
    if (error) throw new Error(error.message || 'Failed to upload meal image');

    const url = getPublicImageUrl(BUCKETS.MEAL_IMAGES, path) || '';
    return { path, url };
  },

  /**
   * Upload laundry image to 'laundry-images' bucket (Public read)
   */
  uploadLaundryImage: async (file: File | Blob, fileName: string = 'laundry.jpg') => {
    const path = storageApi.generatePath('laundry', fileName);
    const { error } = await insforge.storage.from(BUCKETS.LAUNDRY_IMAGES).upload(path, file);
    if (error) throw new Error(error.message || 'Failed to upload laundry image');

    const url = getPublicImageUrl(BUCKETS.LAUNDRY_IMAGES, path) || '';
    return { path, url };
  },

  /**
   * Upload service image to 'service-images' bucket (Public read)
   */
  uploadServiceImage: async (file: File | Blob, fileName: string = 'service.jpg') => {
    const path = storageApi.generatePath('services', fileName);
    const { error } = await insforge.storage.from(BUCKETS.SERVICE_IMAGES).upload(path, file);
    if (error) throw new Error(error.message || 'Failed to upload service image');

    const url = getPublicImageUrl(BUCKETS.SERVICE_IMAGES, path) || '';
    return { path, url };
  },

  /**
   * Upload user avatar/asset to 'user-assets' bucket (Public read)
   */
  uploadUserAsset: async (file: File | Blob, fileName: string = 'avatar.jpg') => {
    const path = storageApi.generatePath('avatars', fileName);
    const { error } = await insforge.storage.from(BUCKETS.USER_ASSETS).upload(path, file);
    if (error) throw new Error(error.message || 'Failed to upload user avatar');

    const url = getPublicImageUrl(BUCKETS.USER_ASSETS, path) || '';
    return { path, url };
  },

  /**
   * Upload payment screenshot to 'payment-screenshots' bucket (PRIVATE bucket)
   * Only owning customer, admin, and superadmin can view via signed/authorized URL.
   */
  uploadPaymentScreenshot: async (file: File | Blob, fileName: string = 'receipt.jpg') => {
    const path = storageApi.generatePath('payments', fileName);
    const { error } = await insforge.storage.from(BUCKETS.PAYMENT_SCREENSHOTS).upload(path, file);
    if (error) throw new Error(error.message || 'Failed to upload payment screenshot');

    // Generate signed access URL (valid for 1 hour = 3600 seconds)
    const { data: signedData } = await insforge.storage
      .from(BUCKETS.PAYMENT_SCREENSHOTS)
      .createSignedUrl(path, 3600);

    const signedUrl = signedData?.signedUrl || getPublicImageUrl(BUCKETS.PAYMENT_SCREENSHOTS, path) || '';
    return { path, url: signedUrl };
  },

  /**
   * Get public URL for an object in a public bucket
   */
  getPublicUrl: (bucket: string, path: string): string => {
    return getPublicImageUrl(bucket, path) || '';
  },

  /**
   * Create signed URL for private object (e.g., payment screenshot)
   */
  getSignedUrl: async (bucket: string, path: string, expiresIn: number = 3600): Promise<string> => {
    const { data, error } = await insforge.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) {
      throw new Error(error?.message || 'Failed to generate signed URL');
    }
    return data.signedUrl;
  },

  /**
   * Remove file from bucket
   */
  removeFile: async (bucket: string, path: string) => {
    const { data, error } = await insforge.storage.from(bucket).remove([path]);
    if (error) throw new Error(error.message);
    return data;
  }
};
