import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { UserProfile } from '../../types/profile';
import axios from 'axios';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';

// Categories and challenge areas options (imported from backend constants)
const CATEGORIES = [
  'Greetings',
  'Food',
  'Travel',
  'Work',
  'Shopping',
  'Family',
  'Health',
  'Education',
  'Weather',
  'Hobbies',
  'Transportation',
  'Housing'
];

const CHALLENGE_AREAS = [
  'Pronunciation',
  'Verb conjugation',
  'Word order',
  'Gender of nouns',
  'Prepositions',
  'Articles',
  'Plurals',
  'Past tense',
  'Conditional forms',
  'Modal verbs',
  'Separable verbs'
];

const LEARNING_REASONS = [
  'Travel',
  'Work',
  'Study',
  'Culture',
  'Friends/Family',
  'Moving to a Dutch-speaking country',
  'Personal interest'
];

interface EditPreferencesProps {
  preferences: UserProfile['preferences'];
  onUpdate: (updatedPreferences: UserProfile['preferences']) => void;
  onCancel: () => void;
}

export const EditPreferences: React.FC<EditPreferencesProps> = ({ 
  preferences, 
  onUpdate,
  onCancel
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    preferences?.preferredCategories || []
  );
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(
    preferences?.challengeAreas || []
  );
  const [selectedReason, setSelectedReason] = useState<string>(
    preferences?.learningReason || ''
  );
  const [loading, setLoading] = useState(false);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleChallenge = (challenge: string) => {
    if (selectedChallenges.includes(challenge)) {
      setSelectedChallenges(selectedChallenges.filter(c => c !== challenge));
    } else {
      setSelectedChallenges([...selectedChallenges, challenge]);
    }
  };

  const selectReason = (reason: string) => {
    setSelectedReason(reason);
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      const response = await axios.put(
        `${Config.API_URL}/api/user/preferences`, 
        {
          preferredCategories: selectedCategories,
          challengeAreas: selectedChallenges,
          learningReason: selectedReason
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data && response.data.success) {
        const updatedPreferences = {
          preferredCategories: selectedCategories,
          challengeAreas: selectedChallenges,
          learningReason: selectedReason
        };
        
        onUpdate(updatedPreferences);
        Alert.alert('Success', 'Your learning preferences have been updated.');
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

  const renderSelectionGroup = (
    title: string,
    items: string[],
    selectedItems: string[],
    onToggle: (item: string) => void,
    multiSelect: boolean = true
  ) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.tagsContainer}>
          {items.map((item, index) => {
            const isSelected = multiSelect 
              ? selectedItems.includes(item)
              : selectedItems[0] === item;
              
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tag,
                  isSelected && styles.tagSelected
                ]}
                onPress={() => onToggle(item)}
              >
                <Text style={[
                  styles.tagText,
                  isSelected && styles.tagTextSelected
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Edit Learning Preferences</Text>
        
        <ScrollView style={styles.scrollContent}>
          {renderSelectionGroup(
            'Preferred Categories',
            CATEGORIES,
            selectedCategories,
            toggleCategory
          )}
          
          {renderSelectionGroup(
            'Challenge Areas',
            CHALLENGE_AREAS,
            selectedChallenges,
            toggleChallenge
          )}
          
          {renderSelectionGroup(
            'Learning Reason',
            LEARNING_REASONS,
            [selectedReason],
            selectReason,
            false
          )}
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton, loading && styles.disabledButton]} 
            onPress={savePreferences}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollContent: {
    maxHeight: 450,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagSelected: {
    backgroundColor: '#e6f0ff',
    borderColor: '#4f86f7',
  },
  tagText: {
    fontSize: 14,
    color: '#555',
  },
  tagTextSelected: {
    color: '#4f86f7',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4f86f7',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  }
}); 