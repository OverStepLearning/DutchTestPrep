import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import { setAuthToken, setBaseURL, getBaseURL, addTokenExpiredHandler, removeTokenExpiredHandler } from '@/utils/apiService';
import * as apiService from '@/utils/apiService';
import * as Sentry from '@sentry/react-native';
import { Alert } from 'react-native';

// Define user type
interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  hasCompletedOnboarding?: boolean;
  learningSubject?: string;
  motherLanguage?: string;
}

// Define auth context state
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string, customApiUrl?: string) => Promise<void>;
  register: (name: string, email: string, password: string, customApiUrl?: string) => Promise<void>;
  logout: () => void;
  checkOnboardingStatus: () => boolean;
  checkSubjectOnboardingStatus: (subject?: string) => Promise<boolean>;
  setOnboardingComplete: () => Promise<void>;
  updateUserData: (updates: Partial<User>) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth context provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Logout handler
  const logout = async () => {
    try {
      // Clear auth token in API service
      setAuthToken(null);
      
      // Clear secure storage
      await storage.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(Config.STORAGE_KEYS.USER_DATA);
      
      // Reset state
      setUser(null);
      setToken(null);
      
      // Navigate to login
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handler for token expiration
  const handleTokenExpiration = () => {
    console.log("[AuthContext] Token expired, logging out user");
    
    // Log out immediately
    logout();
    
    // Then show an alert to inform the user (after logout process has started)
    Alert.alert(
      "Session Expired",
      "Your session has expired. You've been logged out. Please log in again.",
      [{ text: "OK" }]
    );
  };

  // Load user data on app start
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedToken = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
        if (storedToken) {
          setToken(storedToken);
          
          // Get the active network profile if it exists
          const activeNetwork = await storage.getItem(Config.STORAGE_KEYS.ACTIVE_NETWORK);
          let apiUrl = Config.API_URL;
          
          if (activeNetwork && Object.keys(Config.NETWORK_PROFILES).includes(activeNetwork)) {
            apiUrl = Config.NETWORK_PROFILES[activeNetwork as keyof typeof Config.NETWORK_PROFILES];
            // Set the base URL to match the stored network preference
            setBaseURL(apiUrl);
            console.log(`[AuthContext] Setting API URL to ${apiUrl} from stored preference`);
          }
          
          // Set auth token for API requests
          setAuthToken(storedToken);
          
          const storedUserData = await storage.getItem(Config.STORAGE_KEYS.USER_DATA);
          if (storedUserData) {
            setUser(JSON.parse(storedUserData));
          } else {
            // If we have a token but no user data, fetch user data
            await fetchCurrentUser(storedToken);
          }
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
        // If there's an error, clear auth data to prevent persistent auth issues
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
    
    // Register token expiration handler
    addTokenExpiredHandler(handleTokenExpiration);
    
    // Clean up token expiration handler on unmount
    return () => {
      removeTokenExpiredHandler(handleTokenExpiration);
    };
  }, []);

  // Fetch current user data from API
  const fetchCurrentUser = async (authToken: string) => {
    try {
      // Make sure token is set for requests
      setAuthToken(authToken);
      
      console.log(`[AuthContext] Fetching current user using API URL: ${getBaseURL()}`);
      
      // Make the request using apiService
      const userData = await apiService.get('/api/auth/me');
      
      if (userData && userData.success) {
        const user = userData.data;
        setUser(user);
        await storage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        // Check if we need to redirect based on subject-specific onboarding
        const userLearningSubject = user.learningSubject || 'Dutch';
        console.log(`[AuthContext] User loaded, checking onboarding for subject: ${userLearningSubject}`);
        
        try {
          const preferencesResponse = await apiService.get(`/api/user/preferences?learningSubject=${userLearningSubject}`);
          
          if (!preferencesResponse || !preferencesResponse.data) {
            // No preferences for current subject, redirect to onboarding
            console.log(`[AuthContext] No preferences found for ${userLearningSubject}, should go to onboarding`);
            // Note: We don't redirect here since this might be called during app initialization
            // The app will handle redirection based on the user's navigation state
          } else {
            console.log(`[AuthContext] Preferences found for ${userLearningSubject}, user is fully onboarded`);
          }
        } catch (preferencesError) {
          console.warn(`[AuthContext] Error checking preferences during user fetch:`, preferencesError);
          // Continue with normal flow if we can't check preferences
        }
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      await logout();
    }
  };

  // Clear error message
  const clearError = () => {
    setError(null);
  };

  // Login handler
  const login = async (email: string, password: string, customApiUrl?: string) => {
    setIsLoading(true);
    try {
      // Track login attempt in Sentry for TestFlight debugging
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'Login attempt',
        data: {
          api_url: customApiUrl || getBaseURL(),
          email_provided: !!email,
          password_provided: !!password,
          timestamp: new Date().toISOString(),
        },
        level: 'info',
      });
      
      // If a custom API URL is provided, update the base URL
      if (customApiUrl) {
        setBaseURL(customApiUrl);
      }
      
      const currentApiUrl = getBaseURL();
      console.log(`[AuthContext] Attempting to login using API URL: ${currentApiUrl}`);
      
      // Additional Sentry logging for network information
      Sentry.setContext("network_info", {
        api_url: currentApiUrl,
        attempting_login: true,
        network_selector_active: !!customApiUrl,
      });
      
      // Make the request using apiService
      const data = await apiService.post('/api/auth/login', {
        email,
        password
      });

      // Check if successful response from backend
      if (data && data._id) {
        const newToken = data.token;
        const userData = {
          _id: data._id,
          name: data.name,
          email: data.email,
          hasCompletedOnboarding: data.hasCompletedOnboarding || false,
          learningSubject: data.learningSubject || 'Dutch'
        };
        
        // Save token and user data
        await storage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, newToken);
        await storage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        // Set auth token for future requests
        setAuthToken(newToken);
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
        // Check if onboarding is completed for the current learning subject
        const userLearningSubject = userData.learningSubject || 'Dutch';
        console.log(`[AuthContext] Checking onboarding for subject: ${userLearningSubject}`);
        
        try {
          // Check if preferences exist for the current learning subject
          const preferencesResponse = await apiService.get(`/api/user/preferences?learningSubject=${userLearningSubject}`);
          
          if (preferencesResponse && preferencesResponse.data) {
            // Preferences exist for this subject, go to home
            console.log(`[AuthContext] Preferences found for ${userLearningSubject}, navigating to home`);
            router.replace('/');
          } else {
            // No preferences for this subject, go to onboarding
            console.log(`[AuthContext] No preferences found for ${userLearningSubject}, navigating to onboarding`);
            router.replace('/(tabs)/onboarding');
          }
        } catch (preferencesError) {
          console.warn(`[AuthContext] Error checking preferences for ${userLearningSubject}:`, preferencesError);
          // If we can't check preferences, use the global onboarding flag as fallback
        if (userData.hasCompletedOnboarding) {
          router.replace('/');
        } else {
          router.replace('/(tabs)/onboarding');
          }
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Enhanced Sentry error tracking for login failures
      Sentry.captureException(error, {
        tags: {
          feature: 'login',
          api_url: getBaseURL(),
        },
        extra: {
          current_network: await storage.getItem(Config.STORAGE_KEYS.ACTIVE_NETWORK) || 'default',
          has_token: !!(await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN)),
          api_base_url: getBaseURL(),
        },
      });
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        // Specific error for 404 - could be API URL issue
        if (error.response.status === 404) {
          setError(`API endpoint not found (404). Please check network settings. URL: ${getBaseURL()}`);
          
          // Log specific details for 404 errors
          Sentry.captureMessage(`Login 404 error with URL: ${getBaseURL()}`, {
            level: 'error',
            extra: {
              api_url: getBaseURL(),
              network_profile: await storage.getItem(Config.STORAGE_KEYS.ACTIVE_NETWORK),
            },
          });
        } else {
          setError(error.response.data.message || `Login failed (${error.response.status})`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request error:', error.request);
        setError('Network error. Please check your connection and try again.');
        
        // Capture network errors specifically
        Sentry.captureMessage('Login network error - no response', {
          level: 'error',
          extra: {
            api_url: getBaseURL(),
            request_info: error.request._response || 'No response details',
          },
        });
      } else {
        // Something happened in setting up the request
        setError(`Request setup error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (name: string, email: string, password: string, customApiUrl?: string) => {
    setIsLoading(true);
    try {
      // If a custom API URL is provided, update the base URL
      if (customApiUrl) {
        setBaseURL(customApiUrl);
      }
      
      const currentApiUrl = getBaseURL();
      console.log(`[AuthContext] Attempting to register using API URL: ${currentApiUrl}`);
      
      // Make the request using apiService
      const data = await apiService.post('/api/auth/register', {
        name,
        email,
        password
      });

      // Check if successful response from backend
      if (data && data._id) {
        const newToken = data.token;
        const userData = {
          _id: data._id,
          name: data.name,
          email: data.email,
          hasCompletedOnboarding: false
        };
        
        // Save token and user data
        await storage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, newToken);
        await storage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        // Set auth token for future requests
        setAuthToken(newToken);
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
        // Navigate to onboarding for new users
        router.replace('/(tabs)/onboarding');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(error.response.data.message || `Registration failed (${error.response.status})`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request error:', error.request);
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request
        setError(`Request setup error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has completed onboarding
  const checkOnboardingStatus = () => {
    return user?.hasCompletedOnboarding || false;
  };

  // Check if user has completed onboarding for a specific subject
  const checkSubjectOnboardingStatus = async (subject?: string): Promise<boolean> => {
    if (!user) return false;
    
    const learningSubject = subject || user.learningSubject || 'Dutch';
    
    try {
      const preferencesResponse = await apiService.get(`/api/user/preferences?learningSubject=${learningSubject}`);
      return !!(preferencesResponse && preferencesResponse.data);
    } catch (error) {
      console.warn(`[AuthContext] Error checking subject onboarding for ${learningSubject}:`, error);
      // Fallback to global onboarding status
      return user.hasCompletedOnboarding || false;
    }
  };

  // Set onboarding as completed
  const setOnboardingComplete = async () => {
    try {
      if (user) {
        // Update user in state
        const updatedUser = {
          ...user,
          hasCompletedOnboarding: true
        };
        
        setUser(updatedUser);
        
        // Update stored user data
        await storage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        
        // Update onboarding status on server
        await apiService.put('/api/user/onboarding-complete');
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };

  // Update user data
  const updateUserData = async (updates: Partial<User>) => {
    try {
      if (user) {
        // Update user in state
        const updatedUser = {
          ...user,
          ...updates
        };
        
        setUser(updatedUser);
        
        // Update stored user data
        await storage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        clearError,
        login,
        register,
        logout,
        checkOnboardingStatus,
        checkSubjectOnboardingStatus,
        setOnboardingComplete,
        updateUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 