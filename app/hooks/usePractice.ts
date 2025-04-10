import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useAIProvider } from '../../contexts/AIProviderContext';
import { storage } from '../../utils/storage';
import config from '../../constants/Config';
import { 
  PracticeItem, 
  FeedbackResponse, 
  DifficultyDirection, 
  DifficultyTrend,
  DifficultyChangeInfo,
  AdjustmentModeInfo
} from '../types/practice';
import * as apiService from '@/utils/apiService';
import { useRouter } from 'expo-router';

export function usePractice() {
  const { user } = useAuth();
  const { currentProvider, deepseekApiKey } = useAIProvider();
  const [loading, setLoading] = useState(false);
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [currentPractice, setCurrentPractice] = useState<PracticeItem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionQueue, setQuestionQueue] = useState<PracticeItem[]>([]);
  const [adjusting, setAdjusting] = useState(false);
  const [difficultyTrend, setDifficultyTrend] = useState<DifficultyTrend>('stable');
  const previousDifficultyRef = useRef<number | null>(null);
  const [difficultyChange, setDifficultyChange] = useState<string | null>(null);
  const [complexityChange, setComplexityChange] = useState<string | null>(null);
  const [feedbackQuestion, setFeedbackQuestion] = useState('');
  const [feedbackAnswer, setFeedbackAnswer] = useState<string | null>(null);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [adjustmentMode, setAdjustmentMode] = useState<AdjustmentModeInfo>({
    isInAdjustmentMode: false,
    adjustmentPracticesRemaining: 0
  });
  const router = useRouter();

  // Helper function to ensure practice item is formatted correctly
  const mapPracticeItem = (item: any): PracticeItem => {
    if (!item) return null as unknown as PracticeItem;
    
    // Create a safe copy of the data with fallbacks
    return {
      _id: item._id || '',
      content: item.content || '',
      translation: item.translation || '',
      difficulty: typeof item.difficulty === 'number' ? item.difficulty : 1,
      complexity: typeof item.complexity === 'number' ? item.complexity : 1,
      categories: Array.isArray(item.categories) ? item.categories : [],
      challengeAreas: Array.isArray(item.challengeAreas) ? item.challengeAreas : [],
      questionType: item.questionType === 'multiple-choice' ? 'mcq' : item.questionType || 'open-ended',
      options: Array.isArray(item.options) ? item.options : [],
      practiceType: item.practiceType || 'Vocabulary',
      createdAt: item.createdAt || new Date().toISOString(),
      userId: item.userId || '',
      isCompleted: !!item.isCompleted,
      userAnswer: item.userAnswer || '',
      isCorrect: item.isCorrect,
      feedbackProvided: item.feedbackProvided || '',
    };
  };

  // Function to generate a new practice item
  const generatePractice = async (forceNew = false) => {
    try {
      // If we already have a current practice and we're not forcing a new one, don't regenerate
      if (currentPractice && !forceNew) {
        console.log('[usePractice] Practice already exists, not regenerating');
        return;
      }
      
      // If we have queued questions and don't need to force a new one
      if (questionQueue.length > 0 && !forceNew) {
        // Use a question from the queue
        const nextQuestion = questionQueue[0];
        
        // Remove the used question from the queue
        setQuestionQueue(prevQueue => prevQueue.slice(1));
        
        // Set the next question as current
        setCurrentPractice(nextQuestion);
        
        // If we're running low on queued questions, generate more in the background
        if (questionQueue.length < 2 && !generatingBatch) {
          generatePracticeBatch();
        }
        
        return;
      }
      
      // Otherwise, we need to fetch from the server
      setLoading(true);
      
      // Check authentication before proceeding
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        console.log('[usePractice] No auth token found');
        setErrorMessage("You must be logged in to practice");
        
        // Try to get user from auth context again
        if (!user) {
          console.log('[usePractice] User not available, redirecting to login');
          Alert.alert(
            "Login Required",
            "You need to be logged in to practice Dutch. Please log in and try again.",
            [
              {
                text: "Go to Login",
                onPress: () => {
                  router.replace('/login');
                }
              },
              {
                text: "Cancel",
                style: "cancel"
              }
            ]
          );
          setLoading(false);
          return;
        }
        
        // If we have a user but no token, try to get the token again
        console.log('[usePractice] User available but no token, trying to refresh token');
        setLoading(false);
        return;
      }
      
      // Make sure we have a user
      if (!user || !user._id) {
        console.log('[usePractice] User or user ID missing even with token:', !!user);
        setErrorMessage("User information not available. Please log in again.");
        setLoading(false);
        return;
      }
      
      console.log('[usePractice] Authenticated user ID:', user._id);
      
      // Explicitly set the auth token before making the request
      apiService.setAuthToken(token);
      
      // Log the API URL being used
      const apiUrl = apiService.getBaseURL();
      console.log(`[usePractice] Generating practice using API URL: ${apiUrl} for user ${user._id}`);
      
      // The backend handles all randomization with a single API call
      const response = await apiService.post('/api/practice/generate', {
        userId: user._id,
        batchSize: adjustmentMode.isInAdjustmentMode ? 1 : 3,
        aiProvider: currentProvider,
        deepseekApiKey: currentProvider === 'deepseek' ? deepseekApiKey : null
      });
      
      // Ensure we have valid data before setting it
      if (response?.success && response?.data) {
        // Set the current practice item
        const practice = mapPracticeItem(response.data);
        setCurrentPractice(practice);
        
        // Clear any error messages since we succeeded
        if (errorMessage) {
          setErrorMessage(null);
        }
        
        // Update adjustment mode state - ensure defaults if not provided
        setAdjustmentMode({
          isInAdjustmentMode: response.adjustmentMode === true,
          adjustmentPracticesRemaining: response.adjustmentPracticesRemaining || 0
        });
        
        // Add batch items to the queue if available and not in adjustment mode
        if (!response.adjustmentMode && response?.batchItems && 
            Array.isArray(response.batchItems) && response.batchItems.length > 1) {
          const batchItems = response.batchItems.slice(1).map(mapPracticeItem);
          setQuestionQueue(batchItems);
        }
      } else {
        throw new Error('Invalid practice data received');
      }
    } catch (error) {
      console.error('Error generating practice:', error);
      
      // Provide more detailed error information
      let errorMsg = 'Unknown error';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (axios.isAxiosError(error)) {
        errorMsg = error.response ? 
          `${error.response.status} - ${error.response.statusText || 'Error'}` : 
          'Network Error';
          
        // Check for auth-related errors
        if (error.response?.status === 401) {
          errorMsg = "Your session has expired. Please log in again.";
          router.replace('/login');
        }
      }
      
      setErrorMessage(`Failed to generate practice: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a batch of practice questions in the background
  const generatePracticeBatch = async () => {
    if (!user || generatingBatch || adjustmentMode.isInAdjustmentMode) return;
    
    try {
      setGeneratingBatch(true);
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiService.setAuthToken(token);
      }
      
      // The backend handles all randomization with a single API call
      const response = await apiService.post('/api/practice/generate', {
        userId: user._id,
        batchSize: 5, // Request more items for the queue
        aiProvider: currentProvider,
        deepseekApiKey: currentProvider === 'deepseek' ? deepseekApiKey : null
      });
      
      if (response?.success) {
        // Check if backend returned batch items
        if (response?.batchItems && Array.isArray(response.batchItems) && response.batchItems.length > 0) {
          // Add all batch items to the queue - don't replace current practice
          const batchItems = response.batchItems.map(mapPracticeItem);
          setQuestionQueue(prevQueue => [...prevQueue, ...batchItems]);
          console.log(`[usePractice] Added ${batchItems.length} questions to queue in background`);
        }
      }
    } catch (error) {
      // Don't show error to user for background generation
      console.log('[usePractice] Background batch generation error:', error);
    } finally {
      setGeneratingBatch(false);
    }
  };

  // Function to handle moving to the next practice item
  const handleNextPractice = () => {
    // Reset user interaction state
    setFeedback(null);
    setUserAnswer('');
    setFeedbackQuestion('');
    setFeedbackAnswer(null);
    setAskingQuestion(false);
    
    // If we're in adjustment mode, we need to force a new practice 
    if (adjustmentMode.isInAdjustmentMode) {
      setCurrentPractice(null);
      generatePractice(true);
      return;
    }
    
    // For normal mode, check if we have questions in the queue
    if (questionQueue.length > 0) {
      // Get the next question from the queue
      const nextQuestion = questionQueue[0];
      
      // Remove the used question from the queue
      setQuestionQueue(prevQueue => prevQueue.slice(1));
      
      // Set the next question as current
      setCurrentPractice(nextQuestion);
      
      // If we're running low on queued questions, generate more in the background
      if (questionQueue.length < 2 && !generatingBatch) {
        generatePracticeBatch();
      }
    } else {
      // Only if queue is empty, clear current practice and generate new one
      setCurrentPractice(null);
      generatePractice(false);
    }
  };

  // Function to show adjustment mode information and enter adjustment mode
  const showAdjustmentDialog = () => {
    // Don't allow adjustment when already in adjustment mode
    if (adjustmentMode.isInAdjustmentMode) {
      Alert.alert(
        'Adjustment in Progress',
        'You are currently in adjustment mode. Complete the remaining practice exercises to finish calibrating your difficulty level.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Show confirmation before entering adjustment mode
    Alert.alert(
      'Enter Adjustment Mode',
      'Would you like to enter difficulty adjustment mode? This will calibrate the difficulty level to better match your skills.',
      [
        {
          text: 'Yes, Enter Adjustment Mode',
          onPress: () => {
            enterAdjustmentMode();
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        }
      ]
    );
  };

  // Function to enter adjustment mode
  const enterAdjustmentMode = async () => {
    try {
      setAdjusting(true);
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to adjust difficulty');
        setAdjusting(false);
        return;
      }
      
      // Default number of adjustment practices
      const ADJUSTMENT_PRACTICES_COUNT = 5;
      
      // Update the state with a new object (important for React reactivity)
      const newAdjustmentMode = {
        isInAdjustmentMode: true,
        adjustmentPracticesRemaining: ADJUSTMENT_PRACTICES_COUNT
      };
      
      setAdjustmentMode(newAdjustmentMode);
      
      // Update user progress on the server to enter adjustment mode
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiService.setAuthToken(token);
      }
      
      try {
        const response = await apiService.post('/api/practice/enter-adjustment-mode', {
          aiProvider: currentProvider,
          deepseekApiKey: currentProvider === 'deepseek' ? deepseekApiKey : null
        });
        
      } catch (apiError) {
        // Even if the API call fails, we'll continue with local adjustment mode
      }
      
      // Show confirmation
      Alert.alert(
        'Adjustment Mode Activated',
        `You have entered adjustment mode. The next ${ADJUSTMENT_PRACTICES_COUNT} questions will help calibrate your difficulty level.`,
        [{ 
          text: 'OK',
          onPress: () => {
            // Force a new practice generation for adjustment
            generatePractice(true);
          }
        }]
      );
    } catch (error) {
      console.error('Error entering adjustment mode:', error);
      Alert.alert('Error', 'Failed to enter adjustment mode. Please try again.');
    } finally {
      setAdjusting(false);
    }
  };

  // Function to ask a follow-up question about the feedback
  const askFollowUpQuestion = async () => {
    if (!feedbackQuestion.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }
    
    if (!currentPractice) {
      Alert.alert('Error', 'No practice active');
      return;
    }
    
    try {
      setAskingQuestion(true);
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        apiService.setAuthToken(token);
      }
      
      console.log(`[usePractice] Asking question for practice ID: ${currentPractice._id}`);
      console.log(`[usePractice] Question: ${feedbackQuestion}`);
      
      const response = await apiService.post('/api/practice/question', {
        practiceId: currentPractice._id,
        question: feedbackQuestion,
        aiProvider: currentProvider,
        deepseekApiKey: currentProvider === 'deepseek' ? deepseekApiKey : null
      });
      
      console.log(`[usePractice] Question response:`, response ? 'Response received' : 'No response');
      if (response) {
        console.log(`[usePractice] Response success: ${response.success}`);
        console.log(`[usePractice] Response keys:`, Object.keys(response));
      }
      
      // Check for success and various answer location possibilities
      if (response?.success) {
        // Try to find the answer in different possible locations
        let answerText = null;
        
        if (response.answer && response.answer !== '') {
          answerText = response.answer;
        } else if (response.data && response.data.answer) {
          answerText = response.data.answer;
        } else if (response.feedback) {
          answerText = response.feedback;
        }
        
        if (answerText) {
          console.log(`[usePractice] Answer found, setting feedback answer`);
          setFeedbackAnswer(answerText);
        } else {
          console.log(`[usePractice] No answer found in response`);
          throw new Error('No answer content in the response');
        }
      } else {
        throw new Error(response?.message || 'Failed to get answer');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      Alert.alert('Error', 'Failed to get answer to your question. Please try again.');
    } finally {
      setAskingQuestion(false);
    }
  };

  // Function to submit user's answer
  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }
    
    if (!currentPractice) {
      Alert.alert('Error', 'No practice active');
      return;
    }
    
    try {
      setErrorMessage(null);
      
      setLoading(true);
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setErrorMessage("Authentication token not found. Please log in again.");
        return;
      }
      
      // Explicitly set the auth token before making the request
      apiService.setAuthToken(token);
      
      console.log(`[usePractice] Submitting answer for practice ID: ${currentPractice._id}`);
      console.log(`[usePractice] Answer: ${userAnswer.substring(0, 50)}${userAnswer.length > 50 ? '...' : ''}`);
      console.log(`[usePractice] Using API URL: ${apiService.getBaseURL()}`);
      
      try {
        const response = await apiService.post('/api/practice/submit', {
          practiceId: currentPractice._id,
          userAnswer: userAnswer,
          aiProvider: currentProvider,
          deepseekApiKey: currentProvider === 'deepseek' ? deepseekApiKey : null
        });
        
        console.log(`[usePractice] Submit response:`, response ? 'Response received' : 'No response');
        
        // Debug response structure
        if (response) {
          console.log(`[usePractice] Response success: ${response.success}`);
          console.log(`[usePractice] Has feedback property: ${!!response.feedback}`);
          console.log(`[usePractice] Full response keys:`, Object.keys(response));
        }
        
        if (!response) {
          throw new Error('No response received from server');
        }
        
        if (!response.success) {
          throw new Error(response.message || 'Server reported failure');
        }
        
        // Attempt to find feedback in different possible locations in the response
        let feedbackData = null;
        
        // Check if feedback is directly in the response
        if (response.feedback) {
          feedbackData = response.feedback;
        } 
        // Check if feedback is in response.data.evaluation (specific format from our backend)
        else if (response.data && response.data.evaluation && response.data.evaluation.feedback) {
          console.log('[usePractice] Found feedback in response.data.evaluation structure');
          feedbackData = {
            result: response.data.evaluation.isCorrect,
            correct: response.data.evaluation.isCorrect,
            feedback: response.data.evaluation.feedback,
            evaluation: response.data.evaluation
          };
        }
        // Check if feedback is in response.data
        else if (response.data && response.data.feedback) {
          feedbackData = response.data.feedback;
        }
        // Check if the entire response is the feedback (backward compatibility)
        else if (response.result || response.correct !== undefined || response.evaluation) {
          feedbackData = response;
        }
        // Last resort - attempt to use the whole response if it looks like feedback
        else if (typeof response === 'object' && Object.keys(response).length > 1) {
          console.log(`[usePractice] Attempting to use whole response as feedback`);
          feedbackData = response;
        }
        
        if (!feedbackData) {
          throw new Error('No feedback received in response');
        }
        
        console.log(`[usePractice] Feedback received successfully`);
        setFeedback(feedbackData);
        
        // Update adjustment mode remaining count if in adjustment mode
        if (adjustmentMode.isInAdjustmentMode && response.adjustmentPracticesRemaining !== undefined) {
          setAdjustmentMode({
            ...adjustmentMode,
            adjustmentPracticesRemaining: response.adjustmentPracticesRemaining
          });
          
          // If we've completed the adjustment, show a message
          if (response.adjustmentPracticesRemaining === 0) {
            setTimeout(() => {
              Alert.alert(
                'Adjustment Complete',
                'Difficulty adjustment complete! Your practice difficulty has been calibrated based on your performance.',
                [{ text: 'OK' }]
              );
            }, 1000);
          }
        }
      } catch (submitError) {
        console.error(`[usePractice] Submit error:`, submitError);
        
        // Get detailed error information
        let errorDetails = 'Unknown error';
        if (submitError instanceof Error) {
          errorDetails = submitError.message;
        } else if (axios.isAxiosError(submitError)) {
          errorDetails = submitError.response ? 
            `${submitError.response.status} - ${JSON.stringify(submitError.response.data || {})}` : 
            'Network Error';
        }
        
        throw new Error(`Failed to get feedback: ${errorDetails}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', `Failed to submit your answer: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Update difficulty trend when current practice changes
  useEffect(() => {
    if (currentPractice && currentPractice.difficulty && previousDifficultyRef.current !== null) {
      if (currentPractice.difficulty > previousDifficultyRef.current) {
        setDifficultyTrend('increasing');
      } else if (currentPractice.difficulty < previousDifficultyRef.current) {
        setDifficultyTrend('decreasing');
      } else {
        setDifficultyTrend('stable');
      }
    }
    
    if (currentPractice?.difficulty) {
      previousDifficultyRef.current = currentPractice.difficulty;
    }
  }, [currentPractice]);

  return {
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
    askingQuestion,
    feedbackQuestion,
    feedbackAnswer,
    adjustmentMode,
    
    setUserAnswer,
    setFeedbackQuestion,
    
    generatePractice,
    submitAnswer,
    handleNextPractice,
    showAdjustmentDialog,
    askFollowUpQuestion,
    setFeedbackAnswer,
    enterAdjustmentMode
  };
} 