import React, { useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { usePractice } from '../../hooks/usePractice';
import { practiceStyles } from './styles';
import { DifficultyAdjuster } from './DifficultyAdjuster';
import { AnswerInput } from './AnswerInput';
import { FeedbackDisplay } from './FeedbackDisplay';

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
    difficultyTrend,
    difficultyChange,
    adjusting,
    adjustmentMode,
    showAdjustmentDialog,
    handleNextPractice,
    askFollowUpQuestion,
    feedbackAnswer,
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

  return (
    <View style={practiceStyles.container}>
      {/* Content will be your practice exercise display */}
      <View style={practiceStyles.practiceContainer}>
        <Text style={practiceStyles.practiceText}>{currentPractice.content}</Text>
        
        {/* Difficulty adjuster */}
        <DifficultyAdjuster
          difficultyTrend={difficultyTrend}
          difficultyValue={currentPractice.difficulty}
          complexityValue={currentPractice.complexity}
          difficultyChange={difficultyChange}
          adjusting={adjusting}
          adjustmentMode={adjustmentMode}
          onAdjustDifficulty={showAdjustmentDialog}
        />
        
        {/* Answer input */}
        <AnswerInput
          practice={currentPractice}
          userAnswer={userAnswer}
          onChangeAnswer={setUserAnswer}
          onSubmit={submitAnswer}
          disabled={!!feedback || loading}
        />
        
        {/* Feedback display */}
        {feedback && (
          <FeedbackDisplay
            feedback={feedback}
            practice={currentPractice}
            userAnswer={userAnswer}
            feedbackQuestion={feedbackQuestion}
            onSetFeedbackQuestion={setFeedbackQuestion}
            onNextPractice={handleNextPractice}
            onAskQuestion={askFollowUpQuestion}
            askingQuestion={askingQuestion}
            feedbackAnswer={feedbackAnswer}
          />
        )}
      </View>
    </View>
  );
};

export default Practice; 