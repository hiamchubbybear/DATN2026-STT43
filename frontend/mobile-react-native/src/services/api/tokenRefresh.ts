import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Logger } from '../../shared/utils/logger';

/**
 * Specialized function to refresh tokens using a clean axios instance
 * to avoid circular dependencies with apiClient.ts
 */
export const refreshAuthToken = async (accessToken: string, refreshToken: string) => {
  const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://datn.chessy.dev';
  
  try {
    const response = await axios.post(`${baseURL}/api/auth/refresh`, {
      accessToken,
      refreshToken
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    Logger.error('[TokenRefresh] Failed to refresh token', error);
    throw error;
  }
};
