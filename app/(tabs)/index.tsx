import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import { Stats } from '../components/home/Stats';
import { PracticeBreakdown } from '../components/home/PracticeBreakdown';
import { CategoryPerformance } from '../components/home/CategoryPerformance';
import { RecentActivity } from '../components/home/RecentActivity';
import { PracticeStats, CategoryPerformance as CategoryData, ActivityItem } from '../types/home';

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
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

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
            <Stats 
              total={stats.total} 
              correct={stats.correct} 
              streak={stats.streak} 
            />

            {/* Practice Type Breakdown */}
            <PracticeBreakdown 
              vocabulary={stats.vocabulary}
              grammar={stats.grammar}
              conversation={stats.conversation}
              total={stats.total}
            />

            {/* Category Performance */}
            <CategoryPerformance categories={categoryPerformance} />

            {/* Recent Activity */}
            <RecentActivity activities={recentActivity} />
          </>
        )}
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
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
