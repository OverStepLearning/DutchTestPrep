import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import { setAuthToken, setBaseURL, getBaseURL } from '@/utils/apiService';
import * as apiService from '@/utils/apiService';

// Define user type
interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  hasCompletedOnboarding?: boolean;
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
  setOnboardingComplete: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth context provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setUser(userData.data);
        await storage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData.data));
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
      // If a custom API URL is provided, update the base URL
      if (customApiUrl) {
        setBaseURL(customApiUrl);
      }
      
      const currentApiUrl = getBaseURL();
      console.log(`[AuthContext] Attempting to login using API URL: ${currentApiUrl}`);
      
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
          hasCompletedOnboarding: data.hasCompletedOnboarding || false
        };
        
        // Save token and user data
        await storage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, newToken);
        await storage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        // Set auth token for future requests
        setAuthToken(newToken);
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
        // Navigate based on onboarding status
        if (userData.hasCompletedOnboarding) {
          router.replace('/');
        } else {
          router.replace('/(tabs)/onboarding');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(error.response.data.message || `Login failed (${error.response.status})`);
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

  // Check if user has completed onboarding
  const checkOnboardingStatus = () => {
    return user?.hasCompletedOnboarding || false;
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
        setOnboardingComplete
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