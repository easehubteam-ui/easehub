import { storageApi } from './storageApi';

export const uploadApi = {
  uploadImage: async (payload: { file?: File | Blob; base64?: string; image?: string; filename?: string }) => {
    if (payload.file) {
      const res = await storageApi.uploadPropertyImage(payload.file, payload.filename || 'upload.jpg');
      return res.url || '';
    }
    return '';
  },
};
