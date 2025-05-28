import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { practiceStyles } from './styles';
import { PracticeItem } from '../../types/practice';
import { displayContent } from '../../utils/practiceUtils';

interface PracticeContentProps {
  practice: PracticeItem;
  subjectProgress?: {
    currentDifficulty: number;
    currentComplexity: number;
  };
}

export const PracticeContent: React.FC<PracticeContentProps> = ({ practice, subjectProgress }) => {
  const [isHintExpanded, setIsHintExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const toggleHint = () => {
    setIsHintExpanded(!isHintExpanded);
    Animated.timing(animatedHeight, {
      toValue: isHintExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const hintMaxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust this value based on your content
  });

  return (
    <>
      <Text style={practiceStyles.practiceText}>
        {displayContent(practice.content)}
      </Text>
      
      {/* Show scaffolding/hint if available */}
      {practice.scaffolding && practice.scaffolding.trim() !== '' && (
        <View style={practiceStyles.hintContainer}>
          <TouchableOpacity 
            onPress={toggleHint} 
            style={[
              practiceStyles.hintHeader,
              { opacity: isHintExpanded ? 1 : 0.6 }
            ]}
          >
            <Text style={practiceStyles.hintLabel}>💡 Hint</Text>
            <Text style={[practiceStyles.hintToggle, { transform: [{ rotate: isHintExpanded ? '180deg' : '0deg' }] }]}>
              ▼
            </Text>
          </TouchableOpacity>
          
          <Animated.View 
            style={[
              practiceStyles.hintContent,
              { 
                maxHeight: hintMaxHeight,
                opacity: animatedHeight,
              }
            ]}
          >
            <Text style={practiceStyles.hintText}>
              {practice.scaffolding}
            </Text>
          </Animated.View>
        </View>
      )}
      
      {/* Difficulty and complexity indicators */}
      <View style={practiceStyles.difficultyContainer}>
        <Text style={practiceStyles.levelText}>
          Difficulty: {subjectProgress?.currentDifficulty ? subjectProgress.currentDifficulty.toFixed(2) : (practice.difficulty ? practice.difficulty.toFixed(2) : '1.00')}/10
        </Text>
        <Text style={practiceStyles.levelText}>
          Complexity: {subjectProgress?.currentComplexity ? subjectProgress.currentComplexity.toFixed(2) : (practice.complexity ? practice.complexity.toFixed(2) : '1.00')}/10
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