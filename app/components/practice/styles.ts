import { StyleSheet } from 'react-native';

export const practiceStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    padding: 10,
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
    flex: 1,
  },
  loader: {
    marginTop: 50,
  },
  practiceContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  practiceContent: {
    marginBottom: 16,
  },
  practiceText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    marginBottom: 10,
  },
  // Hint/scaffolding styles
  hintContainer: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  hintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
  },
  hintToggle: {
    fontSize: 12,
    color: '#856404',
    fontWeight: 'bold',
  },
  hintContent: {
    overflow: 'hidden',
  },
  hintText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6c5100',
    marginTop: 8,
  },
  translationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryTag: {
    backgroundColor: '#e1e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#4a6fa5',
    fontSize: 12,
  },
  inputContainer: {
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackContainer: {
    marginTop: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
  },
  feedbackText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    marginBottom: 10,
  },
  backgroundGenerationContainer: {
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  backgroundGenerationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  changeArrow: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeValueText: {
    fontSize: 12,
    marginLeft: 4,
  },
  // New styles for onboarding buttons and empty state
  onboardingButton: {
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  onboardingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f5f8ff',
    borderRadius: 12,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  difficultyAdjustContainer: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  difficultyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  trendText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4
  },
  changeContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    alignSelf: 'flex-start'
  },
  adjustMeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16
  },
  adjustingButton: {
    backgroundColor: '#999',
  },
  adjustButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8
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
  adjustmentModeGlow: {
    shadowColor: '#4f86f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    borderColor: '#4f86f7',
    borderWidth: 2,
    backgroundColor: '#f0f7ff',
  },
  changesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginTop: 12
  },
  changeItem: {
    alignItems: 'center',
    paddingHorizontal: 12
  },
  changeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
}); 