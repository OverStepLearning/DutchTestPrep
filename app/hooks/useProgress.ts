import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';
import { Practice, PracticeHistory, ProgressStats } from '../types/progress';
import * as apiService from '@/utils/apiService';
import { useTabContext } from '@/contexts/TabContext';
import { PracticeEventEmitter, practiceEvents } from './useProfile';

export function useProgress() {
  const { user } = useAuth();
  const { currentSubject: tabSubject } = useTabContext();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PracticeHistory | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [lastFetchedSubject, setLastFetchedSubject] = useState<string>('');
  const [stats, setStats] = useState<ProgressStats>({
    totalCompleted: 0,
    correctAnswers: 0,
    totalCategories: 0,
    averageScore: 0,
    streakDays: 0
  });

  // Update currentSubject when tabSubject changes
  useEffect(() => {
    if (tabSubject && tabSubject !== currentSubject) {
      console.log(`[Progress] Subject changed to ${tabSubject} from TabContext, resetting page to 1`);
      setCurrentSubject(tabSubject);
      setPage(1);
      
      // Force a refresh when subject changes
      fetchPracticeHistory(tabSubject);
    }
  }, [tabSubject]);

  // Reset page counter when subject changes
  useEffect(() => {
    if (currentSubject && currentSubject !== lastFetchedSubject) {
      console.log(`[Progress] Subject changed to ${currentSubject}, resetting page to 1`);
      setPage(1);
      
      // Force a refresh when subject changes
      fetchPracticeHistory(currentSubject);
    }
  }, [currentSubject, lastFetchedSubject]);
  
  // Listen for practice completion events
  useEffect(() => {
    const onPracticeCompleted = () => {
      console.log('[Progress] Practice completed event received');
      if (currentSubject === tabSubject) {
        // Refresh data to show the new practice
        fetchPracticeHistory(currentSubject);
      }
    };
    
    // Add event listener
    const subscription = PracticeEventEmitter.addListener(
      practiceEvents.PRACTICE_COMPLETED, 
      onPracticeCompleted
    );
    
    // Clean up
    return () => {
      subscription.remove();
    };
  }, [currentSubject, tabSubject]);

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
    
    // This is a simplified version; a real streak counter would check for consecutive days
    return Math.min(uniqueDates.size, 5);
  };

  // Fetch practice history, with option to override current subject
  const fetchPracticeHistory = async (overrideSubject?: string): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const token = await storage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiService.setAuthToken(token);
      }

      // Use the provided subject, or tabSubject from context, or fallback to currentSubject
      const learningSubject = overrideSubject || tabSubject || currentSubject || 'Dutch';
      
      console.log(`[Progress] Fetching practice history for subject: ${learningSubject}`);
      
      // Include learningSubject as a query parameter
      const response = await apiService.get(`/api/practice/history/${user._id}?page=${page}&limit=10&learningSubject=${learningSubject}`);

      // Update last fetched subject
      setLastFetchedSubject(learningSubject);
      
      // Map backend response structure to frontend expected structure
      if (response && response.success) {
        // Add subject to each practice record for display purposes
        const practices = response.data || [];
        const practicesWithSubject = practices.map((practice: Practice) => ({
          ...practice,
          subject: learningSubject
        }));
        
        const practiceHistory: PracticeHistory = {
          practices: practicesWithSubject,
          pagination: {
            total: response.pagination.total || 0,
            page: response.pagination.page || 1,
            pages: response.pagination.totalPages || 1
          }
        };
        
        setHistory(practiceHistory);
        
        // Calculate stats from practice data
        setStats(calculateStats(practicesWithSubject));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching practice history:', error);
      setError('Failed to load practice history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
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

  // Load practice history on component mount or when page changes
  useEffect(() => {
    if (user) {
      // Use tabSubject directly from context
      fetchPracticeHistory(tabSubject);
    }
  }, [user, page, tabSubject]);

  return {
    loading,
    history,
    error,
    stats,
    page,
    handleNextPage,
    handlePreviousPage,
    fetchPracticeHistory,
    currentSubject
  };
} 