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
    handleLogout
  } = useProfile();
  
  const { currentTab, shouldRefresh, currentSubject: tabSubject } = useTabContext();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Initialize DeepSeek API key if provided by the user
  const { setDeepseekApiKey } = useAIProvider();
  
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
    // Set the DeepSeek API key from the parameter if it was passed (for demo purposes)
    const initializeDeepSeekKey = async () => {
      // This would typically be handled through user input,
      // but for this demo we're initializing it if it's not already set
      try {
        await setDeepseekApiKey('sk-e77b5b74b4ea4b52809bab518b73df80');
      } catch (error) {
        console.error('Failed to initialize DeepSeek API key:', error);
      }
    };
    
    initializeDeepSeekKey();
  }, [setDeepseekApiKey]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f86f7" />
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

            {/* Developer testing buttons */}
            <View style={styles.devSection}>
              <Text style={styles.devSectionTitle}>Developer Tools</Text>
              <TouchableOpacity 
                style={styles.devButton}
                onPress={handleForceExpireToken}
              >
                <Text style={styles.devButtonText}>Test Token Expiration</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
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
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4f86f7',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  devSection: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  devSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#555',
  },
  devButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  devButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 