import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { UserProfile } from '../../types/profile';
import { EditPreferences } from './EditPreferences';
import { Ionicons } from '@expo/vector-icons';

interface PreferencesDisplayProps {
  preferences: UserProfile['preferences'];
  onPreferencesUpdate: (updatedPreferences: UserProfile['preferences']) => void;
}

export const PreferencesDisplay: React.FC<PreferencesDisplayProps> = ({ 
  preferences,
  onPreferencesUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (updatedPreferences: UserProfile['preferences']) => {
    onPreferencesUpdate(updatedPreferences);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const renderTagList = (title: string, items: string[]) => {
    if (!items || items.length === 0) {
      return (
        <View style={styles.section} key={title}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.emptyMessage}>No preferences set</Text>
        </View>
      );
    }

    return (
      <View style={styles.section} key={title}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.tagsContainer}>
          {items.map((item, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Preferences</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="pencil" size={18} color="#4f86f7" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {renderTagList('Preferred Categories', preferences?.preferredCategories || [])}
      {renderTagList('Challenge Areas', preferences?.challengeAreas || [])}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Reason</Text>
        <Text style={styles.reasonText}>
          {preferences?.learningReason || 'No reason specified'}
        </Text>
      </View>

      <Modal
        visible={isEditing}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <EditPreferences 
          preferences={preferences}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  editText: {
    color: '#4f86f7',
    marginLeft: 4,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  emptyMessage: {
    fontStyle: 'italic',
    color: '#888',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4f86f7',
    fontSize: 14,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
}); 