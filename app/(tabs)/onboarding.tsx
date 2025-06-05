import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../hooks/useOnboarding';
import { CategorySelector } from '../components/onboarding/CategorySelector';
import { ChallengeSelector } from '../components/onboarding/ChallengeSelector';
import { ReasonSelector } from '../components/onboarding/ReasonSelector';
import { SubjectSelector } from '../components/onboarding/SubjectSelector';
import { MotherLanguageSelector } from '../components/onboarding/MotherLanguageSelector';
import { NavigationButtons } from '../components/onboarding/NavigationButtons';

export default function OnboardingScreen() {
  const {
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
    prevStep
  } = useOnboarding();

  // Render the current step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <SubjectSelector
            selectedSubject={selectedSubject}
            onSelectSubject={selectSubject}
          />
        );
      case 2:
        return (
          <MotherLanguageSelector
            selectedMotherLanguage={selectedMotherLanguage}
            onSelectMotherLanguage={selectMotherLanguage}
          />
        );
      case 3:
        return (
          <CategorySelector
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
          />
        );
      case 4:
        return (
          <ChallengeSelector
            selectedChallenges={selectedChallenges}
            onToggleChallenge={toggleChallenge}
          />
        );
      case 5:
        return (
          <ReasonSelector
            selectedReason={selectedReason}
            onSelectReason={selectReason}
            selectedSubject={selectedSubject}
          />
        );
      default:
        return null;
    }
  };

  // Get the appropriate subtitle based on step and selected subject
  const getStepTitle = () => {
    const subjectName = selectedSubject || 'language';
    switch (step) {
      case 1:
        return "Let's start learning";
      case 2:
        return "About your language background";
      case 3:
        return `Personalize your ${subjectName} learning`;
      case 4:
        return `What's challenging in ${subjectName}?`;
      case 5:
        return `Why learn ${subjectName}?`;
      default:
        return "Setup Your Practice";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{getStepTitle()}</Text>
          <Text style={styles.subtitle}>
            Let's personalize your learning experience
          </Text>
        </View>

        {renderStepContent()}

        <NavigationButtons
          currentStep={step}
          totalSteps={5}
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
    backgroundColor: '#E6F4EC', // Mint Foam - light section background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - heading
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#212121', // Charcoal - body text
    marginBottom: 24,
  },
}); 