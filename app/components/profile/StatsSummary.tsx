import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../types/profile';

interface StatsSummaryProps {
  stats: {
    completedPractices: number;
    averageDifficulty: number;
    lastActivity: Date;
  };
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ stats }) => {
  // Format date
  const formatDate = (date: Date) => {
    if (!date) return 'Never';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStatItem = (icon: string, label: string, value: string | number) => {
    return (
      <View style={styles.statItem} key={label}>
        <View style={styles.statIconContainer}>
          <Ionicons name={icon as any} size={22} color="#4f86f7" />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      
      {renderStatItem(
        'checkmark-circle',
        'Completed Practices',
        stats.completedPractices || 0
      )}
      
      {renderStatItem(
        'bar-chart',
        'Average Difficulty', 
        stats.averageDifficulty ? `${stats.averageDifficulty.toFixed(1)}/5` : 'N/A'
      )}
      
      {renderStatItem(
        'time',
        'Last Practice', 
        formatDate(stats.lastActivity)
      )}
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
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 