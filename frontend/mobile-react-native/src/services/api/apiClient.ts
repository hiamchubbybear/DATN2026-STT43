import axios from 'axios';
import axiosRetry from 'axios-retry';
import { Logger } from '../../shared/utils/logger';
import { useAuthStore } from '../../store/authStore';
import { refreshAuthToken } from './tokenRefresh';
import { toast } from '../../shared/services/toast';

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

// Configure automatic retries
axiosRetry(apiClient, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response?.status ? error.response.status >= 500 : false);
  },
  onRetry: (retryCount, error, requestConfig) => {
    Logger.debug(`[API] Retrying request (${retryCount}): ${requestConfig.url}`);
  }
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
   async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (Session expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { accessToken, refreshToken, updateTokens, logout } = useAuthStore.getState();

        if (accessToken && refreshToken) {
          Logger.debug('[API] Attempting to refresh token...');
          const response = await refreshAuthToken(accessToken, refreshToken);
          
          if (response.success && response.data) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
            updateTokens(newAccessToken, newRefreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        Logger.error('[API] Refresh token failed', refreshError);
        useAuthStore.getState().logout();
      }
    }

    // Determine the user-facing message
    let message = 'An unexpected error occurred. Please try again later.';
    
    if (error.response) {
      // Server responded with an error
      message = error.response.data?.message || error.response.data?.error || `Server Error (${error.response.status})`;
    } else if (error.request) {
      // Request made but no response (Network error)
      message = 'Cannot connect to the server. Please check your internet connection.';
    }

    const errorObj: ApiError = {
      message: message,
      statusCode: error.response?.status,
    };
    
    Logger.error(`[API Error] ${error.config?.url} - ${errorObj.statusCode}: ${errorObj.message}`);

    // Show global toast for non-401 errors (401 is handled above)
    if (error.response?.status !== 401) {
      toast.show({ type: 'error', title: 'API Error', message });
    }

    return Promise.reject(errorObj);
  }
);
