import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { LanguageSelector } from '../components/profile/LanguageSelector';
import { SkillsDisplay } from '../components/profile/SkillsDisplay';
import { StatsSummary } from '../components/profile/StatsSummary';
import { PreferencesDisplay } from '../components/profile/PreferencesDisplay';

export default function ProfileScreen() {
  const {
    loading,
    profile,
    error,
    selectedLanguage,
    languageOptions,
    fetchUserProfile,
    updateMotherLanguage,
    handleLogout
  } = useProfile();

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

            <SkillsDisplay 
              skillLevels={profile.progress.skillLevels} 
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
            />

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