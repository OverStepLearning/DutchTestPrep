import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Config from '@/constants/Config';
import * as Sentry from '@sentry/react-native';
import { logAPICall } from '../sentry';
import { router } from 'expo-router';
import { storage } from '@/utils/storage';

// Create axios instance with default config
const api = axios.create({
  baseURL: Config.API_URL,
  timeout: Config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type for request params
interface RequestParams {
  [key: string]: any;
}

// Function to set auth token for all requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Log successful token setting
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'Auth token set',
      level: 'info',
    });
  } else {
    delete api.defaults.headers.common['Authorization'];
    // Log token removal
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'Auth token removed',
      level: 'info',
    });
  }
};

// Function to set base URL (for network switching)
export const setBaseURL = (url: string) => {
  // Log base URL change for debugging network issues
  Sentry.addBreadcrumb({
    category: 'network',
    message: `API base URL changed`,
    data: {
      oldURL: api.defaults.baseURL,
      newURL: url,
    },
    level: 'info',
  });
  
  api.defaults.baseURL = url;
};

// Function to get current base URL
export const getBaseURL = (): string => {
  return api.defaults.baseURL || Config.API_URL;
};

// Generic GET request with error tracking
export const get = async <T = any>(
  endpoint: string, 
  params?: RequestParams, 
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.get<T>(endpoint, { 
      params, 
      ...config 
    });
    
    // Log successful API call
    logAPICall(endpoint, params, response);
    
    return response.data;
  } catch (error) {
    // Log error to Sentry
    const axiosError = error as AxiosError;
    logAPICall(endpoint, params, null, axiosError);
    throw error;
  }
};

// Generic POST request with error tracking
export const post = async <T = any>(
  endpoint: string, 
  data?: RequestParams, 
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    // Enhanced debugging
    console.log(`[API] POST request to ${endpoint} with API URL: ${api.defaults.baseURL}`);
    console.log(`[API] Auth header present: ${!!api.defaults.headers.common['Authorization']}`);
    if (api.defaults.headers.common['Authorization']) {
      const token = api.defaults.headers.common['Authorization'].toString().substring(0, 20) + '...';
      console.log(`[API] Token begins with: ${token}`);
    }
    
    // Special tracking for auth endpoints to debug TestFlight issues
    if (endpoint.includes('/api/auth/')) {
      Sentry.addBreadcrumb({
        category: 'auth',
        message: `Auth endpoint called: ${endpoint}`,
        data: {
          apiUrl: api.defaults.baseURL,
          hasAuthHeader: !!api.defaults.headers.common['Authorization'],
          email: data?.email ? '***@***.com' : undefined, // Redacted for privacy
        },
        level: 'info',
      });
      
      // Add special context for auth requests
      try {
        Sentry.setContext('auth_request', {
          endpoint,
          baseURL: api.defaults.baseURL,
          timestamp: new Date().toISOString(),
        });
      } catch (sentryError) {
        console.error('Error setting Sentry context:', sentryError);
      }
    }
    
    // Special case for practice-related API calls
    if (endpoint.includes('/api/practice/')) {
      // Log more details for practice endpoints
      console.log(`[API] Practice endpoint call to ${endpoint}`);
      
      // For submit endpoint, log more details
      if (endpoint === '/api/practice/submit') {
        console.log(`[API] Submitting answer for practice ID: ${data?.practiceId}`);
        
        // Use the known working user ID if specified
        if (data && data.practiceId) {
          // This is our "known good" user ID - for testing only
          const knownWorkingUserId = '67df248d0773c33527788355';
          
          // Uncomment the next line to force using the working ID for testing
          // data.forceUserId = knownWorkingUserId;
          
          console.log(`[API] Submitting with practice ID: ${data.practiceId}`);
        }
        
        // Set a longer timeout for submit since it involves AI evaluation
        config = {
          ...config,
          timeout: 60000 // 60 seconds timeout for submit - AI generation can take time
        };
        
        console.log(`[API] Using extended timeout of 60 seconds for submission`);
      }
      
    }
    
    console.log(`[API] Request data:`, JSON.stringify(data).substring(0, 100) + (JSON.stringify(data).length > 100 ? '...' : ''));
    
    // Log the full request URL for debugging
    const fullUrl = (api.defaults.baseURL || '') + endpoint;
    console.log(`[API] Full request URL: ${fullUrl}`);
    
    const response: AxiosResponse<T> = await api.post<T>(endpoint, data, config);
    
    console.log(`[API] POST response status: ${response.status}`);
    
    // For practice/submit endpoint, log more detailed response
    if (endpoint === '/api/practice/submit') {
      const responseData = response.data as Record<string, any>;
      console.log(`[API] Submit response success: ${responseData?.success ? 'true' : 'false'}`);
      console.log(`[API] Submit response has feedback: ${responseData?.feedback ? 'true' : 'false'}`);
      // Log the full response structure to debug the issue
      console.log(`[API] Full submit response structure:`, JSON.stringify(responseData).substring(0, 500));
    }
    
    // For auth endpoints, log detailed response info (without sensitive data)
    if (endpoint.includes('/api/auth/')) {
      const authResponse = response.data as Record<string, any>;
      Sentry.addBreadcrumb({
        category: 'auth',
        message: `Auth endpoint success: ${endpoint}`,
        data: {
          status: response.status,
          hasToken: !!authResponse.token,
          hasUserData: !!authResponse._id,
        },
        level: 'info',
      });
    }
    
    // Log successful API call
    logAPICall(endpoint, data, response);
    
    return response.data;
  } catch (error) {
    // Log error to Sentry and console
    const axiosError = error as AxiosError;
    
    console.error(`[API] Error on POST to ${endpoint}:`, {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      message: axiosError.message,
      fullUrl: (api.defaults.baseURL || '') + endpoint
    });
    
    // Special handling for auth endpoint errors
    if (endpoint.includes('/api/auth/')) {
      console.error(`[API] Auth error details:`, {
        endpoint,
        status: axiosError.response?.status,
        message: axiosError.message,
      });
      
      // Capture extra details for auth failures
      Sentry.captureException(axiosError, {
        tags: {
          api_endpoint: endpoint,
          status_code: axiosError.response?.status?.toString() || 'unknown',
        },
        extra: {
          apiUrl: api.defaults.baseURL,
          responseData: axiosError.response?.data,
          hasAuthHeader: !!api.defaults.headers.common['Authorization'],
        }
      });
    }
    
    // Special handling for specific endpoint errors
    if (endpoint === '/api/practice/generate' && 
        axiosError.response?.status === 404 && 
        axiosError.response?.data && 
        (axiosError.response.data as any).message === 'User preferences not found') {
      console.log('[API] User preferences not found - this likely means onboarding is incomplete');
    }
    
    // Special handling for submit errors
    if (endpoint === '/api/practice/submit') {
      console.error('[API] Submit error details:', {
        practiceId: data?.practiceId,
        error: axiosError.message,
        response: axiosError.response?.data
      });
    }
    
    logAPICall(endpoint, data, null, axiosError);
    throw error;
  }
};

