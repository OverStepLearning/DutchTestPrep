import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Config from '@/constants/Config';
import * as SecureStore from 'expo-secure-store';

// Categories for Dutch language practice
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

// Common challenge areas for Dutch learners
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

// Reasons for learning Dutch
const LEARNING_REASONS = [
  'Work/Career',
  'Education',
  'Living in the Netherlands',
  'Dutch partner/family',
  'Travel',
  'Cultural interest',
  'Personal challenge'
];

export default function OnboardingScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const { user, token, setOnboardingComplete } = useAuth();
  const router = useRouter();
  
  // Handler for category selection
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      // Limit to 5 categories
      if (selectedCategories.length < 5) {
        setSelectedCategories([...selectedCategories, category]);
      } else {
        Alert.alert('Info', 'You can select up to 5 categories');
      }
    }
  };
  
  // Handler for challenge selection
  const handleChallengeToggle = (challenge: string) => {
    if (selectedChallenges.includes(challenge)) {
      setSelectedChallenges(selectedChallenges.filter(c => c !== challenge));
    } else {
      // Limit to 3 challenges
      if (selectedChallenges.length < 3) {
        setSelectedChallenges([...selectedChallenges, challenge]);
      } else {
        Alert.alert('Info', 'You can select up to 3 challenge areas');
      }
    }
  };
  
  // Handler for reason selection
  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
  };
  
  // Navigate to next step
  const nextStep = () => {
    if (step === 1 && selectedCategories.length === 0) {
      Alert.alert('Required', 'Please select at least one category');
      return;
    }
    
    if (step === 2 && selectedChallenges.length === 0) {
      Alert.alert('Required', 'Please select at least one challenge area');
      return;
    }
    
    if (step === 3 && !selectedReason) {
      Alert.alert('Required', 'Please select your main reason for learning Dutch');
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };
  
  // Go back to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Save user preferences and complete onboarding
  const completeOnboarding = async () => {
    if (!user) {
      Alert.alert('Error', 'You need to be logged in to complete onboarding');
      return;
    }
    
    setLoading(true);
    
    try {
      const authToken = await SecureStore.getItemAsync(Config.STORAGE_KEYS.AUTH_TOKEN);
      
      if (!authToken) {
        Alert.alert('Error', 'Authentication token not found');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(
        `${Config.API_URL}/api/user/preferences`, 
        {
          userId: user._id,
          preferredCategories: selectedCategories,
          challengeAreas: selectedChallenges,
          learningReason: selectedReason
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      if (response.data.success) {
        // Mark onboarding as complete in AuthContext
        await setOnboardingComplete();
        
        // Navigate to the main practice screen
        router.replace('/');
      } else {
        throw new Error(response.data.message || 'Failed to save preferences');
      }
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save your preferences';
      Alert.alert(
        'Error',
        `${errorMessage}. Please try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What would you like to practice?</Text>
            <Text style={styles.stepDescription}>
              Select up to 5 categories that interest you the most
            </Text>
            
            <View style={styles.optionsContainer}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.optionButton,
                    selectedCategories.includes(category) && styles.selectedOption
                  ]}
                  onPress={() => handleCategoryToggle(category)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedCategories.includes(category) && styles.selectedOptionText
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What are your challenge areas?</Text>
            <Text style={styles.stepDescription}>
              Select up to 3 aspects of Dutch that you find challenging
            </Text>
            
            <View style={styles.optionsContainer}>
              {CHALLENGE_AREAS.map((challenge) => (
                <TouchableOpacity
                  key={challenge}
                  style={[
                    styles.optionButton,
                    selectedChallenges.includes(challenge) && styles.selectedOption
                  ]}
                  onPress={() => handleChallengeToggle(challenge)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedChallenges.includes(challenge) && styles.selectedOptionText
                    ]}
                  >
                    {challenge}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Why are you learning Dutch?</Text>
            <Text style={styles.stepDescription}>
              Select your main reason for learning Dutch
            </Text>
            
            <View style={styles.optionsContainer}>
              {LEARNING_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonButton,
                    selectedReason === reason && styles.selectedOption
                  ]}
                  onPress={() => handleReasonSelect(reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason && styles.selectedOptionText
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Setup Your Practice</Text>
          <Text style={styles.subtitle}>
            Let's personalize your Dutch learning experience
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.progressStep,
                i <= step ? styles.activeStep : styles.inactiveStep
              ]}
            />
          ))}
        </View>
        
        {renderStepContent()}
        
        <View style={styles.navigationContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={prevStep}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={nextStep}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.nextButtonText}>
                {step === 3 ? 'Finish' : 'Next'}
              </Text>
            )}
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
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressStep: {
    width: 70,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: '#4f86f7',
  },
  inactiveStep: {
    backgroundColor: '#e9ecef',
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#4f86f7',
  },
  optionText: {
    fontSize: 14,
    color: '#495057',
  },
  selectedOptionText: {
    color: 'white',
  },
  reasonButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    width: '100%',
  },
  reasonText: {
    fontSize: 16,
    color: '#495057',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
}); 