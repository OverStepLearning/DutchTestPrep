import React from 'react';
import { ActivityIndicator, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePractice } from '../hooks/usePractice';
import { practiceStyles } from '../components/practice/styles';
import { PracticeTypeSelector } from '../components/practice/PracticeTypeSelector';
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
    practiceType,
    errorMessage,
    adjusting,
    difficultyTrend,
    difficultyChange,
    feedbackQuestion,
    feedbackAnswer,
    askingQuestion,
    
    setUserAnswer,
    setFeedbackQuestion,
    setPracticeType,
    
    generatePractice,
    submitAnswer,
    handleNextPractice,
    showAdjustmentDialog,
    askFeedbackQuestion
  } = usePractice();

  return (
    <SafeAreaView style={practiceStyles.container}>
      <ScrollView contentContainerStyle={practiceStyles.scrollContainer}>
        <View style={practiceStyles.header}>
          <Text style={practiceStyles.title}>Dutch Practice</Text>
        </View>
        
        {/* Practice type selection */}
        <PracticeTypeSelector 
          currentType={practiceType} 
          onSelectType={(type: 'vocabulary' | 'grammar' | 'conversation') => {
            setPracticeType(type);
            generatePractice(true);
          }} 
        />
        
        {/* Difficulty adjuster */}
        {currentPractice && (
          <DifficultyAdjuster 
            difficultyTrend={difficultyTrend}
            difficultyValue={currentPractice.difficulty}
            difficultyChange={difficultyChange}
            adjusting={adjusting}
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
                    onAskQuestion={askFeedbackQuestion}
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