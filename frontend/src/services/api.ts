import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Optionally attach Bearer token if stored locally
    const token = localStorage.getItem('easehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor handling 401, 403, 500 cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Clear cached token on unauthenticated error
        localStorage.removeItem('easehub_token');
      } else if (status === 403) {
        console.warn('Access Forbidden:', error.response.data?.message);
      } else if (status >= 500) {
        console.error('Server Error:', error.response.data?.message || 'Internal Server Error');
      }
    }
    return Promise.reject(error);
  }
);
