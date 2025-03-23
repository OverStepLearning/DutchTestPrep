import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { CategorySelector } from './CategorySelector';
import { FeedbackCategory } from '../../types/feedback';

interface FeedbackFormProps {
  title: string;
  message: string;
  category: string;
  categories: FeedbackCategory[];
  submitting: boolean;
  onTitleChange: (text: string) => void;
  onMessageChange: (text: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onSubmit: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  title,
  message,
  category,
  categories,
  submitting,
  onTitleChange,
  onMessageChange,
  onCategoryChange,
  onSubmit
}) => {
  return (
    <View style={styles.formContainer}>
      {/* Category Selection */}
      <CategorySelector 
        categories={categories}
        selectedCategory={category}
        onSelectCategory={onCategoryChange}
      />
      
      {/* Title Input */}
      <ThemedText style={styles.label}>Title (Optional)</ThemedText>
      <TextInput
        style={styles.titleInput}
        placeholder="Enter a title for your feedback"
        value={title}
        onChangeText={onTitleChange}
        maxLength={100}
      />
      
      {/* Message Input */}
      <ThemedText style={styles.label}>Your Feedback *</ThemedText>
      <TextInput
        style={styles.messageInput}
        placeholder="Describe your feedback, suggestion, or issue in detail..."
        value={message}
        onChangeText={onMessageChange}
        multiline
        numberOfLines={6}
        maxLength={2000}
      />
      
      {/* Character count */}
      <View style={styles.characterCount}>
        <ThemedText style={styles.characterCountText}>
          {message.length}/2000
        </ThemedText>
      </View>
      
      {/* Submit button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={onSubmit}
        disabled={submitting || !message.trim() || !category}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <ThemedText style={styles.submitButtonText}>
            Submit Feedback
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 5,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  characterCountText: {
    fontSize: 12,
    color: '#888',
  },
  submitButton: {
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 