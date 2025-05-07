import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import { UserProfile, LanguageOption } from '../types/profile';
import * as apiService from '@/utils/apiService';
import { useRouter } from 'expo-router';
import { useTabContext } from '@/contexts/TabContext';
import { Practice, ProgressStats } from '../types/progress';

// Create a simple event system for practice completion
export const PracticeEventEmitter = {
  _listeners: new Map(),
  
  addListener(event: string, callback: () => void) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);
    return { remove: () => this.removeListener(event, callback) };
  },
  
  removeListener(event: string, callback: () => void) {
    if (!this._listeners.has(event)) return;
    const listeners = this._listeners.get(event);
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  },
  
  emit(event: string) {
    if (!this._listeners.has(event)) return;
    const listeners = this._listeners.get(event);
    listeners.forEach((callback: () => void) => callback());
  }
};

// Define event types
export const practiceEvents = {
  PRACTICE_COMPLETED: 'PRACTICE_COMPLETED'
};

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
  const { user, logout, updateUserData } = useAuth();
  const { currentSubject: tabSubject } = useTabContext();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const router = useRouter();
  
  // Function to fetch both profile and stats for a subject
  const fetchCompleteStats = async (subject: string): Promise<void> => {
    if (!user) return;
    
    try {
      console.log(`[Profile] Fetching complete stats for subject: ${subject}`);
      
      // Fetch the practice history to make sure we have the latest stats
      const historyResponse = await apiService.get(`/api/practice/history/${user._id}?page=1&limit=10&learningSubject=${subject}`);
      
      if (historyResponse && historyResponse.success) {
        // Extract the total count from pagination
        const totalCompleted = historyResponse.pagination?.total || 0;
        const practices = historyResponse.data || [];
        
        // Calculate average difficulty from the practices
        let totalDifficulty = 0;
        let difficultyCount = 0;
        
        practices.forEach((practice: any) => {
          if (practice.difficulty && typeof practice.difficulty === 'number') {
            totalDifficulty += practice.difficulty;
            difficultyCount++;
          }
        });
        
        const avgDifficulty = difficultyCount > 0 ? totalDifficulty / difficultyCount : 1;
        const lastActivity = practices.length > 0 ? practices[0].completedAt : new Date();
        
        // Now update the profile's progress data with this count
        setProfile(prevProfile => {
          if (!prevProfile) return null;
          
          return {
            ...prevProfile,
            progress: {
              ...prevProfile.progress,
              completedPractices: totalCompleted,
              averageDifficulty: avgDifficulty,
              lastActivity: lastActivity
            }
          };
        });
        
        console.log(`[Profile] Updated profile with totalCompleted: ${totalCompleted}, avgDifficulty: ${avgDifficulty.toFixed(2)}`);
      }
    } catch (error) {
      console.warn('[Profile] Error fetching complete stats:', error);
    }
  };
  
  // Fetch user profile data with option to bypass cache
  const fetchUserProfile = async (forceRefresh: boolean = false): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiService.setAuthToken(token);
      }
      
      // Use the subject from TabContext directly instead of fetching it again
      // This ensures consistent subject usage across the app
      const subject = tabSubject || 'Dutch';
      
      // Update current subject if changed
      if (subject !== currentSubject) {
        setCurrentSubject(subject);
      }
      
      console.log(`[Profile] Fetching profile for subject: ${subject}`);
      
      // Add cache-busting parameter for forced refreshes
      const cacheBuster = forceRefresh ? `&_t=${Date.now()}` : '';
      
      // Use apiService to get fresh profile data with the current learning subject
      // This should include progress data from the server if available
      const response = await apiService.get(`/api/user/profile?learningSubject=${subject}${cacheBuster}`);
      
      if (response.success) {
        // Ensure profile.progress exists by providing default values if needed
        const profileData = response.data;
        
        // If progress is missing or empty, create a default progress object
        if (!profileData.progress) {
          console.log('[Profile] Progress data missing, creating default values');
          profileData.progress = {
            skillLevels: {
              vocabulary: 1,
              grammar: 1,
              conversation: 1,
              reading: 1,
              listening: 1
            },
            currentDifficulty: 1,
            currentComplexity: 1,
            isInAdjustmentMode: false,
            adjustmentPracticesRemaining: 0,
            completedPractices: 0,
            averageDifficulty: 1,
            averageComplexity: 1,
            lastActivity: new Date()
          };
        }
        
        // Set the profile with guaranteed progress data
        setProfile(profileData);
        
        // Set the selected language from the profile
        if (profileData.user.motherLanguage) {
          setSelectedLanguage(profileData.user.motherLanguage);
        }
        
        // Now fetch complete stats (practice history total count) to ensure data is in sync
        if (forceRefresh) {
          fetchCompleteStats(subject);
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

  // Update state when tabSubject changes
  useEffect(() => {
    if (tabSubject && (!profile || profile.user.learningSubject !== tabSubject)) {
      console.log(`[Profile] Subject changed to ${tabSubject}, fetching new profile`);
      fetchUserProfile(true);
    }
  }, [tabSubject]);
  
  // Listen for practice completion events
  useEffect(() => {
    const onPracticeCompleted = () => {
      console.log('[Profile] Practice completed event received');
      if (profile && profile.user.learningSubject === tabSubject) {
        // Update the practice count
        fetchCompleteStats(tabSubject);
      }
    };
    
    // Add event listener
    const subscription = PracticeEventEmitter.addListener(
      practiceEvents.PRACTICE_COMPLETED, 
      onPracticeCompleted
    );
    
    // Clean up
    return () => {
      subscription.remove();
    };
  }, [profile, tabSubject]);

  // Initialize profile on component mount
  useEffect(() => {
    if (user) {
      fetchUserProfile(true); // Force refresh on initial load
    }
  }, [user]);

  // Update user's mother language
  const updateMotherLanguage = async (language: string) => {
    try {
      setLoading(true);
      
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiService.setAuthToken(token);
      }
      
      // Use apiService instead of direct axios call
      const response = await apiService.put('/api/user/language-settings', {
        motherLanguage: language
      });
      
      if (response && response.success) {
        // Update the profile state with the new mother language
        setSelectedLanguage(language);
        
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
        
        Alert.alert('Success', 'Language preference updated successfully.');
      } else {
        Alert.alert('Error', 'Failed to update language preference.');
      }
    } catch (error) {
      console.error('Error updating language:', error);
      Alert.alert('Error', 'Failed to update language preference. Please try again.');
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

  // Update learning subject
  const updateLearningSubject = async (subject: string): Promise<void> => {
    try {
      setLoading(true);
      
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiService.setAuthToken(token);
      }
      
      console.log(`[Profile] Updating learning subject to: ${subject}`);
      
      // Use apiService instead of direct axios call
      const response = await apiService.put('/api/user/language-settings', {
        learningSubject: subject
      });
      
      if (response && response.success) {
        console.log(`[Profile] Successfully updated learning subject to: ${subject}`);
        
        try {
          // Update user data in AuthContext first to ensure it's available everywhere
          await updateUserData({ learningSubject: subject });
          
          // Set currentSubject in this hook to match the new subject
          setCurrentSubject(subject);
          
          // Instead of immediately fetching a new profile, just update the existing one
          // The TabContext will handle forcing refreshes of all tabs
          setProfile(prev => {
            if (!prev) return null;
            return {
              ...prev,
              user: {
                ...prev.user,
                learningSubject: subject
              }
            };
          });
          
          // Check if we need to redirect to onboarding for this subject
          try {
            const preferencesResponse = await apiService.get(`/api/user/preferences?learningSubject=${subject}`);
            
            if (!preferencesResponse.data) {
              console.log(`[Profile] No preferences found for subject ${subject}, redirecting to onboarding`);
              await storage.setItem('selectedLearningSubject', subject);
              
              Alert.alert(
                'New Subject Selected',
                `You've selected ${subject} as your learning subject. You need to set your learning preferences for this subject.`,
                [
                  {
                    text: 'Set Preferences',
                    onPress: () => router.replace('/(tabs)/onboarding')
                  }
                ]
              );
            } else {
              router.replace('/(tabs)');
            }
          } catch (prefError) {
            console.error(`[Profile] Error checking preferences:`, prefError);
            Alert.alert('Error', 'Failed to fully update your preferences. Please try again later.');
          }
        } catch (error) {
          console.error(`[Profile] Error after updating subject:`, error);
          
          // Even if there's an error, ensure the UI is updated
          setProfile(prev => {
            if (!prev) return null;
            return {
              ...prev,
              user: {
                ...prev.user,
                learningSubject: subject
              }
            };
          });
        }
      } else {
        console.error(`[Profile] Failed to update learning subject: ${JSON.stringify(response)}`);
        Alert.alert('Error', 'Failed to update learning subject.');
      }
    } catch (error) {
      console.error('Error updating learning subject:', error);
      Alert.alert('Error', 'Failed to update learning subject. Please try again.');
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

  return {
    loading,
    profile,
    error,
    selectedLanguage,
    languageOptions: LANGUAGE_OPTIONS,
    fetchUserProfile,
    updateMotherLanguage,
    updatePreferences,
    updateLearningSubject,
    handleLogout
  };
} 