// Generic PUT request with error tracking
export const put = async <T = any>(
  endpoint: string, 
  data?: RequestParams, 
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.put<T>(endpoint, data, config);
    
    // Log successful API call
    logAPICall(endpoint, data, response);
    
    return response.data;
  } catch (error) {
    // Log error to Sentry
    const axiosError = error as AxiosError;
    logAPICall(endpoint, data, null, axiosError);
    throw error;
  }
};

// Generic DELETE request with error tracking
export const del = async <T = any>(
  endpoint: string, 
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.delete<T>(endpoint, config);
    
    // Log successful API call
    logAPICall(endpoint, {}, response);
    
    return response.data;
  } catch (error) {
    // Log error to Sentry
    const axiosError = error as AxiosError;
    logAPICall(endpoint, {}, null, axiosError);
    throw error;
  }
};

// Function to test connection to the backend
export const testConnection = async (apiUrl: string): Promise<{ status: string; mongodb?: string }> => {
  try {
    const response = await axios.get(`${apiUrl}/health`, {
      timeout: 5000
    });
    
    // Log successful connection test
    logAPICall(`${apiUrl}/health`, {}, response);
    
    return response.data;
  } catch (error) {
    // Log error to Sentry
    const axiosError = error as AxiosError;
    logAPICall(`${apiUrl}/health`, {}, null, axiosError);
    throw error;
  }
};

// Add axios response interceptor to handle token expiration
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    // Check if error is due to token expiration
    if (error.response?.status === 401 && 
        error.response?.data && 
        ((error.response.data as any)?.message === 'Not authorized, token failed' || 
         (error.message && error.message.includes('jwt expired')))) {
      
      console.log('[API] Token expired or invalid, logging out user');
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'Token expired, automatic logout triggered',
        level: 'info',
      });

      try {
        // Clear auth token in API service
        delete api.defaults.headers.common['Authorization'];
        
        // Clear secure storage
        await storage.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
        await storage.removeItem(Config.STORAGE_KEYS.USER_DATA);
        
        // Navigate to login
        router.replace({
          pathname: '/login',
          params: { reason: 'session_expired' }
        });
      } catch (logoutError) {
        console.error('Error during automatic logout:', logoutError);
        Sentry.captureException(logoutError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default {
  get,
  post,
  put,
  del,
  setAuthToken,
  setBaseURL,
  getBaseURL,
  testConnection
}; 