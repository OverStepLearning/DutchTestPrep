import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { OnboardingStep } from '../../types/onboarding';

interface NavigationButtonsProps {
  currentStep: OnboardingStep;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  loading = false
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View 
            key={index}
            style={[
              styles.progressDot,
              index + 1 === currentStep && styles.activeDot
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {!isFirstStep && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, isFirstStep && styles.fullWidthButton]}
          onPress={onNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Finish' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF8D3', // Lemon Frost - inactive dot
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#318F65', // Forest Verdant - active dot
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#5CA480', // Overstep Green - secondary button
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: '#FFFFFF', // Snow - text on dark button
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#318F65', // Forest Verdant - primary button
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullWidthButton: {
    width: '100%',
  },
  nextButtonText: {
    color: '#FFFFFF', // Snow - text on dark button
    fontSize: 16,
    fontWeight: '600',
  },
}); 