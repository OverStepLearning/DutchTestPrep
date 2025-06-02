import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressStats } from '../../types/progress';

interface StatsDashboardProps {
  stats: ProgressStats;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.totalCompleted}</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.averageScore.toFixed(0)}%</Text>
        <Text style={styles.statLabel}>Accuracy</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.streakDays}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.totalCategories}</Text>
        <Text style={styles.statLabel}>Categories</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5AF00', // Golden Mango - highlighted numbers
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - secondary text
    textAlign: 'center',
    fontWeight: '500',
  },
}); 