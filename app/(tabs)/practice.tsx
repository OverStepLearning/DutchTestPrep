import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from '@/constants/Config';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';

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
  const [currentPractice, setCurrentPractice] = useState<PracticeItem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; feedback: string | string[] } | null>(null);
  const [practiceType, setPracticeType] = useState<'vocabulary' | 'grammar' | 'conversation'>('vocabulary');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to generate practice with additional error handling
  const generatePractice = async () => {
    try {
      setErrorMessage(null);
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to practice');
        return;
      }
      
      setLoading(true);
      setFeedback(null);
      setUserAnswer('');
      
      const token = await storage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      console.log('Starting practice request with type:', practiceType);
      const response = await axios.post(`${config.API_URL}/api/practice/generate`, {
        userId: user._id,
        type: practiceType
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Practice API Response Status:', response.status);
      console.log('Practice API Response Data:', JSON.stringify(response.data, null, 2));
      
      // Ensure we have valid data before setting it
      if (response.data && response.data.data && typeof response.data.data === 'object') {
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
      
      if (response.data && response.data.data) {
        console.log('Response data structure:', Object.keys(response.data.data));
        
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

  // Generate initial practice on component mount
  useEffect(() => {
    console.log('PracticeScreen mounted, user:', user ? 'User exists' : 'No user');
    if (user) {
      generatePractice();
    }
  }, [user]);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Dutch Practice</Text>
        
        {/* Practice type selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton, 
              practiceType === 'vocabulary' ? styles.selectedType : null
            ]}
            onPress={() => {
              setPracticeType('vocabulary');
              setFeedback(null);
              generatePractice();
            }}
          >
            <Text style={styles.typeButtonText}>Vocabulary</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton, 
              practiceType === 'grammar' ? styles.selectedType : null
            ]}
            onPress={() => {
              setPracticeType('grammar');
              setFeedback(null);
              generatePractice();
            }}
          >
            <Text style={styles.typeButtonText}>Grammar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton, 
              practiceType === 'conversation' ? styles.selectedType : null
            ]}
            onPress={() => {
              setPracticeType('conversation');
              setFeedback(null);
              generatePractice();
            }}
          >
            <Text style={styles.typeButtonText}>Conversation</Text>
          </TouchableOpacity>
        </View>
        
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
                  <Text style={styles.levelText}>Difficulty: {currentPractice.difficulty || 1}/10</Text>
                  <Text style={styles.levelText}>Complexity: {currentPractice.complexity || 1}/10</Text>
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
                      onPress={generatePractice}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#4f86f7',
  },
  typeButtonText: {
    fontWeight: '600',
    color: '#333',
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
}); 