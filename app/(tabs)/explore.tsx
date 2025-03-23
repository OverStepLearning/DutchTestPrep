import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FeedbackForm } from '../components/explore/FeedbackForm';
import { FeedbackHistory } from '../components/explore/FeedbackHistory';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackCategory } from '../types/feedback';

// Define feedback categories
const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  { id: 'bug', label: 'Report a Bug', icon: 'bug' },
  { id: 'feature_request', label: 'Feature Request', icon: 'bulb' },
  { id: 'content_quality', label: 'Content Quality', icon: 'document-text' },
  { id: 'difficulty', label: 'Difficulty Level', icon: 'stats-chart' },
  { id: 'other', label: 'Other', icon: 'chatbox' }
];

export default function FeedbackScreen() {
  const {
    title,
    message,
    category,
    submitting,
    feedbackHistory,
    
    setTitle,
    setMessage,
    setCategory,
    
    submitFeedback
  } = useFeedback();

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
          
        <FeedbackForm
          title={title}
          message={message}
          category={category}
          categories={FEEDBACK_CATEGORIES}
          submitting={submitting}
          onTitleChange={setTitle}
          onMessageChange={setMessage}
          onCategoryChange={setCategory}
          onSubmit={submitFeedback}
        />
        
        <FeedbackHistory feedbackItems={feedbackHistory} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});
