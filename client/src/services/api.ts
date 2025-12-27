import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

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

// Response interceptor - Handle errors globally and refresh tokens
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('admin_refresh_token');

      // If no refresh token, redirect to login
      if (!refreshToken) {
        localStorage.removeItem('admin_jwt_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await api.post<{
          success: boolean;
          data: { token: string };
        }>('/auth/refresh', {
          refreshToken,
        });

        const { token: newToken } = response.data.data;

        // Store new token
        localStorage.setItem('admin_jwt_token', newToken);

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Process queued requests
        processQueue(null, newToken);

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem('admin_jwt_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
