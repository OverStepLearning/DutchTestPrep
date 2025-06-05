import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePractice } from '../hooks/usePractice';
import { useAuth } from '../../contexts/AuthContext';
import { useTabContext } from '@/contexts/TabContext';
import { practiceStyles } from '../components/practice/styles';
import { DifficultyAdjuster } from '../components/practice/DifficultyAdjuster';
import { PracticeContent } from '../components/practice/PracticeContent';
import { AnswerInput } from '../components/practice/AnswerInput';
import { FeedbackDisplay } from '../components/practice/FeedbackDisplay';

export default function PracticeScreen() {
  const router = useRouter();
  const initialLoadRef = useRef(false);
  const authCheckedRef = useRef(false);
  const navigationReadyRef = useRef(false);
  const lastSubjectRef = useRef<string>('');
  
  // Use optional chaining for auth to prevent errors if context is not ready
  const auth = useAuth();
  const user = auth?.user;
  const token = auth?.token;
  const { currentSubject } = useTabContext();

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
    subjectProgress,
    
    setUserAnswer,
    setFeedbackQuestion,
    
    generatePractice,
    submitAnswer,
    handleNextPractice,
    showAdjustmentDialog,
    askFollowUpQuestion
  } = usePractice();
  
  // Mark navigation as ready after initial render
  useEffect(() => {
    // Set a small timeout to ensure navigation system is ready
    const timer = setTimeout(() => {
      navigationReadyRef.current = true;
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Log auth state for debugging
  useEffect(() => {
    console.log('[PracticeScreen] Auth state:', { hasToken: !!token, userId: user?._id });
    
    // Check authentication on mount with a safe navigation approach
    if (!authCheckedRef.current && navigationReadyRef.current) {
      authCheckedRef.current = true;
      
      if (!user || !token) {
        console.log('[PracticeScreen] User not authenticated, redirecting to login');
        // Use setTimeout to prevent navigation before mounting
        setTimeout(() => {
          router.replace('/login');
        }, 100);
      }
    }
  }, [user, token, router]);

  // Log state for debugging
  useEffect(() => {
    console.log('[PracticeScreen] Adjustment mode changed:', adjustmentMode);
  }, [adjustmentMode]);
  
  // Log when currentPractice changes
  useEffect(() => {
    if (currentPractice) {
      const contentPreview = typeof currentPractice.content === 'string' 
        ? currentPractice.content.substring(0, 30) 
        : Array.isArray(currentPractice.content)
          ? currentPractice.content[0]?.substring(0, 30)
          : 'No content';
      console.log('[PracticeScreen] Practice content updated:', contentPreview);
    }
  }, [currentPractice]);

  // Generate initial practice on mount ONCE if not already loaded
  useEffect(() => {
    // Make sure we have authentication before attempting to generate practice
    if (!user || !token) {
      console.log('[PracticeScreen] Skipping practice generation - not authenticated');
      return;
    }
    
    // Only generate practice if not already loaded and not already attempted
    if (!currentPractice && !loading && !initialLoadRef.current) {
      console.log('[PracticeScreen] Initial practice generation');
      initialLoadRef.current = true; // Mark that we've tried to load
      generatePractice(true);
    }
  }, [currentPractice, loading, generatePractice, user, token]);

  // Handle subject changes - force regenerate practice for new subject
  useEffect(() => {
    if (currentSubject && lastSubjectRef.current && currentSubject !== lastSubjectRef.current) {
      console.log(`[PracticeScreen] Subject changed from ${lastSubjectRef.current} to ${currentSubject} - regenerating practice`);
      
      // Reset the initial load flag to allow regeneration
      initialLoadRef.current = false;
      
      // Force generate new practice for the new subject
      generatePractice(true);
    }
    
    // Update the last subject reference
    if (currentSubject) {
      lastSubjectRef.current = currentSubject;
    }
  }, [currentSubject, generatePractice]);

  return (
    <SafeAreaView style={practiceStyles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={practiceStyles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={practiceStyles.header}>
            <Text style={practiceStyles.title}>{currentSubject || 'Dutch'} Practice</Text>
          </View>
          
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
              
              {/* Add retry button for general errors (timeouts, generation failures, etc.) */}
              <TouchableOpacity 
                style={practiceStyles.retryButton}
                onPress={() => {
                  console.log('[PracticeScreen] User clicked retry button');
                  // Reset the initial load flag to allow regeneration
                  initialLoadRef.current = false;
                  // Clear the error message
                  // setErrorMessage(null); // This will be handled by generatePractice
                  // Force generate new practice
                  generatePractice(true);
                }}
              >
                <Text style={practiceStyles.retryButtonText}>
                  🔄 Try Again
                </Text>
              </TouchableOpacity>
              
              {/* Add onboarding button if the error is about preferences */}
              {errorMessage.includes('onboarding') && (
                <TouchableOpacity 
                  style={practiceStyles.onboardingButton}
                  onPress={() => {
                    if (navigationReadyRef.current) {
                      router.replace('/(tabs)/onboarding');
                    }
                  }}
                >
                  <Text style={practiceStyles.onboardingButtonText}>
                    Go to Onboarding
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Add login button if the error is about auth */}
              {errorMessage.includes('logged in') && (
                <TouchableOpacity 
                  style={practiceStyles.onboardingButton}
                  onPress={() => {
                    if (navigationReadyRef.current) {
                      router.replace('/login');
                    }
                  }}
                >
                  <Text style={practiceStyles.onboardingButtonText}>
                    Go to Login
                  </Text>
                </TouchableOpacity>
              )}
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
                  <PracticeContent practice={currentPractice} subjectProgress={subjectProgress} />
                  
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
              
              {/* Show message when no practice and no error (likely waiting for onboarding) */}
              {!currentPractice && !errorMessage && !loading && (
                <View style={practiceStyles.emptyStateContainer}>
                  <Text style={practiceStyles.emptyStateText}>
                    Ready to start practicing {currentSubject || 'Dutch'}? Complete onboarding to personalize your experience.
                  </Text>
                  <TouchableOpacity 
                    style={practiceStyles.retryButton}
                    onPress={() => {
                      console.log('[PracticeScreen] User clicked refresh from empty state');
                      // Reset the initial load flag to allow regeneration
                      initialLoadRef.current = false;
                      // Force generate new practice
                      generatePractice(true);
                    }}
                  >
                    <Text style={practiceStyles.retryButtonText}>
                      🔄 Refresh Practice
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={practiceStyles.onboardingButton}
                    onPress={() => {
                      if (navigationReadyRef.current) {
                        router.replace('/(tabs)/onboarding');
                      }
                    }}
                  >
                    <Text style={practiceStyles.onboardingButtonText}>
                      Go to Onboarding
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Simplified Difficulty adjuster moved to bottom */}
              {currentPractice && (
                <DifficultyAdjuster 
                  difficultyTrend={difficultyTrend}
                  difficultyValue={subjectProgress.currentDifficulty}
                  complexityValue={subjectProgress.currentComplexity}
                  difficultyChange={difficultyChange}
                  complexityChange={complexityChange}
                  adjusting={adjusting}
                  adjustmentMode={adjustmentMode}
                  onAdjustDifficulty={showAdjustmentDialog}
                />
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 