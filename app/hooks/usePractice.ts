import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
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

export function usePractice() {
  const { user } = useAuth();
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

  // Function to generate practice with additional error handling
  const generatePractice = async (forceNew = false) => {
    try {
      setErrorMessage(null);
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to practice');
        return;
      }
      
      // Clear all feedback-related state
      setFeedback(null);
      setUserAnswer('');
      setFeedbackQuestion('');
      setFeedbackAnswer(null);
      setAskingQuestion(false);
      
      // If we're not forcing new generation and we have questions in the queue, use the next one
      if (!forceNew && questionQueue.length > 0) {
        const nextQuestion = questionQueue[0];
        const remainingQuestions = questionQueue.slice(1);
        
        setCurrentPractice(nextQuestion);
        setQuestionQueue(remainingQuestions);
        
        // If we're running low on queued questions, generate more in the background
        if (remainingQuestions.length < 2 && !generatingBatch) {
          generatePracticeBatch();
        }
        
        return;
      }
      
      // Otherwise, we need to fetch from the server
      setLoading(true);
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      
      // The backend handles all randomization with a single API call
      const response = await axios.post(`${config.API_URL}/api/practice/generate`, {
        userId: user._id,
        batchSize: adjustmentMode.isInAdjustmentMode ? 1 : 3 // Only request 1 item in adjustment mode
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Ensure we have valid data before setting it
      if (response.data?.success && response.data?.data) {
        // Set the current practice item
        const practice = mapPracticeItem(response.data.data);
        setCurrentPractice(practice);
        
        // Update adjustment mode state - ensure defaults if not provided
        setAdjustmentMode({
          isInAdjustmentMode: response.data.adjustmentMode === true,
          adjustmentPracticesRemaining: response.data.adjustmentPracticesRemaining || 0
        });
        
        // Add batch items to the queue if available and not in adjustment mode
        if (!response.data.adjustmentMode && response.data?.batchItems && 
            Array.isArray(response.data.batchItems) && response.data.batchItems.length > 1) {
          const batchItems = response.data.batchItems.slice(1).map(mapPracticeItem);
          setQuestionQueue(batchItems);
        }
      } else {
        throw new Error('Invalid practice data received');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Failed to generate practice: ${errorMsg}`);
      Alert.alert('Error', 'Failed to generate practice. Please try again.');
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
      
      // The backend handles all randomization with a single API call
      const response = await axios.post(`${config.API_URL}/api/practice/generate`, {
        userId: user._id,
        batchSize: 5 // Request more items for the queue
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data?.success) {
        // Check if backend returned batch items
        if (response.data?.batchItems && Array.isArray(response.data.batchItems) && response.data.batchItems.length > 1) {
          // Use the first item as current practice (already set in the regular response handling)
          // Add the rest to the queue
          const batchItems = response.data.batchItems.slice(1).map(mapPracticeItem);
          setQuestionQueue(prevQueue => [...prevQueue, ...batchItems]);
        }
      }
    } catch (error) {
      // Don't show error to user for background generation
      console.log('Error generating batch:', error);
    } finally {
      setGeneratingBatch(false);
    }
  };

  // Function to handle moving to the next practice item
  const handleNextPractice = () => {
    // Reset state for next practice
    setFeedback(null);
    setUserAnswer('');
    setFeedbackQuestion('');
    setFeedbackAnswer(null);
    setAskingQuestion(false);
    
    // Generate a new practice or use the next one in queue
    generatePractice();
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
    enterAdjustmentMode();
    // Show confirmation before entering adjustment mode
    Alert.alert(
      'Enter Adjustment Mode',
      'Would you like to enter difficulty adjustment mode? This will calibrate the difficulty level to better match your skills.',
      [
        {
          text: 'Yes, Enter Adjustment Mode',
          onPress: () => enterAdjustmentMode(),
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
      
      // Set adjustment mode locally
      setAdjustmentMode({
        isInAdjustmentMode: true,
        adjustmentPracticesRemaining: ADJUSTMENT_PRACTICES_COUNT
      });
      
      // Update user progress on the server to enter adjustment mode
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      
      await axios.post(`${config.API_URL}/api/practice/enter-adjustment-mode`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch(error => {
        // Even if the API call fails, we'll continue with local adjustment mode
        console.log('Failed to update server with adjustment mode:', error);
      });
      
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
    
    try {
      setAskingQuestion(true);
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.post(`${config.API_URL}/api/practice/question`, {
        practiceId: currentPractice?._id,
        question: feedbackQuestion,
        userAnswer: currentPractice?.userAnswer || userAnswer,
        feedback: feedback?.feedback
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data?.answer) {
        setFeedbackAnswer(response.data.answer);
      } else {
        throw new Error('Failed to get an answer');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to get an answer: ${errorMsg}`);
    } finally {
      setAskingQuestion(false);
    }
  };

  // Function to submit user's answer
  const submitAnswer = async () => {
    try {
      setErrorMessage(null);
      
      if (!currentPractice) {
        Alert.alert('Error', 'No practice question available');
        return;
      }
      
      if (!userAnswer || !userAnswer.trim()) {
        Alert.alert('Error', 'Please provide an answer');
        return;
      }
      
      setLoading(true);
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.post(`${config.API_URL}/api/practice/submit`, {
        practiceId: currentPractice._id,
        userAnswer: userAnswer
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Handle potential array or undefined values in feedback
      let feedbackText: string | string[] = '';
      let isCorrect = false;
      
      if (response.data?.success && response.data?.data) {
        // Update adjustment mode status - handle missing data safely
        setAdjustmentMode({
          isInAdjustmentMode: response.data.data.adjustmentMode === true,
          adjustmentPracticesRemaining: response.data.data.adjustmentPracticesRemaining || 0
        });
        
        // Handle difficulty change info
        if (response.data.data.difficultyChange) {
          const info = response.data.data.difficultyChange;
          
          // Update difficulty trend
          if (info.change > 0) {
            setDifficultyTrend('increasing');
          } else if (info.change < 0) {
            setDifficultyTrend('decreasing');
          } else {
            setDifficultyTrend('stable');
          }
          
          // Format and display the difficulty change with appropriate sign
          const changeStr = info.change.toFixed(2);
          const sign = info.change >= 0 ? '+' : '';
          setDifficultyChange(`${sign}${changeStr}`);
          
          // Format and display the complexity change with appropriate sign
          if (info.complexityChange !== undefined) {
            const complexityStr = info.complexityChange.toFixed(2);
            const complexitySign = info.complexityChange >= 0 ? '+' : '';
            setComplexityChange(`${complexitySign}${complexityStr}`);
            console.log(`Setting complexity change: ${complexitySign}${complexityStr}`);
          } else {
            // Reset complexity change if not provided
            setComplexityChange(null);
          }
          
          // Store for future comparison
          previousDifficultyRef.current = info.newDifficulty;
          
          // If exited adjustment mode, show a message
          if (info.exitedAdjustmentMode) {
            setTimeout(() => {
              Alert.alert(
                'Adjustment Complete',
                'Your difficulty level has been adjusted and fine-tuned based on your performance.',
                [{ text: 'OK' }]
              );
            }, 500);
          }
        } else {
          // Reset changes if not provided
          setDifficultyChange(null);
          setComplexityChange(null);
        }
        
        // Store the next practice item in the queue if available
        if (response.data.data.nextPractice) {
          setQuestionQueue(prevQueue => [...prevQueue, response.data.data.nextPractice]);
        }
        
        if (response.data.data.evaluation) {
          const evaluation = response.data.data.evaluation;
          
          isCorrect = Boolean(evaluation.isCorrect);
          
          if (evaluation.feedback !== undefined) {
            if (Array.isArray(evaluation.feedback)) {
              feedbackText = evaluation.feedback;
            } else {
              feedbackText = evaluation.feedback;
            }
          }
        }
      }
      
      setFeedback({
        isCorrect,
        feedback: feedbackText
      });
      
      // Clear the change messages after some time
      if (difficultyChange || complexityChange) {
        setTimeout(() => {
          setDifficultyChange(null);
          setComplexityChange(null);
        }, 15000);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Failed to submit answer: ${errorMsg}`);
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize when component mounts
  useEffect(() => {
    if (user && !currentPractice && !loading) {
      generatePractice();
    }
  }, [user]);

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