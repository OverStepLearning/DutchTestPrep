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
  currentSubject?: string;
}

export const PracticeHistory: React.FC<PracticeHistoryProps> = ({
  history,
  loading,
  error,
  page,
  onNextPage,
  onPreviousPage,
  currentSubject = ''
}) => {
  // Create title with subject if available
  const historyTitle = currentSubject ? `${currentSubject} Practice History` : 'Practice History';
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#318F65" />
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

  if (!history || !Array.isArray(history.practices) || history.practices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No practice history available</Text>
      </View>
    );
  }

  // Safely extract pagination values with defaults
  const totalPages = history.pagination?.pages || 1;
  const currentPage = page || 1;
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{historyTitle}</Text>
      
      <FlatList
        data={history.practices}
        keyExtractor={(item) => item._id || Math.random().toString()}
        renderItem={({ item }) => <PracticeHistoryItem practice={item} />}
        scrollEnabled={false}
      />
      
      {/* Pagination Controls */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, !hasPrevious && styles.disabledButton]}
          onPress={onPreviousPage}
          disabled={!hasPrevious}
        >
          <Text style={[styles.paginationButtonText, !hasPrevious && styles.disabledButtonText]}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.paginationInfo}>
          Page {currentPage} of {totalPages}
        </Text>
        
        <TouchableOpacity
          style={[styles.paginationButton, !hasNext && styles.disabledButton]}
          onPress={onNextPage}
          disabled={!hasNext}
        >
          <Text style={[styles.paginationButtonText, !hasNext && styles.disabledButtonText]}>
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
    color: '#318F65', // Forest Verdant - heading
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#5CA480', // Overstep Green - secondary text
    fontWeight: '500',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFF8D3', // Lemon Frost - error background
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E5AF00', // Golden Mango - warning accent
  },
  errorText: {
    color: '#318F65', // Forest Verdant - error text
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F4EC', // Mint Foam - empty state background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  emptyText: {
    fontSize: 16,
    color: '#212121', // Charcoal - main text
    textAlign: 'center',
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationButton: {
    backgroundColor: '#5CA480', // Overstep Green - secondary action
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paginationButtonText: {
    color: '#FFFFFF', // Snow - button text
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#E6F4EC', // Mint Foam - disabled background
  },
  disabledButtonText: {
    color: '#5CA480', // Overstep Green - disabled text
  },
  paginationInfo: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - secondary text
    fontWeight: '500',
  },
}); 