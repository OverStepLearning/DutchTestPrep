import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import Config from '@/constants/Config';

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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
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
        const storedToken = await SecureStore.getItemAsync(Config.STORAGE_KEYS.AUTH_TOKEN);
        if (storedToken) {
          setToken(storedToken);
          const storedUserData = await SecureStore.getItemAsync(Config.STORAGE_KEYS.USER_DATA);
          if (storedUserData) {
            setUser(JSON.parse(storedUserData));
          } else {
            // If we have a token but no user data, fetch user data
            await fetchCurrentUser(storedToken);
          }
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Fetch current user data from API
  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await axios.get(`${Config.API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        await SecureStore.setItemAsync(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
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
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${Config.API_URL}/api/auth/login`, {
        email,
        password
      });

      // Check if successful response from backend
      const data = response.data;
      if (data && data._id) {
        const newToken = data.token;
        const userData = {
          _id: data._id,
          name: data.name,
          email: data.email,
          hasCompletedOnboarding: data.hasCompletedOnboarding || false
        };
        
        // Save token and user data
        await SecureStore.setItemAsync(Config.STORAGE_KEYS.AUTH_TOKEN, newToken);
        await SecureStore.setItemAsync(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
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
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${Config.API_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      // Check if successful response from backend
      const data = response.data;
      if (data && data._id) {
        const newToken = data.token;
        const userData = {
          _id: data._id,
          name: data.name,
          email: data.email,
          hasCompletedOnboarding: false
        };
        
        // Save token and user data
        await SecureStore.setItemAsync(Config.STORAGE_KEYS.AUTH_TOKEN, newToken);
        await SecureStore.setItemAsync(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
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
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      // Clear secure storage
      await SecureStore.deleteItemAsync(Config.STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(Config.STORAGE_KEYS.USER_DATA);
      
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

  // Set onboarding as complete
  const setOnboardingComplete = async () => {
    if (!user) return;
    
    try {
      // Update local user data
      const updatedUser = { ...user, hasCompletedOnboarding: true };
      setUser(updatedUser);
      
      // Save to secure storage
      await SecureStore.setItemAsync(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      // Update on server (if needed)
      // This would typically be handled by the preferences API
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };

  // Provide the auth context
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

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 