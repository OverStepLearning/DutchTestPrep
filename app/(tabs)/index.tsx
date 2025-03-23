import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import { router } from 'expo-router';

interface PracticeStats {
  total: number;
  correct: number;
  vocabulary: number;
  grammar: number;
  conversation: number;
  streak: number;
  lastPractice: string;
}

interface CategoryPerformance {
  category: string;
  correct: number;
  total: number;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PracticeStats>({
    total: 0,
    correct: 0,
    vocabulary: 0,
    grammar: 0,
    conversation: 0,
    streak: 0,
    lastPractice: ''
  });
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Fetch user progress data
  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      
      // For demonstration, using placeholder data
      // In a real app, you would fetch this from API:
      // const response = await axios.get(`${Config.API_URL}/api/progress`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // Simulate API response with placeholder data
      setTimeout(() => {
        // Placeholder stats
        setStats({
          total: 120,
          correct: 85,
          vocabulary: 65,
          grammar: 40,
          conversation: 15,
          streak: 7,
          lastPractice: new Date().toISOString()
        });
        
        // Placeholder category performance
        setCategoryPerformance([
          { category: 'Verbs', correct: 28, total: 35 },
          { category: 'Nouns', correct: 22, total: 25 },
          { category: 'Adjectives', correct: 15, total: 20 },
          { category: 'Prepositions', correct: 10, total: 15 },
          { category: 'Phrases', correct: 12, total: 15 }
        ]);
        
        // Placeholder recent activity
        setRecentActivity([
          { 
            date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
            type: 'vocabulary',
            score: 90,
            topic: 'Daily routines'
          },
          { 
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
            type: 'grammar',
            score: 75,
            topic: 'Present tense'
          },
          { 
            date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), 
            type: 'conversation',
            score: 85,
            topic: 'At the restaurant'
          }
        ]);
        
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching user progress:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  // Get accuracy percentage
  const getAccuracyPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
  };

  // Format date string
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress Dashboard</Text>
          <Text style={styles.subtitle}>Track your Dutch language learning journey</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f86f7" />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        ) : (
          <>
            {/* Overview Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Exercises</Text>
        </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{getAccuracyPercentage()}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>

            {/* Practice Type Breakdown */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Practice Breakdown</Text>
              <View style={styles.breakdownContainer}>
                {/* Visual representation of practice types */}
                <View style={styles.breakdownChart}>
                  <View 
                    style={[
                      styles.breakdownBar, 
                      styles.vocabularyBar,
                      { flex: stats.vocabulary / stats.total }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.breakdownBar, 
                      styles.grammarBar,
                      { flex: stats.grammar / stats.total }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.breakdownBar, 
                      styles.conversationBar,
                      { flex: stats.conversation / stats.total }
                    ]} 
                  />
                </View>
                
                {/* Legend */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColorBox, styles.vocabularyBar]} />
                    <Text style={styles.legendText}>Vocabulary ({stats.vocabulary})</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColorBox, styles.grammarBar]} />
                    <Text style={styles.legendText}>Grammar ({stats.grammar})</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColorBox, styles.conversationBar]} />
                    <Text style={styles.legendText}>Conversation ({stats.conversation})</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Category Performance */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Category Performance</Text>
              {categoryPerformance.map((category, index) => {
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

            {/* Recent Activity */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {recentActivity.map((activity, index) => (
                <View key={index} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <View style={[styles.activityTypeTag, getActivityTypeStyle(activity.type)]}>
                      <Text style={styles.activityTypeText}>{activity.type}</Text>
                    </View>
                    <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
                  </View>
                  <Text style={styles.activityTopic}>{activity.topic}</Text>
                  <View style={styles.activityScoreContainer}>
                    <Text style={styles.activityScoreLabel}>Score:</Text>
                    <Text style={[styles.activityScore, getScoreStyle(activity.score)]}>
                      {activity.score}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Practice Button */}
              <TouchableOpacity
              style={styles.practiceButton}
              onPress={() => router.push('/(tabs)/practice')}
            >
              <Text style={styles.practiceButtonText}>Start New Practice</Text>
              </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions for styling
const getPerformanceColor = (percentage: number) => {
  if (percentage >= 80) return styles.goodPerformance;
  if (percentage >= 60) return styles.averagePerformance;
  return styles.needsImprovementPerformance;
};

const getActivityTypeStyle = (type: string) => {
  switch (type) {
    case 'vocabulary': return styles.vocabularyActivity;
    case 'grammar': return styles.grammarActivity;
    case 'conversation': return styles.conversationActivity;
    default: return styles.vocabularyActivity;
  }
};

const getScoreStyle = (score: number) => {
  if (score >= 80) return styles.goodScore;
  if (score >= 60) return styles.averageScore;
  return styles.poorScore;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6c757d',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f86f7',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  breakdownContainer: {
    marginBottom: 10,
  },
  breakdownChart: {
    height: 30,
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  breakdownBar: {
    height: '100%',
  },
  vocabularyBar: {
    backgroundColor: '#4f86f7',
  },
  grammarBar: {
    backgroundColor: '#FF9500',
  },
  conversationBar: {
    backgroundColor: '#4CD964',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6c757d',
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f86f7',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
  },
  goodPerformance: {
    backgroundColor: '#4CD964',
  },
  averagePerformance: {
    backgroundColor: '#FF9500',
  },
  needsImprovementPerformance: {
    backgroundColor: '#FF3B30',
  },
  activityCard: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 15,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  vocabularyActivity: {
    backgroundColor: '#4f86f7',
  },
  grammarActivity: {
    backgroundColor: '#FF9500',
  },
  conversationActivity: {
    backgroundColor: '#4CD964',
  },
  activityDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  activityTopic: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  activityScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityScoreLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 5,
  },
  activityScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  goodScore: {
    color: '#4CD964',
  },
  averageScore: {
    color: '#FF9500',
  },
  poorScore: {
    color: '#FF3B30',
  },
  practiceButton: {
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  practiceButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  }
});
