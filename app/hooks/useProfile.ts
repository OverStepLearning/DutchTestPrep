import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import { UserProfile, LanguageOption } from '../types/profile';
import * as apiService from '@/utils/apiService';

// Language mapping with native names
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'English', nativeName: 'English' },
  { code: 'Spanish', nativeName: 'Español' },
  { code: 'French', nativeName: 'Français' },
  { code: 'German', nativeName: 'Deutsch' },
  { code: 'Dutch', nativeName: 'Nederlands' },
  { code: 'Italian', nativeName: 'Italiano' },
  { code: 'Portuguese', nativeName: 'Português' },
  { code: 'Russian', nativeName: 'Русский' },
  { code: 'Chinese', nativeName: '简体中文' },
  { code: 'Japanese', nativeName: '日本語' },
  { code: 'Korean', nativeName: '한국어' },
  { code: 'Arabic', nativeName: 'العربية' },
  { code: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'Turkish', nativeName: 'Türkçe' },
  { code: 'Thai', nativeName: 'ไทย' },
  { code: 'Vietnamese', nativeName: 'Tiếng Việt' }
];

export function useProfile() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  
  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiService.setAuthToken(token);
      }
      
      // Use apiService instead of direct axios call
      const response = await apiService.get('/api/user/profile');
      
      if (response.success) {
        setProfile(response.data);
        
        // Set the selected language from the profile
        if (response.data.user.motherLanguage) {
          setSelectedLanguage(response.data.user.motherLanguage);
        }
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update mother language
  const updateMotherLanguage = async (language: string) => {
    try {
      setLoading(true);
      
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiService.setAuthToken(token);
      }
      
      // Use apiService instead of direct axios call
      const response = await apiService.put('/api/auth/profile', { motherLanguage: language });
      
      if (response && response.user) {
        // Update the profile state with the new mother language
        setProfile(prev => {
          if (!prev) return null;
          return {
            ...prev,
            user: {
              ...prev.user,
              motherLanguage: language
            }
          };
        });
        
        setSelectedLanguage(language);
        Alert.alert('Success', 'Your mother language has been updated.');
      } else {
        Alert.alert('Error', 'Failed to update mother language.');
      }
    } catch (error) {
      console.error('Error updating mother language:', error);
      Alert.alert('Error', 'Failed to update mother language. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (updatedPreferences: UserProfile['preferences']) => {
    try {
      setLoading(true);
      
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiService.setAuthToken(token);
      }
      
      // Use apiService instead of direct axios call
      const response = await apiService.put('/api/user/preferences', updatedPreferences);
      
      if (response && response.success) {
        // Update the profile state with the new preferences
        setProfile(prev => {
          if (!prev) return null;
          return {
            ...prev,
            preferences: updatedPreferences
          };
        });
      } else {
        Alert.alert('Error', 'Failed to update preferences.');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Initialize profile on component mount
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  return {
    loading,
    profile,
    error,
    selectedLanguage,
    languageOptions: LANGUAGE_OPTIONS,
    fetchUserProfile,
    updateMotherLanguage,
    updatePreferences,
    handleLogout
  };
} 