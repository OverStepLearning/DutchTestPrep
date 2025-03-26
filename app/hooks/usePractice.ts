import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../utils/storage';
import config from '../../constants/Config';
import { PracticeItem, FeedbackResponse, DifficultyDirection, DifficultyTrend } from '../types/practice';

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
  const [feedbackQuestion, setFeedbackQuestion] = useState('');
  const [feedbackAnswer, setFeedbackAnswer] = useState<string | null>(null);
  const [askingQuestion, setAskingQuestion] = useState(false);

  // Helper function to ensure practice item is formatted correctly
  const mapPracticeItem = (item: any): PracticeItem => {
    if (!item) return null as unknown as PracticeItem;
    
    // Create a safe copy of the data with fallbacks
    return {
      _id: item._id || '',
      content: item.content || '',
      translation: item.translation || '',
      difficulty: item.difficulty || 'medium',
      complexity: item.complexity || 'medium',
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
        batchSize: 3 // Request multiple items
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
        
        // Add batch items to the queue if available
        if (response.data?.batchItems && Array.isArray(response.data.batchItems) && response.data.batchItems.length > 1) {
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
    if (!user || generatingBatch) return;
    
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

  // Function to show the difficulty adjustment dialog
  const showAdjustmentDialog = () => {
    setAdjusting(true);
    Alert.alert(
      'Adjust Difficulty',
      'Would you like to make the exercises easier or harder?',
      [
        {
          text: 'Easier',
          onPress: () => {
            setAdjusting(false);
            adjustDifficulty('down');
          },
        },
        {
          text: 'Harder',
          onPress: () => {
            setAdjusting(false);
            adjustDifficulty('up');
          }
        },
        {
          text: 'Cancel',
          onPress: () => setAdjusting(false),
          style: 'cancel'
        }
      ]
    );
  };

  // Function to adjust difficulty level
  const adjustDifficulty = async (direction: DifficultyDirection) => {
    try {
      setAdjusting(true);
      setErrorMessage(null);
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to adjust difficulty');
        return;
      }
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.post(`${config.API_URL}/api/practice/adjust-difficulty`, {
        direction
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data?.success) {
        const newLevel = response.data.data.level;
        // Save the old difficulty for comparison
        const oldDifficulty = currentPractice?.difficulty ? currentPractice.difficulty.toFixed(2) : '1.00';
        
        // Update difficulty trend immediately for visual feedback
        setDifficultyTrend(direction === 'up' ? 'increasing' : 'decreasing');
        
        // Calculate and display the change
        const oldValue = parseFloat(oldDifficulty);
        const newValue = parseFloat(newLevel.toFixed(2));
        const change = (newValue - oldValue).toFixed(2);
        const sign = change.startsWith('-') ? '' : '+';
        setDifficultyChange(`${sign}${change}`);
        
        // Show alert with more detailed information
        Alert.alert(
          'Difficulty Adjusted',
          `Your difficulty level has changed from ${oldDifficulty} to ${newLevel.toFixed(2)}.\n\nChange: ${sign}${change}\n\nNew questions will reflect this change.`,
          [{ text: 'OK' }]
        );
        
        // Force a new practice generation with the updated difficulty
        generatePractice(true);
        
        // Clear the change message after some time
        setTimeout(() => {
          setDifficultyChange(null);
        }, 15000);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Failed to adjust difficulty: ${errorMsg}`);
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
      
      const response = await axios.post(`${config.API_URL}/api/practice/ask-question`, {
        practiceId: currentPractice?._id,
        question: feedbackQuestion
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data?.success) {
        setFeedbackAnswer(response.data.data.answer);
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Failed to submit answer: ${errorMsg}`);
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update difficulty trend when current practice changes
  useEffect(() => {
    if (currentPractice && currentPractice.difficulty) {
      if (previousDifficultyRef.current !== null) {
        if (currentPractice.difficulty > previousDifficultyRef.current) {
          setDifficultyTrend('increasing');
        } else if (currentPractice.difficulty < previousDifficultyRef.current) {
          setDifficultyTrend('decreasing');
        } else {
          setDifficultyTrend('stable');
        }
      }
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
    askingQuestion,
    feedbackQuestion,
    feedbackAnswer,
    
    setUserAnswer,
    setFeedbackQuestion,
    
    generatePractice,
    submitAnswer,
    handleNextPractice,
    showAdjustmentDialog,
    askFollowUpQuestion,
    setFeedbackAnswer,
    adjustDifficulty
  };
} 