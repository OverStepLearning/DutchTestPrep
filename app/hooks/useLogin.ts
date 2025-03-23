import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';

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
  const [activeNetwork, setActiveNetwork] = useState<NetworkProfile>('LOCALHOST');
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuth();

  // Get available network profiles
  const networkProfiles: NetworkItem[] = Object.entries(Config.NETWORK_PROFILES).map(([key, url]) => ({
    id: key as NetworkProfile,
    name: key,
    url: url as string
  }));
  
  // Get the active API URL
  const getApiUrl = () => {
    return Config.NETWORK_PROFILES[activeNetwork] || Config.API_URL;
  };

  // Set active network and save preference
  const setNetwork = async (networkKey: NetworkProfile) => {
    setActiveNetwork(networkKey);
    
    // Save preference
    await storage.setItem(Config.STORAGE_KEYS.ACTIVE_NETWORK, networkKey);
    
    // Close modal
    setShowNetworkModal(false);
    
    // Alert the user
    Alert.alert(
      'Network Changed', 
      `Using ${networkKey} network: ${Config.NETWORK_PROFILES[networkKey]}`
    );
  };
  
  // Load network preference
  useEffect(() => {
    const loadNetworkPreference = async () => {
      const savedNetwork = await storage.getItem(Config.STORAGE_KEYS.ACTIVE_NETWORK);
      if (savedNetwork && Object.keys(Config.NETWORK_PROFILES).includes(savedNetwork)) {
        setActiveNetwork(savedNetwork as NetworkProfile);
      }
    };
    
    loadNetworkPreference();
  }, []);

  // Handle login button press
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      // Use the active API URL
      await login(email, password, getApiUrl());
      // If successful, the auth context will update and redirect
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // Quick developer login
  const quickDevLogin = async () => {
    try {
      await login('test@example.com', 'password123', getApiUrl());
    } catch (err) {
      console.error('Quick login error:', err);
    }
  };

  // Test connection to the backend
  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Use the active API URL
      const apiUrl = getApiUrl();
      console.log(`Testing connection to: ${apiUrl}`);
      
      const response = await axios.get(`${apiUrl}/health`, {
        timeout: 5000
      });
      
      Alert.alert(
        'Connection Status', 
        `Connected to server successfully!\n\nServer status: ${response.data.status}\nMongoDB: ${response.data.mongodb}`,
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
        { text: 'OK' },
        { 
          text: 'Change Network', 
          onPress: () => setShowNetworkModal(true)
        }
      ]);
    } finally {
      setTestingConnection(false);
    }
  };

  // Show error alert if authentication fails
  useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    activeNetwork,
    networkProfiles,
    showNetworkModal,
    setShowNetworkModal,
    testingConnection,
    handleLogin,
    quickDevLogin,
    testConnection,
    setNetwork,
    getApiUrl
  };
} 