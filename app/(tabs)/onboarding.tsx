import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../hooks/useOnboarding';
import { CategorySelector } from '../components/onboarding/CategorySelector';
import { ChallengeSelector } from '../components/onboarding/ChallengeSelector';
import { ReasonSelector } from '../components/onboarding/ReasonSelector';
import { NavigationButtons } from '../components/onboarding/NavigationButtons';

export default function OnboardingScreen() {
  const {
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
  } = useOnboarding();

  // Render the current step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <CategorySelector
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
          />
        );
      case 2:
        return (
          <ChallengeSelector
            selectedChallenges={selectedChallenges}
            onToggleChallenge={toggleChallenge}
          />
        );
      case 3:
        return (
          <ReasonSelector
            selectedReason={selectedReason}
            onSelectReason={selectReason}
          />
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

        {renderStepContent()}

        <NavigationButtons
          currentStep={step}
          totalSteps={3}
          onNext={nextStep}
          onBack={prevStep}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
}); 