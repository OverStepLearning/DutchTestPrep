import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CategoryData {
  category: string;
  correct: number;
  total: number;
}

interface CategoryPerformanceProps {
  categories: CategoryData[];
}

export const CategoryPerformance: React.FC<CategoryPerformanceProps> = ({ categories }) => {
  // Helper function to determine performance color based on percentage
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return styles.highPerformance;
    if (percentage >= 60) return styles.mediumPerformance;
    return styles.lowPerformance;
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Category Performance</Text>
      {categories.map((category, index) => {
        const percentage = Math.round((category.correct / category.total) * 100);
        return (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.category}</Text>
              <Text style={styles.categoryScore}>{percentage}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${percentage}%` },
                  getPerformanceColor(percentage)
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {category.correct} correct out of {category.total}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  categoryItem: {
    marginBottom: 18,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  categoryScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f86f7',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  highPerformance: {
    backgroundColor: '#4CAF50',
  },
  mediumPerformance: {
    backgroundColor: '#FFC107',
  },
  lowPerformance: {
    backgroundColor: '#F44336',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
}); 