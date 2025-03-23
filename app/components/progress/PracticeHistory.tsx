import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PracticeHistoryItem } from './PracticeHistoryItem';
import { PracticeHistory as PracticeHistoryType } from '../../types/progress';

interface PracticeHistoryProps {
  history: PracticeHistoryType | null;
  loading: boolean;
  error: string | null;
  page: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const PracticeHistory: React.FC<PracticeHistoryProps> = ({
  history,
  loading,
  error,
  page,
  onNextPage,
  onPreviousPage
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f86f7" />
        <Text style={styles.loadingText}>Loading practice history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!history || history.practices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No practice history available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice History</Text>
      
      <FlatList
        data={history.practices}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PracticeHistoryItem practice={item} />}
        scrollEnabled={false}
      />
      
      {/* Pagination Controls */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, page <= 1 && styles.disabledButton]}
          onPress={onPreviousPage}
          disabled={page <= 1}
        >
          <Text style={[styles.paginationButtonText, page <= 1 && styles.disabledButtonText]}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.paginationInfo}>
          Page {page} of {history.pagination.pages}
        </Text>
        
        <TouchableOpacity
          style={[styles.paginationButton, page >= history.pagination.pages && styles.disabledButton]}
          onPress={onNextPage}
          disabled={page >= history.pagination.pages}
        >
          <Text style={[styles.paginationButtonText, page >= history.pagination.pages && styles.disabledButtonText]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationButton: {
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  paginationButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  disabledButtonText: {
    color: '#9e9e9e',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#666',
  },
}); 