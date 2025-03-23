import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserProfile } from '../../types/profile';

interface PreferencesDisplayProps {
  preferences: UserProfile['preferences'];
}

export const PreferencesDisplay: React.FC<PreferencesDisplayProps> = ({ preferences }) => {
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
      <Text style={styles.title}>Learning Preferences</Text>

      {renderTagList('Preferred Categories', preferences?.preferredCategories || [])}
      {renderTagList('Challenge Areas', preferences?.challengeAreas || [])}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Reason</Text>
        <Text style={styles.reasonText}>
          {preferences?.learningReason || 'No reason specified'}
        </Text>
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
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