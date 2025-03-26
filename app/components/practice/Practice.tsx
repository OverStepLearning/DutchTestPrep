import React, { useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { usePractice } from '../../hooks/usePractice';
import { practiceStyles } from './styles';

const Practice = () => {
  const {
    currentPractice,
    userAnswer,
    setUserAnswer,
    loading,
    submitAnswer,
    feedback,
    generatePractice,
    feedbackQuestion,
    setFeedbackQuestion,
    askingQuestion,
    errorMessage,
  } = usePractice();

  // Handle the initial load and empty state
  useEffect(() => {
    if (!currentPractice && !loading) {
      generatePractice();
    }
  }, [currentPractice, loading]);

  // If there's an error, show it
  if (errorMessage) {
    return (
      <View style={practiceStyles.container}>
        <Text style={practiceStyles.errorText}>{errorMessage}</Text>
        <Button title="Try Again" onPress={() => generatePractice(true)} />
      </View>
    );
  }

  // Show loading state
  if (loading || !currentPractice) {
    return (
      <View style={practiceStyles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // ... existing code ...
};

export default Practice; 