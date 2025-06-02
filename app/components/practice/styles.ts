import { StyleSheet } from 'react-native';

export const practiceStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E6F4EC', // Mint Foam - light background
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
    color: '#318F65', // Forest Verdant - heading
    flex: 1,
  },
  loader: {
    marginTop: 50,
  },
  practiceContainer: {
    backgroundColor: '#FFFFFF', // Snow - card surface
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
    color: '#212121', // Charcoal - main text
    marginBottom: 10,
  },
  // Hint/scaffolding styles
  hintContainer: {
    backgroundColor: '#FFF8D3', // Lemon Frost - soft banner
    borderLeftWidth: 4,
    borderLeftColor: '#E5AF00', // Golden Mango - accent
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  hintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666', // Gray - as requested
  },
  hintToggle: {
    fontSize: 10,
    color: '#318F65', // Forest Verdant
    fontWeight: '500',
    opacity: 0.8,
  },
  hintContent: {
    // Remove overflow hidden to allow full content display
  },
  hintText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#212121', // Charcoal - body text
    marginTop: 8,
  },
  translationText: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - secondary text
    marginBottom: 16,
    fontStyle: 'italic',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryTag: {
    backgroundColor: '#E6F4EC', // Mint Foam - light background
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  categoryText: {
    color: '#318F65', // Forest Verdant - tag text
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - input border
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF', // Snow - input background
    color: '#212121', // Charcoal - input text
  },
  submitButton: {
    backgroundColor: '#5CA480', // Overstep Green - less attention-grabbing
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    color: '#FFFFFF', // Snow - text on dark button
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackContainer: {
    marginTop: 20,
    backgroundColor: '#E6F4EC', // Mint Foam - feedback background
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#318F65', // Forest Verdant - accent
  },
  feedbackText: {
    fontSize: 16,
    color: '#212121', // Charcoal - main text
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: '#5CA480', // Overstep Green - secondary action
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonText: {
    color: '#FFFFFF', // Snow - text on dark button
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFF8D3', // Lemon Frost - error background
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E5AF00', // Golden Mango - warning accent
  },
  errorText: {
    color: '#318F65', // Forest Verdant - error text
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  backgroundGenerationContainer: {
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#E6F4EC', // Mint Foam - background
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  backgroundGenerationText: {
    fontSize: 14,
    color: '#318F65', // Forest Verdant - text
    textAlign: 'center',
    fontWeight: '500',
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
    backgroundColor: '#318F65', // Forest Verdant - primary action
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  onboardingButtonText: {
    color: '#FFFFFF', // Snow - text on dark button
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#E5AF00', // Golden Mango - retry action
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFFFFF', // Snow - text on dark button
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#E6F4EC', // Mint Foam - empty state background
    borderRadius: 12,
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  emptyStateText: {
    fontSize: 16,
    color: '#212121', // Charcoal - main text
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
    color: '#5CA480', // Overstep Green - secondary text
    fontWeight: '500',
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - input border
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121', // Charcoal - input text
    backgroundColor: '#FFFFFF', // Snow - input background
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF', // Snow - button text
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#318F65', // Forest Verdant - heading
  },
  translationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E6F4EC', // Mint Foam - background
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#318F65', // Forest Verdant - accent
  },
  translationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - label
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
    color: '#212121', // Charcoal - main text
  },
  mcqOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#FFFFFF', // Snow - option background
  },
  mcqOptionSelected: {
    borderColor: '#318F65', // Forest Verdant - selected border
    backgroundColor: '#E6F4EC', // Mint Foam - selected background
  },
  mcqOptionText: {
    fontSize: 16,
    color: '#212121', // Charcoal - option text
  },
  mcqOptionTextSelected: {
    color: '#318F65', // Forest Verdant - selected text
    fontWeight: '500',
  },
  difficultyAdjustContainer: {
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E6F4EC', // Mint Foam - border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#318F65', // Forest Verdant - heading
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EC', // Mint Foam - background
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  trendText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
    color: '#5CA480', // Overstep Green - secondary text
  },
  changeContainer: {
    backgroundColor: '#FFF8D3', // Lemon Frost - change background
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    alignSelf: 'flex-start'
  },
  adjustMeButton: {
    backgroundColor: '#5CA480', // Overstep Green - secondary action
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adjustingButton: {
    backgroundColor: '#E5AF00', // Golden Mango - adjusting state
  },
  adjustButtonText: {
    color: '#FFFFFF', // Snow - button text
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8
  },
  feedbackQuestionContainer: {
    marginTop: 20,
    backgroundColor: '#E6F4EC', // Mint Foam - feedback background
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - border
  },
  feedbackQuestionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - label
    marginBottom: 10,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#5CA480', // Overstep Green - input border
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121', // Charcoal - input text
    backgroundColor: '#FFFFFF', // Snow - input background
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  askButton: {
    backgroundColor: '#F6C83F', // Sunbeam Yellow - primary CTA
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  askButtonText: {
    color: '#212121', // Charcoal - text on light button
    fontSize: 16,
    fontWeight: '600',
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