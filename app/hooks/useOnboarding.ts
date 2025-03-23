import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import { OnboardingStep, OnboardingPreferences } from '../types/onboarding';

export function useOnboarding() {
  const router = useRouter();
  const { user, setOnboardingComplete } = useAuth();
  
  const [step, setStep] = useState<OnboardingStep>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Navigate to next step
  const nextStep = () => {
    // Validate current step
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
      setStep((prevStep) => (prevStep === 3 ? 3 : (prevStep + 1) as OnboardingStep));
    } else {
      completeOnboarding();
    }
  };

  // Go back to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep((prevStep) => (prevStep === 1 ? 1 : (prevStep - 1) as OnboardingStep));
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

  return {
    step,
    selectedCategories,
    selectedChallenges,
    selectedReason,
    loading,
    toggleCategory,
    toggleChallenge,
    selectReason,
    nextStep,
    prevStep
  };
} 