import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Config from '@/constants/Config';
import * as SecureStore from 'expo-secure-store';

interface Practice {
  _id: string;
  content: string;
  translation?: string;
  type: 'vocabulary' | 'grammar' | 'conversation' | 'reading' | 'listening';
  difficulty: number;
  categories: string[];
}

interface PracticeResponse {
  feedback: string;
  isCorrect: boolean;
}

const PRACTICE_TYPES = [
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'reading', label: 'Reading' },
  { id: 'listening', label: 'Listening' }
];

export default function PracticeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('vocabulary');
  const [practice, setPractice] = useState<Practice | null>(null);
  const [answer, setAnswer] = useState('');
  const [response, setResponse] = useState<PracticeResponse | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Generate practice based on selected type
  const generatePractice = async () => {
    if (!user) return;

    try {
      setGenerating(true);
      setSubmitted(false);
      setResponse(null);
      setAnswer('');

      const token = await SecureStore.getItemAsync(Config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.post(
        `${Config.API_URL}/api/practice/generate`,
        {
          userId: user._id,
          type: selectedType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPractice(response.data);
    } catch (error) {
      console.error('Error generating practice:', error);
      Alert.alert('Error', 'Failed to generate practice. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Submit answer for evaluation
  const submitAnswer = async () => {
    if (!practice || !answer.trim()) return;

    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync(Config.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await axios.post(
        `${Config.API_URL}/api/practice/submit`,
        {
          practiceId: practice._id,
          answer: answer.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setResponse({
        feedback: response.data.feedback,
        isCorrect: response.data.isCorrect
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate practice on initial load
  useEffect(() => {
    if (user) {
      generatePractice();
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Dutch Practice</Text>
          <Text style={styles.subtitle}>Improve your Dutch skills with AI-powered exercises</Text>
        </View>

        {/* Practice Type Selection */}
        <View style={styles.typeContainer}>
          <Text style={styles.sectionTitle}>Practice Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeButtons}>
            {PRACTICE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  selectedType === type.id && styles.selectedTypeButton
                ]}
                onPress={() => setSelectedType(type.id)}
                disabled={generating || loading}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === type.id && styles.selectedTypeButtonText
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.generateButton, (generating || loading) && styles.disabledButton]}
            onPress={generatePractice}
            disabled={generating || loading}
          >
            {generating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.generateButtonText}>Generate New Practice</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Practice Content */}
        {practice ? (
          <View style={styles.practiceCard}>
            <View style={styles.practiceHeader}>
              <View style={styles.practiceTypeContainer}>
                <Text style={styles.practiceType}>{practice.type.charAt(0).toUpperCase() + practice.type.slice(1)}</Text>
              </View>
              <View style={styles.difficultyContainer}>
                <Text style={styles.difficultyText}>Level: {practice.difficulty}/10</Text>
              </View>
            </View>

            <Text style={styles.practiceContent}>{practice.content}</Text>
            
            {practice.translation && (
              <Text style={styles.practiceTranslation}>Translation: {practice.translation}</Text>
            )}

            <View style={styles.categoryContainer}>
              {practice.categories.map((category, index) => (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.answerLabel}>Your Answer:</Text>
            <TextInput
              style={styles.answerInput}
              value={answer}
              onChangeText={setAnswer}
              placeholder="Type your answer in Dutch..."
              multiline
              maxLength={500}
              editable={!submitted && !loading}
            />

            {!submitted ? (
              <TouchableOpacity
                style={[styles.submitButton, (loading || !answer.trim()) && styles.disabledButton]}
                onPress={submitAnswer}
                disabled={loading || !answer.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Answer</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={generatePractice}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.nextButtonText}>Next Practice</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : generating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f86f7" />
            <Text style={styles.loadingText}>Generating your practice...</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Select a practice type and tap 'Generate'</Text>
          </View>
        )}

        {/* Evaluation Feedback */}
        {response && (
          <View style={[
            styles.feedbackContainer,
            response.isCorrect ? styles.correctFeedback : styles.incorrectFeedback
          ]}>
            <Text style={styles.feedbackTitle}>
              {response.isCorrect ? '🎉 Correct!' : '❌ Not quite right'}
            </Text>
            <Text style={styles.feedbackText}>{response.feedback}</Text>
          </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  typeContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  typeButtons: {
    paddingVertical: 5,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 10,
  },
  selectedTypeButton: {
    backgroundColor: '#4f86f7',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#495057',
  },
  selectedTypeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  generateButton: {
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  practiceCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  practiceTypeContainer: {
    backgroundColor: '#4f86f7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  practiceType: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  difficultyContainer: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  difficultyText: {
    color: '#495057',
    fontSize: 14,
  },
  practiceContent: {
    fontSize: 18,
    color: '#212529',
    marginBottom: 10,
    lineHeight: 26,
  },
  practiceTranslation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryTag: {
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#495057',
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 10,
  },
  answerInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#212529',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  feedbackContainer: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  correctFeedback: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  incorrectFeedback: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6c757d',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});
