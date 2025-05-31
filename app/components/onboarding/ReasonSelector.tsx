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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'column',
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#4f86f7',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '500',
  },
}); 