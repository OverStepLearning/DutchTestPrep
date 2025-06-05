import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LEARNING_SUBJECTS } from '../../hooks/useOnboarding';

interface SubjectSelectorProps {
  selectedSubject: string | null;
  onSelectSubject: (subject: string) => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  selectedSubject,
  onSelectSubject
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What language do you want to learn?</Text>
      <Text style={styles.subtitle}>Select the language or subject you want to practice</Text>
      
      <ScrollView style={styles.subjectsContainer}>
        {LEARNING_SUBJECTS.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.subjectItem,
              selectedSubject === subject && styles.selectedSubject
            ]}
            onPress={() => onSelectSubject(subject)}
          >
            <Text 
              style={[
                styles.subjectText,
                selectedSubject === subject && styles.selectedSubjectText
              ]}
            >
              {subject}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Text style={styles.helpText}>
        You can change your learning language later in your profile settings.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
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
    marginBottom: 8,
    color: '#318F65', // Forest Verdant - heading
  },
  subtitle: {
    fontSize: 16,
    color: '#212121', // Charcoal - body text
    marginBottom: 20,
  },
  subjectsContainer: {
    maxHeight: 300,
  },
  subjectItem: {
    backgroundColor: '#E6F4EC', // Mint Foam - light background
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  selectedSubject: {
    backgroundColor: '#318F65', // Forest Verdant - selected background
    borderColor: '#318F65', // Forest Verdant - selected border
  },
  subjectText: {
    fontSize: 16,
    color: '#212121', // Charcoal - option text
    fontWeight: '500',
  },
  selectedSubjectText: {
    color: '#FFFFFF', // Snow - selected text
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - helper text
    marginTop: 16,
    fontStyle: 'italic',
  },
}); 