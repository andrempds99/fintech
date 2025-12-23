import axios, { AxiosInstance, AxiosError } from 'axios';

// Use relative URL when served from CloudFront (same domain), otherwise use configured URL
// CloudFront serves both frontend and API from the same domain, so /api works
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Runtime detection: Check if we're being served from CloudFront or HTTPS
  // This works even if the frontend was built before this change
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If served from CloudFront (cloudfront.net domain) or any HTTPS origin, use relative URL
    if (hostname.includes('cloudfront.net') || protocol === 'https:') {
      return '/api';
    }
    
    // If served from EC2 IP directly (HTTP), use the EC2 API URL
    if (hostname === '51.44.222.179' && protocol === 'http:') {
      return `http://${hostname}/api`;
    }
  }
  
  // If no VITE_API_URL is set, check if we're in production (CloudFront)
  // In production, use relative URL since frontend and API are on same domain
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // Development default
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Use apiClient to ensure same base URL and configuration
          const response = await apiClient.post('/auth/refresh', {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

