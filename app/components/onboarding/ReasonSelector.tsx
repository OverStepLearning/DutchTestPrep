import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LEARNING_REASONS } from '../../types/onboarding';

interface ReasonSelectorProps {
  selectedReason: string | null;
  onSelectReason: (reason: string) => void;
  selectedSubject?: string | null;
}

export const ReasonSelector: React.FC<ReasonSelectorProps> = ({
  selectedReason,
  onSelectReason,
  selectedSubject
}) => {
  const subjectName = selectedSubject || 'this language';
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Why are you learning {subjectName}?</Text>
      <Text style={styles.description}>
        Select your main motivation for learning the language
      </Text>
      
      <View style={styles.optionsContainer}>
        {LEARNING_REASONS.map((reason) => (
          <TouchableOpacity
            key={reason}
            style={[
              styles.optionButton,
              selectedReason === reason && styles.selectedOption
            ]}
            onPress={() => onSelectReason(reason)}
          >
            <Text 
              style={[
                styles.optionText,
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
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - heading
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#212121', // Charcoal - body text
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'column',
  },
  optionButton: {
    backgroundColor: '#E6F4EC', // Mint Foam - light background
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  selectedOption: {
    backgroundColor: '#318F65', // Forest Verdant - selected background
    borderColor: '#318F65', // Forest Verdant - selected border
  },
  optionText: {
    fontSize: 16,
    color: '#212121', // Charcoal - option text
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF', // Snow - selected text
    fontWeight: '600',
  },
}); 