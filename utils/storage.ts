import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For web platform
const webStorage = {
  _data: {} as Record<string, string>,
  
  getItem(key: string): string | null {
    return this._data[key] || null;
  },
  
  setItem(key: string, value: string) {
    this._data[key] = value;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.log('localStorage is not available, using in-memory storage');
    }
  },
  
  removeItem(key: string) {
    delete this._data[key];
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.log('localStorage is not available, using in-memory storage');
    }
  }
};

/**
 * Cross-platform storage utility that uses SecureStore for native platforms
 * and localStorage for web, with fallbacks for environments where neither is available
 */
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      webStorage.setItem(key, value);
      return Promise.resolve();
    } else {
      try {
        return await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error('Error saving to SecureStore:', error);
        // Fall back to in-memory storage if SecureStore fails
        webStorage.setItem(key, value);
        return Promise.resolve();
      }
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return Promise.resolve(webStorage.getItem(key));
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error('Error retrieving from SecureStore:', error);
        // Fall back to in-memory storage if SecureStore fails
        return Promise.resolve(webStorage.getItem(key));
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      webStorage.removeItem(key);
      return Promise.resolve();
    } else {
      try {
        return await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('Error deleting from SecureStore:', error);
        // Fall back to in-memory storage if SecureStore fails
        webStorage.removeItem(key);
        return Promise.resolve();
      }
    }
  }
}; 