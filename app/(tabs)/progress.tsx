import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Config from '@/constants/Config';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

interface Practice {
  _id: string;
  content: string;
  type: string;
  difficulty: number;
  isCorrect: boolean;
  completedAt: string;
  userAnswer: string;
  categories: string[];
}

interface PracticeHistory {
  practices: Practice[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export default function ProgressScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PracticeHistory | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    correctAnswers: 0,
    totalCategories: 0,
    averageScore: 0,
    streakDays: 0
  });

  // Calculate stats
  const calculateStats = (practiceData: Practice[]) => {
    if (!practiceData || practiceData.length === 0) {
      return {
        totalCompleted: 0,
        correctAnswers: 0,
        totalCategories: 0,
        averageScore: 0,
        streakDays: 0
      };
    }
    
    const totalCorrect = practiceData.filter((p: Practice) => p.isCorrect).length;
    const uniqueCategories = new Set();
    
    practiceData.forEach((practice: Practice) => {
      if (practice.categories && Array.isArray(practice.categories)) {
        practice.categories.forEach(category => uniqueCategories.add(category));
      }
    });
    
    return {
      totalCompleted: practiceData.length,
      correctAnswers: totalCorrect,
      totalCategories: uniqueCategories.size,
      averageScore: practiceData.length > 0 ? (totalCorrect / practiceData.length) * 100 : 0,
      streakDays: calculateStreak(practiceData)
    };
  };

  // Fetch practice history
  const fetchPracticeHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const token = await SecureStore.getItemAsync(Config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.get(
        `${Config.API_URL}/api/practice/history/${user._id}?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setHistory(response.data);
      
      // Calculate stats from practice data
      if (response.data && response.data.practices) {
        setStats(calculateStats(response.data.practices));
      }
    } catch (error) {
      console.error('Error fetching practice history:', error);
      setError('Failed to load practice history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate streak based on practice dates
  const calculateStreak = (practices: Practice[]) => {
    if (!practices || practices.length === 0) return 0;
    
    // Sort practices by completion date
    const sortedPractices = [...practices].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    
    // Get unique dates (in YYYY-MM-DD format)
    const uniqueDates = new Set();
    sortedPractices.forEach(practice => {
      if (practice.completedAt) {
        const date = new Date(practice.completedAt);
        uniqueDates.add(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
      }
    });
    
    // This is still a simplified version; a real streak counter would check for consecutive days
    return Math.min(uniqueDates.size, 5);
  };

  // Load practice history on component mount
  useEffect(() => {
    if (user) {
      fetchPracticeHistory();
    }
  }, [user, page]);

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

  // Render practice history item
  const renderPracticeItem = ({ item }: { item: Practice }) => {
    return (
      <View style={[styles.historyItem, item.isCorrect ? styles.correctItem : styles.incorrectItem]}>
        <View style={styles.historyHeader}>
          <View style={styles.typeAndResult}>
            <Text style={styles.practiceType}>
              {item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1)) : 'Unknown'}
            </Text>
            <View style={[styles.resultBadge, item.isCorrect ? styles.correctBadge : styles.incorrectBadge]}>
              {item.isCorrect ? (
                <Ionicons name="checkmark" size={12} color="white" />
              ) : (
                <Ionicons name="close" size={12} color="white" />
              )}
            </View>
          </View>
          <Text style={styles.practiceDate}>{formatDate(item.completedAt)}</Text>
        </View>
        
        <Text style={styles.practiceContent} numberOfLines={2}>{item.content || 'No content'}</Text>
        
        <Text style={styles.answerLabel}>Your answer:</Text>
        <Text style={styles.userAnswer} numberOfLines={2}>{item.userAnswer || 'No answer provided'}</Text>
        
        <View style={styles.categoryContainer}>
          {(item.categories || []).map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
          {(!item.categories || item.categories.length === 0) && (
            <Text style={styles.emptyCategoriesText}>No categories</Text>
          )}
        </View>
      </View>
    );
  };

  // Pagination
  const handleNextPage = () => {
    if (history && page < history.pagination.pages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your Dutch learning journey</Text>
        </View>

        {/* Stats Dashboard */}
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

        {/* Practice History */}
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Practice History</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4f86f7" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchPracticeHistory}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : history && history.practices.length > 0 ? (
            <>
              <FlatList
                data={history.practices}
                renderItem={renderPracticeItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
              
              {/* Pagination Controls */}
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationButton, page === 1 && styles.disabledButton]}
                  onPress={handlePreviousPage}
                  disabled={page === 1}
                >
                  <Ionicons name="chevron-back" size={16} color={page === 1 ? '#adb5bd' : '#495057'} />
                  <Text style={[styles.paginationButtonText, page === 1 && styles.disabledButtonText]}>Previous</Text>
                </TouchableOpacity>
                
                <Text style={styles.pageIndicator}>
                  Page {page} of {history.pagination.pages}
                </Text>
                
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    (history && page >= history.pagination.pages) && styles.disabledButton
                  ]}
                  onPress={handleNextPage}
                  disabled={history && page >= history.pagination.pages}
                >
                  <Text style={[
                    styles.paginationButtonText,
                    (history && page >= history.pagination.pages) && styles.disabledButtonText
                  ]}>Next</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={(history && page >= history.pagination.pages) ? '#adb5bd' : '#495057'}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>You haven't completed any practice sessions yet.</Text>
              <TouchableOpacity 
                style={styles.startPracticeButton}
                onPress={() => {
                  // Navigate to practice tab
                }}
              >
                <Text style={styles.startPracticeButtonText}>Start Practicing</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f86f7',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  historyContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  historyItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  correctItem: {
    backgroundColor: '#f1f9f1',
    borderLeftColor: '#28a745',
  },
  incorrectItem: {
    backgroundColor: '#fff9f9',
    borderLeftColor: '#dc3545',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginRight: 8,
  },
  resultBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctBadge: {
    backgroundColor: '#28a745',
  },
  incorrectBadge: {
    backgroundColor: '#dc3545',
  },
  practiceDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  practiceContent: {
    fontSize: 16,
    color: '#212529',
    marginBottom: 10,
  },
  answerLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 5,
  },
  userAnswer: {
    fontSize: 14,
    color: '#495057',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    color: '#495057',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  pageIndicator: {
    fontSize: 14,
    color: '#6c757d',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#adb5bd',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8d7da',
    borderRadius: 8,
  },
  errorText: {
    color: '#721c24',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  startPracticeButton: {
    backgroundColor: '#4f86f7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startPracticeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyCategoriesText: {
    fontSize: 10,
    color: '#6c757d',
    marginLeft: 6,
  },
}); 