import { apiClient } from './apiClient';
import { getDeviceInfo } from '../../shared/utils/deviceUtils';

export const authService = {
  login: async (email: string, password: string) => {
    const deviceInfo = getDeviceInfo();
    const response = await apiClient.post('/api/auth/login', { 
      email, 
      password,
      ...deviceInfo
    });
    return response.data;
  },

  register: async (username: string, email: string, password: string) => {
    const response = await apiClient.post('/api/auth/register', { username, email, password });
    return response.data;
  },

  verifyEmail: async (email: string, token: string) => {
    const response = await apiClient.post('/api/auth/verify-email', { email, token });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email: string, token: string, newPassword: string) => {
    const response = await apiClient.post('/api/auth/reset-password', {
      email,
      resetToken: token,
      newPassword
    });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await apiClient.post('/api/auth/resend-verification', { email });
    return response.data;
  },
  
  verifyResetToken: async (email: string, token: string) => {
    const response = await apiClient.post('/api/auth/verify-reset-token', { email, token });
    return response.data;
  },

  googleLogin: async (idToken: string) => {
    const deviceInfo = getDeviceInfo();
    const response = await apiClient.post('/api/auth/google-login', { 
      idToken,
      ...deviceInfo
    });
    return response.data;
  },

  refreshToken: async (accessToken: string, refreshToken: string) => {
    const response = await apiClient.post('/api/auth/refresh', { accessToken, refreshToken });
    return response.data;
  },

  changePassword: async (email: string, oldPassword: string, newPassword: string) => {
    const response = await apiClient.patch('/api/auth/change-password', { email, oldPassword, newPassword });
    return response.data;
  },

  deleteAccount: async (email: string) => {
    const response = await apiClient.delete('/api/auth/delete-account', { data: { email } });
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await apiClient.post('/api/auth/logout', { refreshToken });
    return response.data;
  }
};
