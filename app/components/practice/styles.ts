import { StyleSheet } from 'react-native';

export const practiceStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
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
  loader: {
    marginTop: 40,
  },
  practiceContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  practiceText: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 24,
    color: '#333'
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
  changeText: {
    fontSize: 14,
    fontWeight: '600'
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
  changeValueText: {
    fontSize: 14,
    fontWeight: '600'
  },
}); 