import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { FeedbackItem } from '../../types/feedback';

interface FeedbackHistoryProps {
  feedbackItems: FeedbackItem[];
}

export const FeedbackHistory: React.FC<FeedbackHistoryProps> = ({ feedbackItems }) => {
  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFC107';
      case 'in progress':
        return '#2196F3';
      case 'completed':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  if (feedbackItems.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>Your Feedback History</ThemedText>
        <ThemedText style={styles.emptyMessage}>
          You haven't submitted any feedback yet.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Your Feedback History</ThemedText>
      {feedbackItems.map((item, index) => (
        <View key={item.id} style={styles.historyItem}>
          <View style={styles.historyItemHeader}>
            <ThemedText style={styles.historyItemTitle}>
              {item.title || 'Feedback'}
            </ThemedText>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}>
              <ThemedText style={styles.statusText}>
                {item.status}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.historyItemDate}>
            Submitted on {formatDate(item.createdAt)}
          </ThemedText>
          <ThemedText numberOfLines={2} style={styles.historyItemMessage}>
            {item.message}
          </ThemedText>
        </View>
      ))}
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
    color: '#333',
  },
  emptyMessage: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  historyItemDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  historyItemMessage: {
    fontSize: 14,
    color: '#333',
  },
}); 