import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ActivityItem {
  date: string;
  type: string;
  score: number;
  topic: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Helper function to get style based on activity type
  const getActivityTypeStyle = (type: string) => {
    if (type === 'vocabulary') return styles.vocabularyTag;
    if (type === 'grammar') return styles.grammarTag;
    return styles.conversationTag;
  };

  // Helper function to get style based on score
  const getScoreStyle = (score: number) => {
    if (score >= 80) return styles.highScore;
    if (score >= 60) return styles.mediumScore;
    return styles.lowScore;
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {activities.map((activity, index) => (
        <View key={index} style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={[styles.activityTypeTag, getActivityTypeStyle(activity.type)]}>
              <Text style={styles.activityTypeText}>{activity.type}</Text>
            </View>
            <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
          </View>
          <Text style={styles.activityTopic}>{activity.topic}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score:</Text>
            <Text style={[styles.scoreValue, getScoreStyle(activity.score)]}>
              {activity.score}%
            </Text>
          </View>
        </View>
      ))}
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
  activityCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityTypeTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  vocabularyTag: {
    backgroundColor: '#e3f2fd',
  },
  grammarTag: {
    backgroundColor: '#fff8e1',
  },
  conversationTag: {
    backgroundColor: '#e8f5e9',
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  activityTopic: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  highScore: {
    color: '#4CAF50',
  },
  mediumScore: {
    color: '#FFC107',
  },
  lowScore: {
    color: '#F44336',
  },
}); 