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
  languagesContainer: {
    maxHeight: 300,
  },
  languageItem: {
    backgroundColor: '#E6F4EC', // Mint Foam - light background
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  selectedLanguage: {
    backgroundColor: '#318F65', // Forest Verdant - selected background
    borderColor: '#318F65', // Forest Verdant - selected border
  },
  languageText: {
    fontSize: 16,
    color: '#212121', // Charcoal - option text
    fontWeight: '500',
  },
  selectedLanguageText: {
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