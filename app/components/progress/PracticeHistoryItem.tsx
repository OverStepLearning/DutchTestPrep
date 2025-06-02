import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Practice } from '../../types/progress';

interface PracticeHistoryItemProps {
  practice: Practice;
}

export const PracticeHistoryItem: React.FC<PracticeHistoryItemProps> = ({ practice }) => {
  // Ensure practice exists to prevent crashes
  if (!practice) {
    return (
      <View style={styles.historyItem}>
        <Text style={styles.errorText}>Invalid practice data</Text>
      </View>
    );
  }
  
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

  // Safe access to properties with defaults
  const isCorrect = practice.isCorrect ?? false;
  const practiceType = practice.type 
    ? (practice.type.charAt(0).toUpperCase() + practice.type.slice(1)) 
    : 'Unknown';
  const content = practice.content || 'No content';
  const userAnswer = practice.userAnswer || 'No answer provided';
  const categories = Array.isArray(practice.categories) ? practice.categories : [];
  
  return (
    <View style={[styles.historyItem, isCorrect ? styles.correctItem : styles.incorrectItem]}>
      <View style={styles.historyHeader}>
        <View style={styles.typeAndResult}>
          <Text style={styles.practiceType}>{practiceType}</Text>
          <View style={[styles.resultBadge, isCorrect ? styles.correctBadge : styles.incorrectBadge]}>
            {isCorrect ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : (
              <Ionicons name="close" size={12} color="#FFFFFF" />
            )}
          </View>
        </View>
        <Text style={styles.practiceDate}>{formatDate(practice.completedAt)}</Text>
      </View>
      
      <Text style={styles.practiceContent} numberOfLines={2}>{content}</Text>
      
      <Text style={styles.answerLabel}>Your answer:</Text>
      <Text style={styles.userAnswer} numberOfLines={2}>{userAnswer}</Text>
      
      <View style={styles.categoryContainer}>
        {categories.map((category, index) => (
          <View key={index} style={styles.categoryTag}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
        {categories.length === 0 && (
          <Text style={styles.emptyCategoriesText}>No categories</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  historyItem: {
    backgroundColor: '#FFFFFF', // Snow - card surface
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
    borderLeftColor: '#5CA480', // Overstep Green - correct
  },
  incorrectItem: {
    borderLeftColor: '#E5AF00', // Golden Mango - incorrect (warning)
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
    color: '#318F65', // Forest Verdant - heading
  },
  resultBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctBadge: {
    backgroundColor: '#5CA480', // Overstep Green - correct
  },
  incorrectBadge: {
    backgroundColor: '#E5AF00', // Golden Mango - incorrect
  },
  practiceDate: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - secondary text
    fontWeight: '500',
  },
  practiceContent: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
    color: '#212121', // Charcoal - main text
  },
  answerLabel: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - secondary text
    marginBottom: 4,
    fontWeight: '500',
  },
  userAnswer: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
    color: '#212121', // Charcoal - main text
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  categoryTag: {
    backgroundColor: '#E6F4EC', // Mint Foam - tag background
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  categoryText: {
    fontSize: 12,
    color: '#318F65', // Forest Verdant - tag text
    fontWeight: '500',
  },
  emptyCategoriesText: {
    fontSize: 12,
    color: '#5CA480', // Overstep Green - secondary text
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: '#E5AF00', // Golden Mango - error text
    fontStyle: 'italic',
    fontWeight: '500',
  },
}); 