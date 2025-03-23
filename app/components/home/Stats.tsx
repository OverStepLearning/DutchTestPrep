import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsProps {
  total: number;
  correct: number;
  streak: number;
}

export const Stats: React.FC<StatsProps> = ({ total, correct, streak }) => {
  // Calculate accuracy percentage
  const getAccuracyPercentage = () => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{total}</Text>
        <Text style={styles.statLabel}>Total Exercises</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statValue}>{getAccuracyPercentage()}%</Text>
        <Text style={styles.statLabel}>Accuracy</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{streak}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4f86f7',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 