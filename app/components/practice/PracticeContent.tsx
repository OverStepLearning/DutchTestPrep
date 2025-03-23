import React from 'react';
import { View, Text } from 'react-native';
import { practiceStyles } from './styles';
import { PracticeItem } from '../../types/practice';
import { displayContent } from '../../utils/practiceUtils';

interface PracticeContentProps {
  practice: PracticeItem;
}

export const PracticeContent: React.FC<PracticeContentProps> = ({ practice }) => {
  return (
    <>
      <Text style={practiceStyles.practiceText}>
        {displayContent(practice.content)}
      </Text>
      
      {/* Difficulty and complexity indicators */}
      <View style={practiceStyles.difficultyContainer}>
        <Text style={practiceStyles.levelText}>
          Difficulty: {practice.difficulty ? practice.difficulty.toFixed(2) : '1.00'}/10
        </Text>
        <Text style={practiceStyles.levelText}>
          Complexity: {practice.complexity ? practice.complexity.toFixed(2) : '1.00'}/10
        </Text>
      </View>
      
      {/* Categories */}
      <View style={practiceStyles.categoriesContainer}>
        {practice.categories && practice.categories.map((category: string, index: number) => (
          <View key={index} style={practiceStyles.categoryTag}>
            <Text style={practiceStyles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
    </>
  );
}; 