import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LanguageOption } from '../../types/profile';

interface LanguageSelectorProps {
  currentLanguage: string;
  languages: LanguageOption[];
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  languages,
  onLanguageChange
}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // Helper to get native name from language code
  const getNativeLanguageName = (code: string): string => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.nativeName : code;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mother Language</Text>
      <View style={styles.languageDisplay}>
        <Text style={styles.languageValue}>
          {getNativeLanguageName(currentLanguage)}
        </Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setShowLanguageModal(true)}
        >
          <Ionicons name="pencil-outline" size={16} color="#318F65" />
          <Text style={styles.editButtonText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Mother Language</Text>
            
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    currentLanguage === item.code && styles.languageOptionSelected
                  ]}
                  onPress={() => {
                    onLanguageChange(item.code);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.languageOptionText,
                      currentLanguage === item.code && styles.languageOptionTextSelected
                    ]}
                  >
                    {item.nativeName} ({item.code})
                  </Text>
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  languageDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageValue: {
    fontSize: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#318F65',
    fontWeight: '500',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  languageOptionText: {
    fontSize: 16,
  },
  languageOptionTextSelected: {
    color: '#4f86f7',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 