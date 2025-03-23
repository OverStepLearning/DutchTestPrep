import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Config from '@/constants/Config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '@/utils/storage';

interface UserProfile {
  user: {
    _id: string;
    name: string;
    email: string;
    motherLanguage?: string;
  };
  progress: {
    skillLevels: {
      vocabulary: number;
      grammar: number;
      conversation: number;
      reading: number;
      listening: number;
    };
    completedPractices: number;
    averageDifficulty: number;
    lastActivity: Date;
  };
  preferences: {
    preferredCategories: string[];
    challengeAreas: string[];
    learningReason: string;
  };
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingLanguage, setEditingLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  
  // Available languages for selection
  const availableLanguages = [
    'English', 'Spanish', 'French', 'German', 'Dutch',
    'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese'
  ];

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      const response = await axios.get(`${Config.API_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setProfile(response.data.data);
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

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Update mother language
  const updateMotherLanguage = async () => {
    try {
      setLoading(true);
      
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      const response = await axios.put(
        `${Config.API_URL}/api/auth/profile`, 
        { motherLanguage: selectedLanguage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data && response.data.user) {
        // Update the profile state with the new mother language
        setProfile(prev => {
          if (!prev) return null;
          return {
            ...prev,
            user: {
              ...prev.user,
              motherLanguage: selectedLanguage
            }
          };
        });
        Alert.alert('Success', 'Your mother language has been updated.');
      } else {
        Alert.alert('Error', 'Failed to update mother language.');
      }
    } catch (error) {
      console.error('Error updating mother language:', error);
      Alert.alert('Error', 'Failed to update mother language. Please try again.');
    } finally {
      setLoading(false);
      setEditingLanguage(false);
    }
  };

  // Set initial selected language when profile loads
  useEffect(() => {
    if (profile && profile.user.motherLanguage) {
      setSelectedLanguage(profile.user.motherLanguage);
    } else {
      setSelectedLanguage('English'); // Default to English
    }
  }, [profile]);

  // Render skill level bar
  const renderSkillLevel = (label: string, level: number) => {
    return (
      <View style={styles.skillContainer}>
        <Text style={styles.skillLabel}>{label}</Text>
        <View style={styles.skillBarContainer}>
          <View style={[styles.skillBar, { width: `${level * 10}%` }]} />
        </View>
        <Text style={styles.skillLevel}>{level}/10</Text>
      </View>
    );
  };

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
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setError(null);
                if (user) {
                  fetchUserProfile();
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : profile ? (
          <>
            {/* Mother Language Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Language Settings</Text>
              
              <View style={styles.preferenceRow}>
                <Text style={styles.preferencesLabel}>Mother Language</Text>
                {editingLanguage ? (
                  <View style={styles.languageSelector}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.languageSelectorContent}
                    >
                      {availableLanguages.map((lang) => (
                        <TouchableOpacity
                          key={lang}
                          style={[
                            styles.languageOption,
                            selectedLanguage === lang && styles.languageOptionSelected
                          ]}
                          onPress={() => setSelectedLanguage(lang)}
                        >
                          <Text 
                            style={[
                              styles.languageOptionText,
                              selectedLanguage === lang && styles.languageOptionTextSelected
                            ]}
                          >
                            {lang}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    
                    <View style={styles.languageActions}>
                      <TouchableOpacity 
                        style={[styles.languageButton, styles.languageButtonCancel]} 
                        onPress={() => {
                          setEditingLanguage(false);
                          // Reset to original value from profile
                          if (profile && profile.user.motherLanguage) {
                            setSelectedLanguage(profile.user.motherLanguage);
                          }
                        }}
                      >
                        <Text style={styles.languageButtonTextCancel}>Cancel</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.languageButton, styles.languageButtonSave]} 
                        onPress={updateMotherLanguage}
                      >
                        <Text style={styles.languageButtonTextSave}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.languageDisplay}>
                    <Text style={styles.languageValue}>
                      {profile.user.motherLanguage || 'English'}
                    </Text>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => setEditingLanguage(true)}
                    >
                      <Text style={styles.editButtonText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Progress Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skill Levels</Text>
              {profile.progress && (
                <>
                  {renderSkillLevel('Vocabulary', profile.progress.skillLevels?.vocabulary || 1)}
                  {renderSkillLevel('Grammar', profile.progress.skillLevels?.grammar || 1)}
                  {renderSkillLevel('Conversation', profile.progress.skillLevels?.conversation || 1)}
                  {renderSkillLevel('Reading', profile.progress.skillLevels?.reading || 1)}
                  {renderSkillLevel('Listening', profile.progress.skillLevels?.listening || 1)}
                  
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{profile.progress.completedPractices || 0}</Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{(profile.progress.averageDifficulty || 0).toFixed(1)}</Text>
                      <Text style={styles.statLabel}>Avg. Difficulty</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Learning Preferences</Text>
              
              {profile.preferences && (
                <>
                  <Text style={styles.preferencesLabel}>Preferred Categories</Text>
                  <View style={styles.tagsContainer}>
                    {(profile.preferences.preferredCategories || []).map((category, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{category}</Text>
                      </View>
                    ))}
                    {(!profile.preferences.preferredCategories || profile.preferences.preferredCategories.length === 0) && (
                      <Text style={styles.emptyStateText}>No preferred categories set</Text>
                    )}
                  </View>
                  
                  <Text style={styles.preferencesLabel}>Challenge Areas</Text>
                  <View style={styles.tagsContainer}>
                    {(profile.preferences.challengeAreas || []).map((challenge, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{challenge}</Text>
                      </View>
                    ))}
                    {(!profile.preferences.challengeAreas || profile.preferences.challengeAreas.length === 0) && (
                      <Text style={styles.emptyStateText}>No challenge areas set</Text>
                    )}
                  </View>
                  
                  <Text style={styles.preferencesLabel}>Learning Reason</Text>
                  <View style={styles.reasonContainer}>
                    <Text style={styles.reasonText}>{profile.preferences.learningReason || "Not specified"}</Text>
                  </View>
                </>
              )}
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load profile data</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                if (user) {
                  fetchUserProfile();
                }
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4f86f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#721c24',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#212529',
  },
  skillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillLabel: {
    width: 100,
    fontSize: 14,
    color: '#495057',
  },
  skillBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillBar: {
    height: '100%',
    backgroundColor: '#4f86f7',
  },
  skillLevel: {
    width: 40,
    fontSize: 14,
    color: '#495057',
    textAlign: 'right',
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f86f7',
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  preferencesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 8,
    marginTop: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#495057',
  },
  reasonContainer: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
  },
  reasonText: {
    fontSize: 14,
    color: '#495057',
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  emptyStateText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6c757d',
    padding: 8,
  },
  preferenceRow: {
    marginVertical: 10,
  },
  languageDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  languageValue: {
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#4f86f7',
    fontWeight: '600',
  },
  languageSelector: {
    marginTop: 10,
  },
  languageSelectorContent: {
    paddingVertical: 10,
  },
  languageOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  languageOptionSelected: {
    backgroundColor: '#4f86f7',
  },
  languageOptionText: {
    fontSize: 14,
    color: '#333',
  },
  languageOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  languageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  languageButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  languageButtonSave: {
    backgroundColor: '#4f86f7',
  },
  languageButtonTextCancel: {
    color: '#333',
  },
  languageButtonTextSave: {
    color: '#fff',
    fontWeight: '600',
  },
}); 