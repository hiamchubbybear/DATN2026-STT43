import axios from 'axios';
import { Logger } from '../../shared/utils/logger';
import { toast } from '../../shared/services/toast';

// Normalize errors to a standard format
export interface ApiError {
  message: string;
  statusCode?: number;
}

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5017',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth tokens, Log Requests
apiClient.interceptors.request.use(
  (config) => {
    // e.g. const token = useAuthStore.getState().token;
    // if (token) config.headers.Authorization = `Bearer ${token}`; // (example)
    Logger.debug(`[API RQ] ${config.method?.toUpperCase()} ${config.url}`);
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
    return response;
  },
  (error) => {
    const errorObj: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status,
    };
    
    Logger.error(`[API Error] ${error.config?.url} - ${errorObj.statusCode}: ${errorObj.message}`);
    if (error.response?.status !== 401) {
      toast.show({ type: 'error', title: 'API Error', message: errorObj.message });
    }

    return Promise.reject(errorObj);
  }
);
