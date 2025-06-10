import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { LanguageSelector } from '../components/profile/LanguageSelector';
import { SubjectSelector } from '../components/profile/SubjectSelector';
import { StatsSummary } from '../components/profile/StatsSummary';
import { PreferencesDisplay } from '../components/profile/PreferencesDisplay';
import { DifficultyDisplay } from '../components/profile/DifficultyDisplay';
import AISettings from '../components/profile/AISettings';
import { useAIProvider } from '@/contexts/AIProviderContext';
import { useTabContext } from '@/contexts/TabContext';
import { storage } from '@/utils/storage';
import Config from '@/constants/Config';
import * as apiService from '@/utils/apiService';

export default function ProfileScreen() {
  const {
    loading,
    profile,
    error,
    selectedLanguage,
    languageOptions,
    fetchUserProfile,
    updateLearningSubject,
    updateMotherLanguage,
    updatePreferences,
    handleLogout,
    deleteAccount
  } = useProfile();
  
  const { currentTab, shouldRefresh, currentSubject: tabSubject } = useTabContext();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Initialize DeepSeek API key if provided by the user
  const { setDeepseekApiKey, setGeminiApiKey } = useAIProvider();
  
  // Refresh data when entering the profile tab
  useEffect(() => {
    if (currentTab === 'profile' && shouldRefresh('profile')) {
      console.log('[Profile] Tab focused - refreshing data');
      fetchUserProfile(true); // Force refresh when tab focused
    }
  }, [currentTab, shouldRefresh]);
  
  // Also refresh when subject changes in TabContext
  useEffect(() => {
    if (currentTab === 'profile' && tabSubject) {
      if (!profile || profile?.user?.learningSubject !== tabSubject) {
        console.log(`[Profile] Subject mismatch: profile=${profile?.user?.learningSubject}, tab=${tabSubject}. Refreshing.`);
        fetchUserProfile(true);
      }
    }
  }, [tabSubject, currentTab]);
  
  // Pull-to-refresh handler
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserProfile(true).finally(() => {
      setRefreshing(false);
    });
  }, [fetchUserProfile]);
  
  // Button refresh handler
  const handleManualRefresh = () => {
    fetchUserProfile(true);
  };
  
  // Add a function to test token expiration
  const handleForceExpireToken = async () => {
    try {
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        // Modify the token to make it invalid
        const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        await storage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, invalidToken);
        
        // Set the invalid token in API service directly
        apiService.setAuthToken(invalidToken);
        
        // Immediate API request to trigger 401 error
        console.log("[Profile] Testing token expiration with invalid token");
        apiService.get('/api/user/profile').catch(err => {
          console.log("[Profile] Expected auth error:", err.message);
        });
      }
    } catch (error) {
      console.error('Error forcing token expiration:', error);
    }
  };
  
  useEffect(() => {
    // Set the API keys from the parameters if they were passed (for demo purposes)
    const initializeApiKeys = async () => {
      // This would typically be handled through user input,
      // but for this demo we're initializing them if they're not already set
      try {
        await setDeepseekApiKey('sk-e77b5b74b4ea4b52809bab518b73df80');
        await setGeminiApiKey('AIzaSyDr2mzAFZrPuPDB1Jpb3X4cR70PxpQ20TY');
      } catch (error) {
        console.error('Failed to initialize API keys:', error);
      }
    };
    
    initializeApiKeys();
  }, [setDeepseekApiKey, setGeminiApiKey]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#318F65" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
          />
        }
      >
        {profile ? (
          <>
            <ProfileHeader 
              name={profile.user.name} 
              email={profile.user.email} 
            />

            <SubjectSelector
              currentSubject={profile.user.learningSubject || 'Dutch'}
              onSubjectChange={updateLearningSubject}
            />

            <LanguageSelector
              currentLanguage={selectedLanguage}
              languages={languageOptions}
              onLanguageChange={updateMotherLanguage}
            />

            {profile.progress ? (
              <>
                <DifficultyDisplay 
                  currentDifficulty={profile.progress.currentDifficulty || 1}
                  currentComplexity={profile.progress.currentComplexity || 1}
                  averageDifficulty={profile.progress.averageDifficulty || 1}
                />

                <StatsSummary 
                  stats={{
                    completedPractices: profile.progress.completedPractices || 0,
                    averageDifficulty: profile.progress.averageDifficulty || 1,
                    lastActivity: profile.progress.lastActivity || new Date()
                  }}
                />
              </>
            ) : (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  Learning progress data is not available. Try switching to a different subject or refreshing the page.
                </Text>
              </View>
            )}

            <PreferencesDisplay 
              preferences={profile.preferences || {}}
              onPreferencesUpdate={updatePreferences}
            />
            
            <AISettings />

            {/* Developer testing buttons - only show in development */}
            {__DEV__ && (
              <View style={styles.devSection}>
                <Text style={styles.devSectionTitle}>Developer Tools</Text>
                <TouchableOpacity 
                  style={styles.devButton}
                  onPress={handleForceExpireToken}
                >
                  <Text style={styles.devButtonText}>Test Token Expiration</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            {/* Account deletion button */}
            <TouchableOpacity 
              style={styles.deleteAccountButton}
              onPress={deleteAccount}
            >
              <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleManualRefresh}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4EC', // Mint Foam - light background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F4EC', // Mint Foam - background
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    fontSize: 16,
    color: '#318F65', // Forest Verdant - error text
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  warningContainer: {
    backgroundColor: '#FFF8D3', // Lemon Frost - warning background
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5AF00', // Golden Mango - warning border
  },
  warningText: {
    fontSize: 14,
    color: '#318F65', // Forest Verdant - warning text
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#5CA480', // Overstep Green - secondary action
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFFFFF', // Snow - button text
    fontWeight: '600',
  },
  devSection: {
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E6F4EC', // Mint Foam - border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  devSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#318F65', // Forest Verdant - heading
  },
  devButton: {
    backgroundColor: '#E5AF00', // Golden Mango - dev action
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  devButtonText: {
    color: '#FFFFFF', // Snow - button text
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545', // Red for logout action
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#FFFFFF', // Snow - button text
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccountButton: {
    backgroundColor: '#b91c1c', // Darker red for delete account action
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteAccountButtonText: {
    color: '#FFFFFF', // Snow - button text
    fontSize: 16,
    fontWeight: '600',
  },
}); 