import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, Platform, TextInput, TouchableOpacity, Alert, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';
import axios from 'axios';
import config from '@/constants/Config';

// Define feedback categories
const FEEDBACK_CATEGORIES = [
  { id: 'bug', label: 'Report a Bug', icon: 'bug' },
  { id: 'feature_request', label: 'Feature Request', icon: 'bulb' },
  { id: 'content_quality', label: 'Content Quality', icon: 'document-text' },
  { id: 'difficulty', label: 'Difficulty Level', icon: 'stats-chart' },
  { id: 'other', label: 'Other', icon: 'chatbox' }
];

export default function FeedbackScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [lastSubmission, setLastSubmission] = useState<Date | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  
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
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.titleContainer}>
          <Ionicons name="chatbubbles" size={28} color="#4f86f7" />
          <ThemedText type="title">Feedback</ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.subtitle}>
          Help us improve by sharing your thoughts, reporting bugs, or suggesting new features.
        </ThemedText>
        
        <View style={styles.formContainer}>
          {/* Category Selection */}
          <ThemedText style={styles.label}>Category *</ThemedText>
          <View style={styles.categoryContainer}>
            {FEEDBACK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.id && styles.categoryButtonSelected
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={22} 
                  color={category === cat.id ? '#4f86f7' : '#666'} 
                />
                <ThemedText
                  style={[
                    styles.categoryText,
                    category === cat.id && styles.categoryTextSelected
                  ]}
                >
                  {cat.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Title Input */}
          <ThemedText style={styles.label}>Title (Optional)</ThemedText>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter a title for your feedback"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          
          {/* Message Input */}
          <ThemedText style={styles.label}>Your Feedback *</ThemedText>
          <TextInput
            style={styles.messageInput}
            placeholder="Describe your feedback, suggestion, or issue in detail..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            maxLength={2000}
          />
          
          {/* Character Counter */}
          <ThemedText style={styles.charCounter}>
            {message.length}/2000
          </ThemedText>
          
          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!message.trim() || !category || submitting) && styles.submitButtonDisabled
            ]}
            onPress={submitFeedback}
            disabled={!message.trim() || !category || submitting}
          >
            {submitting ? (
              <ThemedText style={styles.submitButtonText}>Submitting...</ThemedText>
            ) : (
              <ThemedText style={styles.submitButtonText}>Submit Feedback</ThemedText>
            )}
          </TouchableOpacity>
          
          {/* Rate limit info */}
          <ThemedText style={styles.rateInfo}>
            {5 - submissionCount} submissions remaining today
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonSelected: {
    backgroundColor: '#e6f0ff',
    borderColor: '#4f86f7',
  },
  categoryText: {
    fontSize: 14,
    marginLeft: 4,
  },
  categoryTextSelected: {
    color: '#4f86f7',
    fontWeight: '600',
  },
  titleInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 16,
  },
  messageInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#b0c4e8',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  rateInfo: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'center',
    marginTop: 12,
  },
});
