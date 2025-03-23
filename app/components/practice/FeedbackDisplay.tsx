import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { practiceStyles } from './styles';
import { PracticeItem, FeedbackResponse } from '../../types/practice';
import { displayContent } from '../../utils/practiceUtils';

interface FeedbackDisplayProps {
  feedback: FeedbackResponse;
  practice: PracticeItem;
  userAnswer: string;
  feedbackQuestion: string;
  feedbackAnswer: string | null;
  askingQuestion: boolean;
  onNextPractice: () => void;
  onSetFeedbackQuestion: (text: string) => void;
  onAskQuestion: () => void;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  feedback,
  practice,
  userAnswer,
  feedbackQuestion,
  feedbackAnswer,
  askingQuestion,
  onNextPractice,
  onSetFeedbackQuestion,
  onAskQuestion
}) => {
  return (
    <View style={practiceStyles.feedbackContainer}>
      <Text style={[
        practiceStyles.feedbackTitle, 
        { color: feedback.isCorrect ? '#4CAF50' : '#F44336' }
      ]}>
        {feedback.isCorrect ? 'Correct!' : 'Not quite right'}
      </Text>
      <Text style={practiceStyles.feedbackText}>
        {displayContent(feedback.feedback)}
      </Text>
      
      {/* Next practice button */}
      <TouchableOpacity 
        style={practiceStyles.nextButton} 
        onPress={onNextPractice}
      >
        <Text style={practiceStyles.buttonText}>Next Practice</Text>
      </TouchableOpacity>
      
      {/* Show translation if available */}
      {practice && practice.translation && (
        <View style={practiceStyles.translationContainer}>
          <Text style={practiceStyles.translationLabel}>Translation:</Text>
          <Text style={practiceStyles.translationText}>
            {displayContent(practice.translation)}
          </Text>
        </View>
      )}
      
      {/* Feedback question section */}
      <View style={practiceStyles.feedbackQuestionContainer}>
        <Text style={practiceStyles.feedbackQuestionLabel}>
          Have questions about the feedback? Ask here:
        </Text>
        <TextInput
          style={practiceStyles.feedbackQuestionInput}
          placeholder="Type your question here..."
          value={feedbackQuestion}
          onChangeText={onSetFeedbackQuestion}
          multiline
        />
        <TouchableOpacity
          style={[
            practiceStyles.askButton,
            (!feedbackQuestion.trim() || askingQuestion) && practiceStyles.disabledButton
          ]}
          onPress={onAskQuestion}
          disabled={!feedbackQuestion.trim() || askingQuestion}
        >
          {askingQuestion ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={practiceStyles.buttonText}>Ask</Text>
          )}
        </TouchableOpacity>
        
        {feedbackAnswer && (
          <View style={practiceStyles.answerContainer}>
            <Text style={practiceStyles.answerLabel}>Answer:</Text>
            <Text style={practiceStyles.answerText}>{feedbackAnswer}</Text>
          </View>
        )}
      </View>
    </View>
  );
}; 