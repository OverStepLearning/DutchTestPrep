import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For web platform
const webStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.log('localStorage is not available');
      return null;
    }
  },
  
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.log('localStorage is not available');
    }
  },
  
  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.log('localStorage is not available');
    }
  }
};

/**
 * Cross-platform storage utility that uses SecureStore for native platforms
 * and localStorage for web
 */
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      webStorage.setItem(key, value);
      return;
    }
    
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error saving to SecureStore:', error);
      // Fall back to web storage if SecureStore fails
      webStorage.setItem(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return webStorage.getItem(key);
    }
    
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving from SecureStore:', error);
      // Fall back to web storage if SecureStore fails
      return webStorage.getItem(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      webStorage.removeItem(key);
      return;
    }
    
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error deleting from SecureStore:', error);
      // Fall back to web storage if SecureStore fails
      webStorage.removeItem(key);
    }
  }
}; 