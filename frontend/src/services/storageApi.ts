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
    
    const { data: urlData } = insforge.storage.from(BUCKETS.PROPERTY_IMAGES).getPublicUrl(path);
    return { path, url: urlData?.publicUrl || '' };
  },

  /**
   * Upload meal image to 'meal-images' bucket (Public read)
   */
  uploadMealImage: async (file: File | Blob, fileName: string = 'meal.jpg') => {
    const path = storageApi.generatePath('meals', fileName);
    const { error } = await insforge.storage.from(BUCKETS.MEAL_IMAGES).upload(path, file);
    if (error) throw new Error(error.message || 'Failed to upload meal image');

    const { data: urlData } = insforge.storage.from(BUCKETS.MEAL_IMAGES).getPublicUrl(path);
    return { path, url: urlData?.publicUrl || '' };
  },

  /**
   * Upload laundry image to 'laundry-images' bucket (Public read)
   */
  uploadLaundryImage: async (file: File | Blob, fileName: string = 'laundry.jpg') => {
    const path = storageApi.generatePath('laundry', fileName);
    const { error } = await insforge.storage.from(BUCKETS.LAUNDRY_IMAGES).upload(path, file);
    if (error) throw new Error(error.message || 'Failed to upload laundry image');

    const { data: urlData } = insforge.storage.from(BUCKETS.LAUNDRY_IMAGES).getPublicUrl(path);
    return { path, url: urlData?.publicUrl || '' };
  },

  /**
   * Upload service image to 'service-images' bucket (Public read)
   */
  uploadServiceImage: async (file: File | Blob, fileName: string = 'service.jpg') => {
    const path = storageApi.generatePath('services', fileName);
    const { error } = await insforge.storage.from(BUCKETS.SERVICE_IMAGES).upload(path, file);
    if (error) throw new Error(error.message || 'Failed to upload service image');

    const { data: urlData } = insforge.storage.from(BUCKETS.SERVICE_IMAGES).getPublicUrl(path);
    return { path, url: urlData?.publicUrl || '' };
  },

  /**
   * Upload user avatar/asset to 'user-assets' bucket (Public read)
   */
  uploadUserAsset: async (file: File | Blob, fileName: string = 'avatar.jpg') => {
    const path = storageApi.generatePath('avatars', fileName);
    const { error } = await insforge.storage.from(BUCKETS.USER_ASSETS).upload(path, file);
    if (error) throw new Error(error.message || 'Failed to upload user avatar');

    const { data: urlData } = insforge.storage.from(BUCKETS.USER_ASSETS).getPublicUrl(path);
    return { path, url: urlData?.publicUrl || '' };
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

    const signedUrl = signedData?.signedUrl || insforge.storage.from(BUCKETS.PAYMENT_SCREENSHOTS).getPublicUrl(path).data?.publicUrl || '';
    return { path, url: signedUrl };
  },

  /**
   * Get public URL for an object in a public bucket
   */
  getPublicUrl: (bucket: string, path: string): string => {
    const { data } = insforge.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || '';
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
