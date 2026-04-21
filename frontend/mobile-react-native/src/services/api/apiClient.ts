import axios from 'axios';
import { Logger } from '../../shared/utils/logger';
import { useAuthStore } from '../../store/authStore';

// Normalize errors to a standard format
export interface ApiError {
  message: string;
  statusCode?: number;
}

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://datn.chessy.dev',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth tokens, Log Requests
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    Logger.debug(`[API RQ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.data) {
      Logger.debug(`[API RQ Data] ${JSON.stringify(config.data, null, 2)}`);
    }
    return config;
  },
  (error) => {
    Logger.error('[API RQ Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Parse Errors, Log Responses
apiClient.interceptors.response.use(
  (response) => {
    Logger.debug(`[API RS] ${response.config.url} - Status: ${response.status}`);
    Logger.debug(`[API RS Data] ${JSON.stringify(response.data, null, 2)}`);
    return response;
  },
  (error) => {
    const errorObj: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status,
    };
    
    Logger.error(`[API RS Error] ${error.config?.url} - ${errorObj.statusCode}: ${errorObj.message}`);
    if (error.response?.data) {
      Logger.error(`[API RS Error Detail] ${JSON.stringify(error.response.data, null, 2)}`);
    }

    return Promise.reject(errorObj);
  }
);
