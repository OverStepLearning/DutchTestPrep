import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Switch,
  Alert
} from 'react-native';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import { setBaseURL, setAuthToken } from '@/utils/apiService';
import { useAuth } from '@/contexts/AuthContext';
import * as apiService from '@/utils/apiService';

export function NetworkSelector() {
  const [useProduction, setUseProduction] = useState(false);
  const { logout } = useAuth();
  
  // Load stored preference on mount
  useEffect(() => {
    const loadNetworkPreference = async () => {
      try {
        const savedNetwork = await storage.getItem(Config.STORAGE_KEYS.ACTIVE_NETWORK);
        if (savedNetwork === 'PROD') {
          setUseProduction(true);
          const prodUrl = Config.NETWORK_PROFILES.PROD;
          console.log(`[NetworkSelector] Setting API URL to PROD: ${prodUrl}`);
          setBaseURL(prodUrl);
        } else {
          const localUrl = Config.NETWORK_PROFILES.LOCALHOST;
          console.log(`[NetworkSelector] Setting API URL to LOCALHOST: ${localUrl}`);
          setBaseURL(localUrl);
        }
      } catch (error) {
        console.error('Error loading network preference:', error);
      }
    };
    
    loadNetworkPreference();
  }, []);
  
  // Don't show anything in production mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const toggleEnvironment = async (value: boolean) => {
    setUseProduction(value);
    
    const apiUrl = value 
      ? Config.NETWORK_PROFILES.PROD 
      : Config.NETWORK_PROFILES.LOCALHOST;
    
    // Update API service
    console.log(`[NetworkSelector] Switching to ${value ? 'PRODUCTION' : 'DEVELOPMENT'} API: ${apiUrl}`);
    setBaseURL(apiUrl);
    
    // Important: Clear auth token before switching to avoid token validation errors
    console.log('[NetworkSelector] Clearing authentication token');
    setAuthToken(null);
    
    // Save preference
    await storage.setItem(Config.STORAGE_KEYS.ACTIVE_NETWORK, 
      value ? 'PROD' : 'LOCALHOST');
    
    // Clear authentication token when switching environments
    // This forces re-login to get a new token signed with the correct JWT secret
    console.log('[NetworkSelector] Removing stored credentials');
    await storage.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
    await storage.removeItem(Config.STORAGE_KEYS.USER_DATA);
    
    // Test the updated URL by making a health check
    try {
      console.log(`[NetworkSelector] Testing connection to ${apiUrl}`);
      const healthResponse = await apiService.testConnection(apiUrl);
      console.log(`[NetworkSelector] Connection test successful:`, healthResponse);
    } catch (error) {
      console.error(`[NetworkSelector] Connection test failed:`, error);
    }
    
    // Alert the user
    Alert.alert(
      'Environment Changed', 
      `Using ${value ? 'PRODUCTION' : 'DEVELOPMENT'} environment: ${apiUrl}\n\nYou'll need to log in again with the new environment.`,
      [
        {
          text: 'OK',
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>
          Test using production API:
        </Text>
        <Switch
          value={useProduction}
          onValueChange={toggleEnvironment}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={useProduction ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
      <Text style={styles.apiUrlText}>
        API URL: {useProduction 
          ? Config.NETWORK_PROFILES.PROD 
          : Config.NETWORK_PROFILES.LOCALHOST}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: '#495057',
  },
  apiUrlText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
}); 