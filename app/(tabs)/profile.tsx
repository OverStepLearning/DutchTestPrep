import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { LanguageSelector } from '../components/profile/LanguageSelector';
import { StatsSummary } from '../components/profile/StatsSummary';
import { PreferencesDisplay } from '../components/profile/PreferencesDisplay';
import { DifficultyDisplay } from '../components/profile/DifficultyDisplay';
import AISettings from '../components/profile/AISettings';
import { useAIProvider } from '@/contexts/AIProviderContext';

export default function ProfileScreen() {
  const {
    loading,
    profile,
    error,
    selectedLanguage,
    languageOptions,
    fetchUserProfile,
    updateMotherLanguage,
    updatePreferences,
    handleLogout
  } = useProfile();
  
  // Initialize DeepSeek API key if provided by the user
  const { setDeepseekApiKey } = useAIProvider();
  
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f86f7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {profile ? (
          <>
            <ProfileHeader 
              name={profile.user.name} 
              email={profile.user.email} 
            />

            <LanguageSelector
              currentLanguage={selectedLanguage}
              languages={languageOptions}
              onLanguageChange={updateMotherLanguage}
            />

            <DifficultyDisplay 
              currentDifficulty={profile.progress.currentDifficulty || 1}
              currentComplexity={profile.progress.currentComplexity || 1}
              averageDifficulty={profile.progress.averageDifficulty}
            />

            <StatsSummary 
              stats={{
                completedPractices: profile.progress.completedPractices,
                averageDifficulty: profile.progress.averageDifficulty,
                lastActivity: profile.progress.lastActivity
              }}
            />

            <PreferencesDisplay 
              preferences={profile.preferences}
              onPreferencesUpdate={updatePreferences}
            />
            
            <AISettings />

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
              onPress={fetchUserProfile}
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