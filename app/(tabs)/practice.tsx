import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePractice } from '../hooks/usePractice';
import { practiceStyles } from '../components/practice/styles';
import { DifficultyAdjuster } from '../components/practice/DifficultyAdjuster';
import { PracticeContent } from '../components/practice/PracticeContent';
import { AnswerInput } from '../components/practice/AnswerInput';
import { FeedbackDisplay } from '../components/practice/FeedbackDisplay';

export default function PracticeScreen() {
  const {
    loading,
    generatingBatch,
    currentPractice,
    userAnswer,
    feedback,
    errorMessage,
    adjusting,
    difficultyTrend,
    difficultyChange,
    complexityChange,
    feedbackQuestion,
    feedbackAnswer,
    askingQuestion,
    adjustmentMode,
    
    setUserAnswer,
    setFeedbackQuestion,
    
    generatePractice,
    submitAnswer,
    handleNextPractice,
    showAdjustmentDialog,
    askFollowUpQuestion
  } = usePractice();

  // Log state for debugging
  useEffect(() => {
    console.log('PracticeScreen - adjustmentMode:', adjustmentMode);
  }, [adjustmentMode]);

  // Generate initial practice on mount if not already loaded
  useEffect(() => {
    if (!currentPractice && !loading) {
      generatePractice(true);
    }
  }, [currentPractice, loading, generatePractice]);

  return (
    <SafeAreaView style={practiceStyles.container}>
      <ScrollView contentContainerStyle={practiceStyles.scrollContainer}>
        <View style={practiceStyles.header}>
          <Text style={practiceStyles.title}>Dutch Practice</Text>
        </View>
        
        {/* Difficulty adjuster */}
        {currentPractice && (
          <DifficultyAdjuster 
            difficultyTrend={difficultyTrend}
            difficultyValue={currentPractice.difficulty}
            complexityValue={currentPractice.complexity || 1}
            difficultyChange={difficultyChange}
            complexityChange={complexityChange}
            adjusting={adjusting}
            adjustmentMode={adjustmentMode}
            onAdjustDifficulty={showAdjustmentDialog}
          />
        )}
        
        {/* Background generation indicator */}
        {generatingBatch && !loading && (
          <View style={practiceStyles.backgroundGenerationContainer}>
            <Text style={practiceStyles.backgroundGenerationText}>Generating more questions...</Text>
          </View>
        )}
        
        {/* Error message display */}
        {errorMessage && (
          <View style={practiceStyles.errorContainer}>
            <Text style={practiceStyles.errorText}>{errorMessage}</Text>
          </View>
        )}
        
        {/* Loading indicator */}
        {loading ? (
          <ActivityIndicator size="large" color="#4f86f7" style={practiceStyles.loader} />
        ) : (
          <>
            {/* Practice content */}
            {currentPractice && (
              <View style={practiceStyles.practiceContainer}>
                <PracticeContent practice={currentPractice} />
                
                {!feedback ? (
                  <AnswerInput 
                    practice={currentPractice}
                    userAnswer={userAnswer}
                    onChangeAnswer={setUserAnswer}
                    onSubmit={submitAnswer}
                    disabled={!!feedback}
                  />
                ) : (
                  <FeedbackDisplay 
                    feedback={feedback}
                    practice={currentPractice}
                    userAnswer={userAnswer}
                    feedbackQuestion={feedbackQuestion}
                    feedbackAnswer={feedbackAnswer}
                    askingQuestion={askingQuestion}
                    onNextPractice={handleNextPractice}
                    onSetFeedbackQuestion={setFeedbackQuestion}
                    onAskQuestion={askFollowUpQuestion}
                  />
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 