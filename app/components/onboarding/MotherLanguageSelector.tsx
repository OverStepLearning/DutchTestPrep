import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MOTHER_LANGUAGES } from '../../hooks/useOnboarding';

interface MotherLanguageSelectorProps {
  selectedMotherLanguage: string | null;
  onSelectMotherLanguage: (language: string) => void;
}

export const MotherLanguageSelector: React.FC<MotherLanguageSelectorProps> = ({
  selectedMotherLanguage,
  onSelectMotherLanguage
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What is your native language?</Text>
      <Text style={styles.subtitle}>We'll show translations in this language when needed</Text>
      
      <ScrollView style={styles.languagesContainer}>
        {MOTHER_LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language}
            style={[
              styles.languageItem,
              selectedMotherLanguage === language && styles.selectedLanguage
            ]}
            onPress={() => onSelectMotherLanguage(language)}
          >
            <Text 
              style={[
                styles.languageText,
                selectedMotherLanguage === language && styles.selectedLanguageText
              ]}
            >
              {language}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Text style={styles.helpText}>
        You can change your native language later in your profile settings.
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
  languagesContainer: {
    maxHeight: 300,
  },
  languageItem: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedLanguage: {
    backgroundColor: '#4f86f7',
    borderColor: '#4f86f7',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedLanguageText: {
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