import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEARNING_SUBJECTS } from '../../hooks/useOnboarding';

interface SubjectSelectorProps {
  currentSubject: string;
  onSubjectChange: (subject: string) => Promise<void>;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({ 
  currentSubject, 
  onSubjectChange 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(currentSubject);

  const handleSelectSubject = async (subject: string) => {
    if (subject === currentSubject) {
      setIsModalVisible(false);
      return;
    }

    setSelectedSubject(subject);
    setLoading(true);
    
    try {
      await onSubjectChange(subject);
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update your learning subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Subject</Text>
        <TouchableOpacity 
          style={styles.changeButton} 
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="pencil" size={16} color="#318F65" />
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.subjectContainer}>
        <Text style={styles.currentSubject}>{currentSubject}</Text>
        <Text style={styles.helpText}>
          This is the language or subject you are currently learning.
          Changing this will also change your practice questions.
        </Text>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Learning Subject</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                disabled={loading}
              >
                <Ionicons name="close-circle" size={24} color="#5CA480" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Choose the language or subject you want to learn
            </Text>
            
            <ScrollView style={styles.subjectsList}>
              {LEARNING_SUBJECTS.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.subjectItem,
                    selectedSubject === subject && styles.selectedSubject
                  ]}
                  onPress={() => handleSelectSubject(subject)}
                  disabled={loading}
                >
                  <Text 
                    style={[
                      styles.subjectText,
                      selectedSubject === subject && styles.selectedSubjectText
                    ]}
                  >
                    {subject}
                  </Text>
                  {selectedSubject === subject && (
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loading && (
              <ActivityIndicator size="small" color="#318F65" style={styles.loader} />
            )}

            <Text style={styles.warningText}>
              Note: Changing your learning subject may require setting up new preferences.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - heading
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8D3', // Lemon Frost - soft action
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 14,
    color: '#318F65', // Forest Verdant - action text
    marginLeft: 4,
    fontWeight: '500',
  },
  subjectContainer: {
    marginBottom: 8,
  },
  currentSubject: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E5AF00', // Golden Mango - highlighted value
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - secondary text
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF', // Snow - modal background
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - heading
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#5CA480', // Overstep Green - secondary text
    marginBottom: 16,
  },
  subjectsList: {
    maxHeight: 300,
  },
  subjectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#E6F4EC', // Mint Foam - option background
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  selectedSubject: {
    backgroundColor: '#318F65', // Forest Verdant - selected background
    borderColor: '#318F65',
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
  loader: {
    marginVertical: 16,
  },
  warningText: {
    fontSize: 12,
    color: '#5CA480', // Overstep Green - warning text
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
}); 