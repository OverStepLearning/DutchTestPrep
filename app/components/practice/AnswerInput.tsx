import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { practiceStyles } from './styles';
import { PracticeItem } from '../../types/practice';

interface AnswerInputProps {
  practice: PracticeItem;
  userAnswer: string;
  onChangeAnswer: (text: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  practice,
  userAnswer,
  onChangeAnswer,
  onSubmit,
  disabled
}) => {
  // Check for both 'mcq' and 'multiple-choice' question types
  const isMultipleChoice = (practice.questionType === 'mcq' || practice.questionType === 'multiple-choice') && 
      Array.isArray(practice.options) && 
      practice.options.length > 0;
      
  if (isMultipleChoice && practice.options) {
    return (
      <View style={practiceStyles.mcqContainer}>
        <Text style={practiceStyles.mcqPrompt}>Choose the correct answer:</Text>
        {practice.options.map((option: string, index: number) => {
          // Ensure option is a valid string
          const optionText = typeof option === 'string' ? option : '';
          const isSelected = userAnswer && optionText && userAnswer === optionText;
          
          return (
            <TouchableOpacity 
              key={index}
              style={[
                practiceStyles.mcqOption,
                isSelected ? practiceStyles.mcqOptionSelected : null
              ]}
              onPress={() => optionText && onChangeAnswer(optionText)}
              disabled={disabled}
            >
              <Text style={[
                practiceStyles.mcqOptionText,
                isSelected ? practiceStyles.mcqOptionTextSelected : null
              ]}>
                {optionText}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {/* Add submit button for multiple choice questions */}
        <TouchableOpacity 
          style={[
            practiceStyles.submitButton,
            { marginTop: 20 }
          ]} 
          onPress={onSubmit}
          disabled={!userAnswer || disabled}
        >
          <Text style={practiceStyles.buttonText}>Submit Answer</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View>
      <TextInput
        style={practiceStyles.answerInput}
        placeholder="Type your answer in Dutch..."
        value={userAnswer || ''}
        onChangeText={onChangeAnswer}
        multiline
        autoCorrect={false}
        editable={!disabled}
      />
      
      <TouchableOpacity 
        style={practiceStyles.submitButton} 
        onPress={onSubmit}
        disabled={!userAnswer || !(typeof userAnswer === 'string' && userAnswer.trim())}
      >
        <Text style={practiceStyles.buttonText}>Submit Answer</Text>
      </TouchableOpacity>
    </View>
  );
}; 