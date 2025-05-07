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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  subjectsContainer: {
    maxHeight: 300,
  },
  subjectItem: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSubject: {
    backgroundColor: '#4f86f7',
    borderColor: '#4f86f7',
  },
  subjectText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedSubjectText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 14,
    color: '#888',
    marginTop: 16,
    fontStyle: 'italic',
  },
}); 