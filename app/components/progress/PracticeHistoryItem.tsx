import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Practice } from '../../types/progress';

interface PracticeHistoryItemProps {
  practice: Practice;
}

export const PracticeHistoryItem: React.FC<PracticeHistoryItemProps> = ({ practice }) => {
  // Format date string
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <View style={[styles.historyItem, practice.isCorrect ? styles.correctItem : styles.incorrectItem]}>
      <View style={styles.historyHeader}>
        <View style={styles.typeAndResult}>
          <Text style={styles.practiceType}>
            {practice.type ? (practice.type.charAt(0).toUpperCase() + practice.type.slice(1)) : 'Unknown'}
          </Text>
          <View style={[styles.resultBadge, practice.isCorrect ? styles.correctBadge : styles.incorrectBadge]}>
            {practice.isCorrect ? (
              <Ionicons name="checkmark" size={12} color="white" />
            ) : (
              <Ionicons name="close" size={12} color="white" />
            )}
          </View>
        </View>
        <Text style={styles.practiceDate}>{formatDate(practice.completedAt)}</Text>
      </View>
      
      <Text style={styles.practiceContent} numberOfLines={2}>{practice.content || 'No content'}</Text>
      
      <Text style={styles.answerLabel}>Your answer:</Text>
      <Text style={styles.userAnswer} numberOfLines={2}>{practice.userAnswer || 'No answer provided'}</Text>
      
      <View style={styles.categoryContainer}>
        {(practice.categories || []).map((category, index) => (
          <View key={index} style={styles.categoryTag}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
        {(!practice.categories || practice.categories.length === 0) && (
          <Text style={styles.emptyCategoriesText}>No categories</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  correctItem: {
    borderLeftColor: '#4caf50',
  },
  incorrectItem: {
    borderLeftColor: '#f44336',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeAndResult: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  practiceType: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  resultBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctBadge: {
    backgroundColor: '#4caf50',
  },
  incorrectBadge: {
    backgroundColor: '#f44336',
  },
  practiceDate: {
    fontSize: 14,
    color: '#666',
  },
  practiceContent: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  answerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userAnswer: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  categoryTag: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#4f86f7',
  },
  emptyCategoriesText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
}); 