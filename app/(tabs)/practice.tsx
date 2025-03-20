import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from '@/constants/Config';
import { useAuth } from '@/contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';

// Define types for practice content
interface PracticeItem {
  _id: string;
  content: string;
  translation?: string;
  type: 'vocabulary' | 'grammar' | 'conversation' | 'reading' | 'listening';
  difficulty: number;
  complexity: number;
  categories: string[];
}

// Main practice screen component
export default function PracticeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPractice, setCurrentPractice] = useState<PracticeItem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; feedback: string } | null>(null);
  const [practiceType, setPracticeType] = useState<'vocabulary' | 'grammar' | 'conversation'>('vocabulary');

  // Function to fetch a new practice item
  const generatePractice = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to practice');
      return;
    }
    
    setLoading(true);
    setFeedback(null);
    setUserAnswer('');
    
    try {
      const token = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.post(`${config.API_URL}/api/practice/generate`, {
        userId: user._id,
        type: practiceType
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCurrentPractice(response.data);
    } catch (error) {
      console.error('Error generating practice:', error);
      Alert.alert('Error', 'Failed to generate practice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to submit user's answer
  const submitAnswer = async () => {
    if (!currentPractice || !userAnswer.trim()) {
      Alert.alert('Error', 'Please provide an answer');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.post(`${config.API_URL}/api/practice/submit`, {
        practiceId: currentPractice._id,
        answer: userAnswer
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setFeedback({
        isCorrect: response.data.isCorrect,
        feedback: response.data.feedback
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate initial practice on component mount
  useEffect(() => {
    if (user) {
      generatePractice();
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Dutch Practice</Text>
        
        {/* Practice type selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, practiceType === 'vocabulary' && styles.selectedType]}
            onPress={() => {
              setPracticeType('vocabulary');
              setFeedback(null);
              generatePractice();
            }}
          >
            <Text style={styles.typeButtonText}>Vocabulary</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.typeButton, practiceType === 'grammar' && styles.selectedType]}
            onPress={() => {
              setPracticeType('grammar');
              setFeedback(null);
              generatePractice();
            }}
          >
            <Text style={styles.typeButtonText}>Grammar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.typeButton, practiceType === 'conversation' && styles.selectedType]}
            onPress={() => {
              setPracticeType('conversation');
              setFeedback(null);
              generatePractice();
            }}
          >
            <Text style={styles.typeButtonText}>Conversation</Text>
          </TouchableOpacity>
        </View>
        
        {/* Loading indicator */}
        {loading ? (
          <ActivityIndicator size="large" color="#4f86f7" style={styles.loader} />
        ) : (
          <>
            {/* Practice content */}
            {currentPractice && (
              <View style={styles.practiceContainer}>
                <Text style={styles.practiceText}>{currentPractice.content}</Text>
                
                {/* Difficulty and complexity indicators */}
                <View style={styles.difficultyContainer}>
                  <Text style={styles.levelText}>Difficulty: {currentPractice.difficulty}/10</Text>
                  <Text style={styles.levelText}>Complexity: {currentPractice.complexity}/10</Text>
                </View>
                
                {/* Categories */}
                <View style={styles.categoriesContainer}>
                  {currentPractice.categories.map((category, index) => (
                    <View key={index} style={styles.categoryTag}>
                      <Text style={styles.categoryText}>{category}</Text>
                    </View>
                  ))}
                </View>
                
                {/* Answer input */}
                <TextInput
                  style={styles.answerInput}
                  placeholder="Type your answer in Dutch..."
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  multiline
                  autoCorrect={false}
                  editable={!feedback}
                />
                
                {/* Submit button */}
                {!feedback ? (
                  <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={submitAnswer}
                    disabled={!userAnswer.trim()}
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
                    <Text style={styles.feedbackText}>{feedback.feedback}</Text>
                    
                    {/* Next practice button */}
                    <TouchableOpacity 
                      style={styles.nextButton} 
                      onPress={generatePractice}
                    >
                      <Text style={styles.buttonText}>Next Practice</Text>
                    </TouchableOpacity>
                    
                    {/* Show translation if available */}
                    {currentPractice.translation && (
                      <View style={styles.translationContainer}>
                        <Text style={styles.translationLabel}>Translation:</Text>
                        <Text style={styles.translationText}>{currentPractice.translation}</Text>
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
}); 