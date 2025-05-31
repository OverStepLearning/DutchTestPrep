import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import * as apiService from '@/utils/apiService';
import { OnboardingStep, OnboardingPreferences } from '../types/onboarding';

// Available learning subjects
export const LEARNING_SUBJECTS = [
  'Dutch',
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Japanese',
  'Chinese',
  'Rapa Nui',
  'Tamil'
];

// Available mother languages
export const MOTHER_LANGUAGES = [
  'English',
  'Dutch',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Japanese',
  'Chinese',
  'Rapa Nui',
  'Tamil'
];

export function useOnboarding() {
  const router = useRouter();
  const { user, setOnboardingComplete } = useAuth();
  
  const [step, setStep] = useState<OnboardingStep>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>('Dutch');
  const [selectedMotherLanguage, setSelectedMotherLanguage] = useState<string | null>('English');
  const [loading, setLoading] = useState(false);

  // Load selected subject from storage if coming from profile page
  useEffect(() => {
    const loadSavedSubject = async () => {
      try {
        const savedSubject = await storage.getItem('selectedLearningSubject');
        if (savedSubject) {
          console.log(`[Onboarding] Found saved learning subject: ${savedSubject}`);
          
          // Reset all onboarding state for new subject
          resetOnboardingState();
          setSelectedSubject(savedSubject);
          
          // Clear the saved subject to prevent it from affecting future onboarding sessions
          await storage.removeItem('selectedLearningSubject');
        }
      } catch (error) {
        console.error('[Onboarding] Error loading saved subject:', error);
      }
    };

    loadSavedSubject();
  }, []);

  // Reset all onboarding state to initial values
  const resetOnboardingState = () => {
    console.log('[Onboarding] Resetting onboarding state to step 1');
    setStep(1);
    setSelectedCategories([]);
    setSelectedChallenges([]);
    setSelectedReason(null);
    setSelectedMotherLanguage('English');
    setLoading(false);
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      // If already selected, remove it
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      // If not selected and not exceeding max limit, add it
      if (selectedCategories.length < 5) {
        setSelectedCategories([...selectedCategories, category]);
      }
    }
  };

  // Toggle challenge area selection
  const toggleChallenge = (challenge: string) => {
    if (selectedChallenges.includes(challenge)) {
      // If already selected, remove it
      setSelectedChallenges(selectedChallenges.filter(c => c !== challenge));
    } else {
      // If not selected and not exceeding max limit, add it
      if (selectedChallenges.length < 3) {
        setSelectedChallenges([...selectedChallenges, challenge]);
      }
    }
  };

  // Set learning reason
  const selectReason = (reason: string) => {
    setSelectedReason(reason);
  };

  // Set learning subject
  const selectSubject = (subject: string) => {
    setSelectedSubject(subject);
  };

  // Set mother language
  const selectMotherLanguage = (language: string) => {
    setSelectedMotherLanguage(language);
  };

  // Navigate to next step
  const nextStep = () => {
    // Validate current step
    if (step === 1 && !selectedSubject) {
      Alert.alert('Required', 'Please select a language or subject to learn');
      return;
    }

    if (step === 2 && !selectedMotherLanguage) {
      Alert.alert('Required', 'Please select your native language');
      return;
    }
    
    if (step === 3 && selectedCategories.length === 0) {
      Alert.alert('Required', 'Please select at least one category');
      return;
    }
    
    if (step === 4 && selectedChallenges.length === 0) {
      Alert.alert('Required', 'Please select at least one challenge area');
      return;
    }
    
    if (step === 5 && !selectedReason) {
      Alert.alert('Required', 'Please select your main reason for learning');
      return;
    }
    
    if (step < 5) {
      setStep((prevStep) => ((prevStep + 1) as OnboardingStep));
    } else {
      completeOnboarding();
    }
  };

  // Go back to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep((prevStep) => ((prevStep - 1) as OnboardingStep));
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
      const authToken = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      
      if (!authToken) {
        Alert.alert('Error', 'Authentication token not found');
        setLoading(false);
        return;
      }
      
      // Set auth token for API requests
      apiService.setAuthToken(authToken);
      
      // First update user's mother language and learning subject
      const updateResponse = await apiService.put('/api/user/language-settings', {
        motherLanguage: selectedMotherLanguage,
        learningSubject: selectedSubject
      });
      
      if (!updateResponse.success) {
        throw new Error(updateResponse.message || 'Failed to update language settings');
      }
      
      // Use apiService instead of direct axios call
      const response = await apiService.post(
        '/api/user/preferences', 
        {
          userId: user._id,
          preferredCategories: selectedCategories,
          challengeAreas: selectedChallenges,
          learningReason: selectedReason,
          learningSubject: selectedSubject
        }
      );
      
      if (response.success) {
        // Mark onboarding as complete in AuthContext
        await setOnboardingComplete();
        
        // Navigate to the main practice screen
        router.replace('/');
      } else {
        throw new Error(response.message || 'Failed to save preferences');
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

  return {
    step,
    selectedCategories,
    selectedChallenges,
    selectedReason,
    selectedSubject,
    selectedMotherLanguage,
    loading,
    toggleCategory,
    toggleChallenge,
    selectReason,
    selectSubject,
    selectMotherLanguage,
    nextStep,
    prevStep,
    resetOnboardingState
  };
} 