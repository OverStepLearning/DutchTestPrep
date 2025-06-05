import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CHALLENGE_AREAS } from '../../types/onboarding';

interface ChallengeSelectorProps {
  selectedChallenges: string[];
  onToggleChallenge: (challenge: string) => void;
  maxSelections?: number;
}

export const ChallengeSelector: React.FC<ChallengeSelectorProps> = ({
  selectedChallenges,
  onToggleChallenge,
  maxSelections = 3
}) => {
  const isChallengeSelected = (challenge: string) => selectedChallenges.includes(challenge);
  const hasReachedMaxSelections = selectedChallenges.length >= maxSelections;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What are your challenge areas?</Text>
      <Text style={styles.description}>
        Select up to {maxSelections} aspects of Dutch that you find challenging
      </Text>
      
      <View style={styles.optionsContainer}>
        {CHALLENGE_AREAS.map((challenge) => (
          <TouchableOpacity
            key={challenge}
            style={[
              styles.optionButton,
              isChallengeSelected(challenge) && styles.selectedOption,
              hasReachedMaxSelections && !isChallengeSelected(challenge) && styles.disabledOption
            ]}
            onPress={() => onToggleChallenge(challenge)}
            disabled={hasReachedMaxSelections && !isChallengeSelected(challenge)}
          >
            <Text 
              style={[
                styles.optionText,
                isChallengeSelected(challenge) && styles.selectedOptionText
              ]}
            >
              {challenge}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    backgroundColor: '#E6F4EC', // Mint Foam - light background
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  selectedOption: {
    backgroundColor: '#318F65', // Forest Verdant - selected background
    borderColor: '#318F65', // Forest Verdant - selected border
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 14,
    color: '#212121', // Charcoal - option text
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF', // Snow - selected text
    fontWeight: '600',
  },
}); 