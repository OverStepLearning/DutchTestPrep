import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { AxiosError, AxiosResponse } from 'axios';
import Config from '@/constants/Config';

// Define context interface for type safety
interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
    username?: string;
    [key: string]: any;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

// Initialize Sentry
// Replace the DSN below with your own DSN from the Sentry dashboard
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE', // You'll need to replace this with your actual Sentry DSN
  enableAutoSessionTracking: true,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  tracesSampleRate: 1.0,
  // Enable performance monitoring for React Native
  enableNativeNagger: true,
  // Add version information from Config
  release: Config.VERSION,
  dist: Config.buildNumber,
  // Set environment based on production/development mode
  environment: process.env.NODE_ENV || 'development',
  beforeSend(event) {
    // Add any custom logic to modify events before they're sent
    return event;
  },
});

// Function to capture exceptions with additional context
export const captureException = (error: any, context: ErrorContext = {}) => {
  Sentry.withScope((scope) => {
    // Add user context if available
    if (context.user) {
      scope.setUser(context.user);
    }
    
    // Add custom tags
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, String(value));
      });
    }
    
    // Add extra data
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    Sentry.captureException(error);
  });
};

// Function to log API calls for debugging
export const logAPICall = (
  endpoint: string, 
  params: any, 
  response: AxiosResponse | null, 
  error: AxiosError | null = null
) => {
  if (error) {
    Sentry.addBreadcrumb({
      category: 'api',
      message: `API Error: ${endpoint}`,
      data: {
        endpoint,
        params,
        error: error.message || 'Unknown error',
        statusCode: error.response?.status,
        responseData: error.response?.data,
      },
      level: 'error',
    });
    
    // Also capture as a specific error event
    captureException(error, {
      extra: {
        endpoint,
        params,
        response: error.response?.data,
      },
      tags: {
        api_endpoint: endpoint,
        status_code: error.response?.status ? error.response.status.toString() : 'unknown',
      },
    });
  } else {
    Sentry.addBreadcrumb({
      category: 'api',
      message: `API Call: ${endpoint}`,
      data: {
        endpoint,
        params,
        statusCode: response?.status,
      },
      level: 'info',
    });
  }
};

export default Sentry; 