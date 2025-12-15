import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('admin_jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_jwt_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Forbidden: Insufficient permissions');
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error: Please check your connection');
    }

    return Promise.reject(error);
  }
);

// API helper methods
export const apiClient = {
  get: <T>(url: string, config = {}) => api.get<T>(url, config),
  post: <T>(url: string, data = {}, config = {}) => api.post<T>(url, data, config),
  put: <T>(url: string, data = {}, config = {}) => api.put<T>(url, data, config),
  patch: <T>(url: string, data = {}, config = {}) => api.patch<T>(url, data, config),
  delete: <T>(url: string, config = {}) => api.delete<T>(url, config),
};

export default api;
