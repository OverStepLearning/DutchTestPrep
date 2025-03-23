import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from '@/constants/Config';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';

// Define types for practice content
interface PracticeItem {
  _id: string;
  content: string | string[];
  translation?: string | string[];
  type: 'vocabulary' | 'grammar' | 'conversation' | 'reading' | 'listening';
  difficulty: number;
  complexity: number;
  categories: string[];
  questionType?: string; // Type of question (mcq, spelling, fill-in-blank, etc.)
  options?: string[]; // Options for multiple choice questions
  motherLanguage?: string; // User's native language
}

// Main practice screen component
export default function PracticeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [currentPractice, setCurrentPractice] = useState<PracticeItem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; feedback: string | string[] } | null>(null);
  const [practiceType, setPracticeType] = useState<'vocabulary' | 'grammar' | 'conversation'>('vocabulary');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionQueue, setQuestionQueue] = useState<PracticeItem[]>([]);
  const [adjusting, setAdjusting] = useState(false);
  const [difficultyTrend, setDifficultyTrend] = useState<'increasing' | 'decreasing' | 'stable'>('stable');
  const previousDifficultyRef = useRef<number | null>(null);
  const [difficultyChange, setDifficultyChange] = useState<string | null>(null);
  const [feedbackQuestion, setFeedbackQuestion] = useState('');
  const [feedbackAnswer, setFeedbackAnswer] = useState<string | null>(null);
  const [askingQuestion, setAskingQuestion] = useState(false);

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
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      console.log('Starting practice request with type:', practiceType);
      const response = await axios.post(`${config.API_URL}/api/practice/generate`, {
        userId: user._id,
        type: practiceType,
        batchSize: 5 // Request 5 questions at once
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Practice API Response Status:', response.status);
      console.log('Practice API Response Data:', JSON.stringify(response.data, null, 2));
      
      // Ensure we have valid data before setting it
      if (response.data?.success && response.data?.data) {
        // Make a safe copy of the data with fallbacks
        const practice: PracticeItem = {
          _id: response.data.data._id || '',
          content: response.data.data.content || '',
          translation: response.data.data.translation || '',
          type: response.data.data.type || 'vocabulary',
          difficulty: response.data.data.difficulty || 1,
          complexity: response.data.data.complexity || 1,
          categories: Array.isArray(response.data.data.categories) ? response.data.data.categories : [],
          questionType: response.data.data.questionType || '',
          options: Array.isArray(response.data.data.options) ? response.data.data.options : []
        };
        
        console.log('Setting current practice:', JSON.stringify(practice, null, 2));
        setCurrentPractice(practice);
      } else {
        console.error('Invalid practice data structure:', response.data);
        throw new Error('Invalid practice data received');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error generating practice:', error);
      console.error('Error details:', errorMsg);
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
      
      const response = await axios.post(`${config.API_URL}/api/practice/generate`, {
        userId: user._id,
        type: practiceType,
        batchSize: 5 // Request 5 questions at once
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Batch generation status:', response.status);
      
      if (response.data?.success && response.data?.data) {
        // Current implementation only returns the first practice, so we don't add anything to queue here
        // Backend will store the rest for later fetching
        console.log(`Generated batch of questions, ${response.data.remainingCount} remaining on server`);
      }
    } catch (error) {
      console.error('Error generating practice batch:', error);
      // Don't show error to user for background generation
    } finally {
      setGeneratingBatch(false);
    }
  };

  // Function to submit user's answer
  const submitAnswer = async () => {
    try {
      setErrorMessage(null);
      
      if (!currentPractice) {
        console.error('No current practice available');
        Alert.alert('Error', 'No practice question available');
        return;
      }
      
      if (!userAnswer || !userAnswer.trim()) {
        console.error('No answer provided');
        Alert.alert('Error', 'Please provide an answer');
        return;
      }
      
      console.log('Submitting answer:', userAnswer);
      console.log('For practice ID:', currentPractice._id);
      
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
      
      console.log('Answer submission status:', response.status);
      console.log('Answer API response:', JSON.stringify(response.data, null, 2));
      
      // Handle potential array or undefined values in feedback
      let feedbackText: string | string[] = '';
      let isCorrect = false;
      
      if (response.data?.success && response.data?.data) {
        console.log('Response data structure:', Object.keys(response.data.data));
        
        // Store the next practice item in the queue if available
        if (response.data.data.nextPractice) {
          setQuestionQueue(prevQueue => [...prevQueue, response.data.data.nextPractice]);
        }
        
        if (response.data.data.evaluation) {
          const evaluation = response.data.data.evaluation;
          console.log('Evaluation data:', JSON.stringify(evaluation, null, 2));
          
          isCorrect = Boolean(evaluation.isCorrect);
          
          if (evaluation.feedback !== undefined) {
            if (Array.isArray(evaluation.feedback)) {
              feedbackText = evaluation.feedback;
              console.log('Feedback is an array:', evaluation.feedback);
            } else {
              feedbackText = evaluation.feedback;
              console.log('Feedback is a string:', evaluation.feedback);
            }
          } else {
            console.log('No feedback provided in the evaluation');
          }
        } else {
          console.log('No evaluation found in response data');
        }
      } else {
        console.error('Invalid response data structure:', response.data);
      }
      
      console.log('Setting feedback state:', { isCorrect, feedback: feedbackText });
      setFeedback({
        isCorrect,
        feedback: feedbackText
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error submitting answer:', error);
      console.error('Error details:', errorMsg);
      setErrorMessage(`Failed to submit answer: ${errorMsg}`);
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to adjust difficulty level
  const adjustDifficulty = async (direction: 'up' | 'down') => {
    try {
      setAdjusting(true);
      setErrorMessage(null);
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to adjust difficulty');
        return;
      }
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.post(`${config.API_URL}/api/practice/adjust-difficulty`, {
        type: practiceType,
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
          `Your ${practiceType} difficulty level has changed from ${oldDifficulty} to ${newLevel.toFixed(2)}.\n\nChange: ${sign}${change}\n\nNew questions will reflect this change.`,
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
      console.error('Error adjusting difficulty:', error);
      setErrorMessage(`Failed to adjust difficulty: ${errorMsg}`);
      Alert.alert('Error', 'Failed to adjust difficulty. Please try again.');
    } finally {
      setAdjusting(false);
    }
  };

  // Function to show difficulty adjustment dialog - make this more robust
  const showAdjustmentDialog = () => {
    console.log('Opening adjustment dialog');
    
    try {
      Alert.alert(
        'Adjust Difficulty Level',
        'How would you like to adjust the difficulty of your practice questions?',
        [
          {
            text: 'Make it Easier (-1.0)',
            onPress: () => {
              console.log('User selected: Make it Easier');
              adjustDifficulty('down');
            }
          },
          {
            text: 'Make it Harder (+1.0)',
            onPress: () => {
              console.log('User selected: Make it Harder');
              adjustDifficulty('up');
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('User canceled difficulty adjustment')
          }
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error showing dialog:', error);
      // Fallback in case Alert.alert fails
      const direction = confirm('Make questions harder? (Cancel for easier)') ? 'up' : 'down';
      adjustDifficulty(direction);
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

  // Generate initial practice on component mount
  useEffect(() => {
    console.log('PracticeScreen mounted, user:', user ? 'User exists' : 'No user');
    if (user) {
      generatePractice(true);
    }
  }, [user]);

  // When practice type changes, force a new practice generation
  useEffect(() => {
    if (user) {
      generatePractice(true);
    }
  }, [practiceType]);

  // Helper function to safely display content that might be string or array
  const displayContent = (content: string | string[] | undefined): string => {
    if (!content) {
      console.log('displayContent: content is empty');
      return '';
    }
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      console.log('displayContent: content is array with length', content.length);
      return content.join('\n');
    }
    console.log('displayContent: content is unexpected type:', typeof content);
    return '';
  };

  // Function to handle asking a question about the feedback
  const askFeedbackQuestion = async () => {
    if (!feedbackQuestion.trim() || !currentPractice || !feedback) return;
    
    try {
      setAskingQuestion(true);
      setFeedbackAnswer(null);
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      
      console.log('Sending request to:', `${config.API_URL}/api/practice/question`);
      console.log('Request data:', {
        question: feedbackQuestion,
        practiceId: currentPractice._id,
        userAnswer,
        feedback: feedback.feedback
      });
      
      const response = await axios.post(
        `${config.API_URL}/api/practice/question`,
        {
          question: feedbackQuestion,
          practiceId: currentPractice._id,
          userAnswer,
          feedback: feedback.feedback
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Full response data:', response.data);
      
      if (response.data && response.data.answer) {
        setFeedbackAnswer(response.data.answer);
      } else {
        console.error('Unexpected response format:', response.data);
        Alert.alert('Error', 'The response from the server was in an unexpected format.');
      }
    } catch (error: any) {
      console.error('Error asking feedback question:', error);
      // Log more detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      Alert.alert('Error', 'Failed to get an answer. Please try again.');
    } finally {
      setAskingQuestion(false);
    }
  };

  // Function to clear practice state including feedback questions
  const handleNextPractice = () => {
    // Clear all feedback-related state
    setFeedback(null);
    setUserAnswer('');
    setFeedbackQuestion('');
    setFeedbackAnswer(null);
    setAskingQuestion(false);
    
    // Generate a new practice question
    generatePractice();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Dutch Practice</Text>
        </View>
        
        <View style={styles.practiceTypeContainer}>
          {['vocabulary', 'grammar', 'conversation'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.practiceTypeButton,
                practiceType === type && styles.practiceTypeButtonActive
              ]}
              onPress={() => {
                setPracticeType(type as any);
                setFeedback(null);
                setUserAnswer('');
                setFeedbackQuestion('');
                setFeedbackAnswer(null);
                setAskingQuestion(false);
                generatePractice(true);
              }}
            >
              <Text
                style={[
                  styles.practiceTypeText,
                  practiceType === type && styles.practiceTypeTextActive
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Difficulty adjustment section */}
        <View style={[styles.difficultyAdjustContainer, difficultyTrend !== 'stable' && {
          backgroundColor: difficultyTrend === 'increasing' ? '#e6f7ef' : '#fde8e8',
          borderWidth: 1,
          borderColor: difficultyTrend === 'increasing' ? '#b7ebd8' : '#f8c9c9'
        }]}>
          <View style={styles.difficultyHeader}>
            <Text style={styles.difficultyText}>
              Current Difficulty: {currentPractice?.difficulty ? currentPractice.difficulty.toFixed(2) : '1.00'}/10
            </Text>
            
            {/* Always show trend, just changing the content based on state */}
            <View style={[styles.trendContainer, {
              backgroundColor: difficultyTrend === 'increasing' 
                ? '#d4f7e7' 
                : difficultyTrend === 'decreasing' 
                  ? '#fad0d0'
                  : '#f0f0f0'
            }]}>
              {difficultyTrend !== 'stable' ? (
                <>
                  <Ionicons 
                    name={difficultyTrend === 'increasing' ? 'arrow-up' : 'arrow-down'} 
                    size={16} 
                    color={difficultyTrend === 'increasing' ? '#27ae60' : '#e74c3c'} 
                  />
                  <Text style={[
                    styles.trendText, 
                    {color: difficultyTrend === 'increasing' ? '#27ae60' : '#e74c3c'}
                  ]}>
                    {difficultyTrend === 'increasing' ? 'Increasing' : 'Decreasing'}
                  </Text>
                </>
              ) : (
                <Text style={styles.trendText}>Stable</Text>
              )}
            </View>
          </View>
          
          {/* Show numeric change when available */}
          {difficultyChange && (
            <View style={styles.changeContainer}>
              <Text style={[
                styles.changeText,
                {color: difficultyChange.startsWith('-') ? '#e74c3c' : '#27ae60'}
              ]}>
                Change: {difficultyChange}
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.adjustMeButton, adjusting && styles.adjustingButton]}
            onPress={showAdjustmentDialog}
            disabled={adjusting || loading}
          >
            <Ionicons name="options" size={18} color="white" />
            <Text style={styles.adjustButtonText}>{adjusting ? 'Adjusting...' : 'Adjust Difficulty'}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Background generation indicator */}
        {generatingBatch && !loading && (
          <View style={styles.backgroundGenerationContainer}>
            <Text style={styles.backgroundGenerationText}>Generating more questions...</Text>
          </View>
        )}
        
        {/* Error message display */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
        
        {/* Loading indicator */}
        {loading ? (
          <ActivityIndicator size="large" color="#4f86f7" style={styles.loader} />
        ) : (
          <>
            {/* Practice content */}
            {currentPractice && (
              <View style={styles.practiceContainer}>
                <Text style={styles.practiceText}>
                  {displayContent(currentPractice.content)}
                </Text>
                
                {/* Difficulty and complexity indicators */}
                <View style={styles.difficultyContainer}>
                  <Text style={styles.levelText}>Difficulty: {currentPractice.difficulty ? currentPractice.difficulty.toFixed(2) : '1.00'}/10</Text>
                  <Text style={styles.levelText}>Complexity: {currentPractice.complexity ? currentPractice.complexity.toFixed(2) : '1.00'}/10</Text>
                </View>
                
                {/* Categories */}
                <View style={styles.categoriesContainer}>
                  {currentPractice.categories && currentPractice.categories.map((category, index) => (
                    <View key={index} style={styles.categoryTag}>
                      <Text style={styles.categoryText}>{category}</Text>
                    </View>
                  ))}
                </View>
                
                {/* Answer input - conditionally show based on question type */}
                {currentPractice.questionType === 'mcq' && 
                 Array.isArray(currentPractice.options) && 
                 currentPractice.options.length > 0 ? (
                  <View style={styles.mcqContainer}>
                    <Text style={styles.mcqPrompt}>Choose the correct answer:</Text>
                    {currentPractice.options.map((option, index) => {
                      // Ensure option is a valid string
                      const optionText = typeof option === 'string' ? option : '';
                      const isSelected = userAnswer && optionText && userAnswer === optionText;
                      
                      return (
                        <TouchableOpacity 
                          key={index}
                          style={[
                            styles.mcqOption,
                            isSelected ? styles.mcqOptionSelected : null
                          ]}
                          onPress={() => optionText && setUserAnswer(optionText)}
                          disabled={!!feedback}
                        >
                          <Text style={[
                            styles.mcqOptionText,
                            isSelected ? styles.mcqOptionTextSelected : null
                          ]}>
                            {optionText}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    style={styles.answerInput}
                    placeholder="Type your answer in Dutch..."
                    value={userAnswer || ''}
                    onChangeText={setUserAnswer}
                    multiline
                    autoCorrect={false}
                    editable={!feedback}
                  />
                )}
                
                {/* Submit button */}
                {!feedback ? (
                  <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={submitAnswer}
                    disabled={!userAnswer || !(typeof userAnswer === 'string' && userAnswer.trim())}
                  >
                    <Text style={styles.buttonText}>Submit Answer</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.feedbackContainer}>
                    <Text style={[
                      styles.feedbackTitle, 
                      { color: feedback.isCorrect ? '#4CAF50' : '#F44336' }
                    ]}>
                      {feedback.isCorrect ? 'Correct!' : 'Not quite right'}
                    </Text>
                    <Text style={styles.feedbackText}>
                      {displayContent(feedback.feedback)}
                    </Text>
                    
                    {/* Next practice button */}
                    <TouchableOpacity 
                      style={styles.nextButton} 
                      onPress={handleNextPractice}
                    >
                      <Text style={styles.buttonText}>Next Practice</Text>
                    </TouchableOpacity>
                    
                    {/* Show translation if available */}
                    {currentPractice && currentPractice.translation && (
                      <View style={styles.translationContainer}>
                        <Text style={styles.translationLabel}>Translation:</Text>
                        <Text style={styles.translationText}>
                          {displayContent(currentPractice.translation)}
                        </Text>
                      </View>
                    )}
                    
                    {/* Feedback question section */}
                    <View style={styles.feedbackQuestionContainer}>
                      <Text style={styles.feedbackQuestionLabel}>
                        Have questions about the feedback? Ask here:
                      </Text>
                      <TextInput
                        style={styles.feedbackQuestionInput}
                        placeholder="Type your question here..."
                        value={feedbackQuestion}
                        onChangeText={setFeedbackQuestion}
                        multiline
                      />
                      <TouchableOpacity
                        style={[
                          styles.askButton,
                          (!feedbackQuestion.trim() || askingQuestion) && styles.disabledButton
                        ]}
                        onPress={askFeedbackQuestion}
                        disabled={!feedbackQuestion.trim() || askingQuestion}
                      >
                        {askingQuestion ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>Ask</Text>
                        )}
                      </TouchableOpacity>
                      
                      {feedbackAnswer && (
                        <View style={styles.answerContainer}>
                          <Text style={styles.answerLabel}>Answer:</Text>
                          <Text style={styles.answerText}>{feedbackAnswer}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  practiceTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  practiceTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  practiceTypeButtonActive: {
    backgroundColor: '#4f86f7',
  },
  practiceTypeText: {
    fontWeight: '600',
    color: '#333',
  },
  practiceTypeTextActive: {
    color: 'white',
  },
  loader: {
    marginTop: 40,
  },
  practiceContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#212529',
    marginBottom: 20,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  levelText: {
    fontSize: 14,
    color: '#6c757d',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryTag: {
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#495057',
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#495057',
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 24,
  },
  translationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
  },
  translationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f86f7',
    marginBottom: 5,
  },
  translationText: {
    fontSize: 16,
    color: '#212529',
  },
  mcqContainer: {
    marginTop: 15,
    width: '100%',
  },
  mcqPrompt: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
    color: '#333',
  },
  mcqOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  mcqOptionSelected: {
    borderColor: '#4f86f7',
    backgroundColor: '#e6f0ff',
  },
  mcqOptionText: {
    fontSize: 16,
    color: '#333',
  },
  mcqOptionTextSelected: {
    color: '#4f86f7',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#ffdddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  backgroundGenerationContainer: {
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  backgroundGenerationText: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  difficultyAdjustContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  difficultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  difficultyText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  changeContainer: {
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  adjustMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#4f86f7',
    minWidth: 180,
  },
  adjustingButton: {
    backgroundColor: '#7ba7f9',
    opacity: 0.8,
  },
  adjustButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  feedbackQuestionContainer: {
    marginTop: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#d1e3f6',
  },
  feedbackQuestionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a6da7',
    marginBottom: 10,
  },
  feedbackQuestionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 10,
  },
  askButton: {
    backgroundColor: '#4a6da7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  answerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a6da7',
    marginBottom: 5,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212529',
  },
}); 