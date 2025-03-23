import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { practiceStyles } from './styles';

interface PracticeTypeSelectorProps {
  currentType: 'vocabulary' | 'grammar' | 'conversation';
  onSelectType: (type: 'vocabulary' | 'grammar' | 'conversation') => void;
}

export const PracticeTypeSelector: React.FC<PracticeTypeSelectorProps> = ({
  currentType,
  onSelectType
}) => {
  const practiceTypes = ['vocabulary', 'grammar', 'conversation'];
  
  return (
    <View style={practiceStyles.practiceTypeContainer}>
      {practiceTypes.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            practiceStyles.practiceTypeButton,
            currentType === type && practiceStyles.practiceTypeButtonActive
          ]}
          onPress={() => onSelectType(type as 'vocabulary' | 'grammar' | 'conversation')}
        >
          <Text
            style={[
              practiceStyles.practiceTypeText,
              currentType === type && practiceStyles.practiceTypeTextActive
            ]}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}; 