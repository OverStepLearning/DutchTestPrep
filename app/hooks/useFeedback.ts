import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';
import axios from 'axios';
import config from '@/constants/Config';
import { FeedbackItem } from '../types/feedback';

export function useFeedback() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [lastSubmission, setLastSubmission] = useState<Date | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);

  // Get submission count from storage to enforce rate limiting
  useEffect(() => {
    const loadSubmissionData = async () => {
      try {
        const countStr = await storage.getItem('feedback_submission_count');
        const lastTimeStr = await storage.getItem('feedback_last_submission');
        
        if (countStr) {
          const count = parseInt(countStr, 10);
          setSubmissionCount(count);
        }
        
        if (lastTimeStr) {
          setLastSubmission(new Date(lastTimeStr));
        }
        
        // Reset count if last submission was more than 24 hours ago
        if (lastTimeStr) {
          const lastTime = new Date(lastTimeStr);
          const now = new Date();
          const hoursSinceLastSubmission = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceLastSubmission > 24) {
            await storage.setItem('feedback_submission_count', '0');
            setSubmissionCount(0);
          }
        }
      } catch (error) {
        console.error('Error loading submission data:', error);
      }
    };
    
    loadSubmissionData();
    fetchFeedbackHistory();
  }, [user]);

  // Fetch user's feedback history
  const fetchFeedbackHistory = async () => {
    if (!user) return;
    
    try {
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.get(`${config.API_URL}/api/feedback/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setFeedbackHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching feedback history:', error);
    }
  };

  // Submit feedback to the server
  const submitFeedback = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit feedback');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your feedback message');
      return;
    }
    
    if (!category) {
      Alert.alert('Error', 'Please select a feedback category');
      return;
    }
    
    // Rate limiting: Max 5 submissions per 24 hours
    if (submissionCount >= 5) {
      const now = new Date();
      const lastTime = lastSubmission || now;
      const hoursSinceLastSubmission = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastSubmission < 24) {
        const hoursLeft = Math.ceil(24 - hoursSinceLastSubmission);
        Alert.alert(
          'Rate Limit Reached',
          `You've submitted the maximum number of feedback items for today. Please try again in ${hoursLeft} hours.`
        );
        return;
      }
    }
    
    // Input validation and sanitization
    if (message.length > 2000) {
      Alert.alert('Error', 'Feedback message is too long (max 2000 characters)');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.post(
        `${config.API_URL}/api/feedback/general`,
        {
          title: title.trim() || 'Feedback',
          message: message.trim(),
          category
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'App-Version': config.VERSION || '1.0.0'
          }
        }
      );
      
      if (response.data.success) {
        // Update submission count for rate limiting
        const newCount = submissionCount + 1;
        await storage.setItem('feedback_submission_count', newCount.toString());
        await storage.setItem('feedback_last_submission', new Date().toISOString());
        
        setSubmissionCount(newCount);
        setLastSubmission(new Date());
        
        // Reset form
        setTitle('');
        setMessage('');
        setCategory('');
        
        Alert.alert(
          'Feedback Submitted',
          'Thank you for your feedback! We appreciate your input to help improve the app.',
          [{ text: 'OK' }]
        );
        
        // Refresh feedback history
        fetchFeedbackHistory();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      let errorMessage = 'Failed to submit feedback. Please try again later.';
      
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 429) {
          errorMessage = 'You\'ve submitted too many feedback items. Please try again later.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    title,
    message,
    category,
    submitting,
    feedbackHistory,
    
    setTitle,
    setMessage,
    setCategory,
    
    submitFeedback,
    fetchFeedbackHistory
  };
} 