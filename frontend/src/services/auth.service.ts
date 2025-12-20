import apiClient from '../lib/api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response.data;

    // Store tokens and user
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data;

    // Store tokens and user
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  async getCurrentUser() {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  async updateProfile(data: { name?: string; avatar?: string }) {
    const response = await apiClient.put('/users/me', data);
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async forgotPassword(email: string) {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(data: { email: string; newPassword: string; resetToken: string }) {
    return apiClient.post('/auth/reset-password', data);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

