import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import * as apiService from '@/utils/apiService';
import { isNotEmpty } from '@/app/utils/validationUtils';

// Define network profile types
export type NetworkProfile = 'OFFICE' | 'HOME' | 'LOCALHOST' | 'PROD';

// Define network item for list
export interface NetworkItem {
  id: NetworkProfile;
  name: string;
  url: string;
}

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuth();
  
  // Set up the API URL based on the active network on mount
  useEffect(() => {
    const initializeApiUrl = async () => {
      const activeNetwork = await storage.getItem(Config.STORAGE_KEYS.ACTIVE_NETWORK);
      if (activeNetwork && Object.keys(Config.NETWORK_PROFILES).includes(activeNetwork)) {
        const apiUrl = Config.NETWORK_PROFILES[activeNetwork as keyof typeof Config.NETWORK_PROFILES];
        apiService.setBaseURL(apiUrl);
        console.log(`[useLogin] Initialized API URL to ${apiUrl}`);
      } else {
        // Default to the Config.API_URL which is environment-dependent
        apiService.setBaseURL(Config.API_URL);
        console.log(`[useLogin] Initialized API URL to ${Config.API_URL}`);
      }
    };

    initializeApiUrl();
  }, []);
  
  // Get current API URL
  const getApiUrl = async () => {
    // Check if there's a stored network preference
    const activeNetwork = await storage.getItem(Config.STORAGE_KEYS.ACTIVE_NETWORK);
    let apiUrl = Config.API_URL;
    
    if (activeNetwork && Object.keys(Config.NETWORK_PROFILES).includes(activeNetwork)) {
      apiUrl = Config.NETWORK_PROFILES[activeNetwork as keyof typeof Config.NETWORK_PROFILES];
    }
    
    console.log(`[useLogin] Using API URL: ${apiUrl}`);
    return apiUrl;
  };

  // Handle login button press
  const handleLogin = async () => {
    if (!isNotEmpty(email) || !isNotEmpty(password)) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const apiUrl = await getApiUrl();
      console.log(`[useLogin] Attempting login with API URL: ${apiUrl}`);
      
      // Ensure API service is using the correct URL
      apiService.setBaseURL(apiUrl);
      
      // This will use the API URL that was set by NetworkSelector
      await login(email, password);
      
      // If successful, the auth context will update and redirect
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // Quick developer login
  const quickDevLogin = async () => {
    try {
      const apiUrl = await getApiUrl();
      console.log(`[useLogin] Attempting quick dev login with API URL: ${apiUrl}`);
      
      // Ensure API service is using the correct URL
      apiService.setBaseURL(apiUrl);
      
      await login('test@example.com', 'password123');
    } catch (err) {
      console.error('Quick login error:', err);
    }
  };

  // Test connection to the backend
  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const apiUrl = await getApiUrl();
      console.log(`[useLogin] Testing connection to: ${apiUrl}`);
      
      const response = await apiService.testConnection(apiUrl);
      
      Alert.alert(
        'Connection Status', 
        `Connected to server successfully!\n\nServer status: ${response.status}\nMongoDB: ${response.mongodb}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Connection test error:', error);
      
      let errorMessage = 'Could not connect to server. ';
      
      if (error.response) {
        errorMessage += `Server responded with status ${error.response.status}.`;
      } else if (error.request) {
        errorMessage += 'No response received from server. Check your network connection and server status.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      Alert.alert('Connection Failed', errorMessage, [
        { text: 'OK' }
      ]);
    } finally {
      setTestingConnection(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    testingConnection,
    handleLogin,
    quickDevLogin,
    testConnection,
    getApiUrl
  };
} 