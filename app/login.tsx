import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  View,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthLogo } from '@/app/components/auth/AuthLogo';
import { LoginForm } from '@/app/components/auth/LoginForm';
import { RegisterLink } from '@/app/components/auth/RegisterLink';
import { LoginProvider } from '@/app/components/auth/LoginProvider';
import { storage } from '@/utils/storage';
import Config from '@/constants/Config';
import { NetworkSelector } from '@/app/components/auth/NetworkSelector';
import * as apiService from '@/utils/apiService';
import { useLocalSearchParams } from 'expo-router';

const LoginScreen = () => {
  const { reason } = useLocalSearchParams();
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  
  // Show session expired message if redirected with reason=session_expired
  useEffect(() => {
    if (reason === 'session_expired') {
      setShowSessionExpired(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowSessionExpired(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [reason]);

  // Clear all stored data (temporary debug function)
  const clearAllStorage = async () => {
    try {
      await storage.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(Config.STORAGE_KEYS.USER_DATA);
      await storage.removeItem(Config.STORAGE_KEYS.ACTIVE_NETWORK);
      Alert.alert('Storage Cleared', 'All authentication data has been cleared. Please log in again.');
    } catch (error) {
      console.error('Error clearing storage:', error);
      Alert.alert('Error', 'Failed to clear storage');
    }
  };

  // Test which API URL is currently being used
  const testApiUrl = async () => {
    try {
      // Get current network preference
      const activeNetwork = await storage.getItem(Config.STORAGE_KEYS.ACTIVE_NETWORK);
      const networkName = activeNetwork || 'DEFAULT';
      
      // Get current baseURL from axios
      const baseUrl = apiService.getBaseURL();
      
      // Try to test the connection
      let connectionStatus = 'Unknown';
      try {
        const response = await apiService.testConnection(baseUrl);
        connectionStatus = `Connected (${response.status})`;
      } catch {
        connectionStatus = 'Failed to connect';
      }
      
      Alert.alert(
        'API URL Information', 
        `Active Network: ${networkName}\n` +
        `Base URL: ${baseUrl}\n` +
        `API_URL from Config: ${Config.API_URL}\n` +
        `Connection Status: ${connectionStatus}`
      );
    } catch (error) {
      console.error('Error testing API URL:', error);
      Alert.alert('Error', 'Failed to get API URL information');
    }
  };

  return (
    <LoginProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        {showSessionExpired && (
          <View style={styles.sessionExpiredBanner}>
            <Text style={styles.sessionExpiredText}>
              Your session has expired. Please log in again.
            </Text>
          </View>
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <AuthLogo tagline="Prepare for your Dutch exam with AI" />
          <LoginForm />
          <RegisterLink />
          
          {/* Debug buttons */}
          <View style={styles.debugContainer}>
            <TouchableOpacity 
              style={styles.debugButton} 
              onPress={clearAllStorage}
            >
              <Text style={styles.debugButtonText}>Clear Storage Data</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.debugButton, { backgroundColor: '#4f86f7' }]} 
              onPress={testApiUrl}
            >
              <Text style={styles.debugButtonText}>Check API URL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.networkSelectorContainer}>
            <NetworkSelector />
          </View>
        </KeyboardAvoidingView>
      </View>
    </LoginProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  sessionExpiredBanner: {
    backgroundColor: '#d9534f',
    padding: 12,
    width: '100%',
  },
  sessionExpiredText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  debugContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  debugButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ff9494',
    borderRadius: 5,
    marginHorizontal: 4,
  },
  debugButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  networkSelectorContainer: {
    paddingHorizontal: 30,
    marginTop: 20,
  },
});

export default LoginScreen; 