import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { practiceStyles } from './styles';
import { DifficultyTrend } from '../../types/practice';

interface DifficultyAdjusterProps {
  difficultyTrend: DifficultyTrend;
  difficultyValue: number;
  difficultyChange: string | null;
  adjusting: boolean;
  onAdjustDifficulty: () => void;
}

export const DifficultyAdjuster: React.FC<DifficultyAdjusterProps> = ({
  difficultyTrend,
  difficultyValue,
  difficultyChange,
  adjusting,
  onAdjustDifficulty
}) => {
  return (
    <View style={[
      practiceStyles.difficultyAdjustContainer, 
      difficultyTrend !== 'stable' && {
        backgroundColor: difficultyTrend === 'increasing' ? '#e6f7ef' : '#fde8e8',
        borderWidth: 1,
        borderColor: difficultyTrend === 'increasing' ? '#b7ebd8' : '#f8c9c9'
      }
    ]}>
      <View style={practiceStyles.difficultyHeader}>
        <Text style={practiceStyles.difficultyText}>
          Current Difficulty: {difficultyValue ? difficultyValue.toFixed(2) : '1.00'}/10
        </Text>
        
        {/* Always show trend, just changing the content based on state */}
        <View style={[
          practiceStyles.trendContainer, 
          {
            backgroundColor: difficultyTrend === 'increasing' 
              ? '#d4f7e7' 
              : difficultyTrend === 'decreasing' 
                ? '#fad0d0'
                : '#f0f0f0'
          }
        ]}>
          {difficultyTrend !== 'stable' ? (
            <>
              <Ionicons 
                name={difficultyTrend === 'increasing' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color={difficultyTrend === 'increasing' ? '#27ae60' : '#e74c3c'} 
              />
              <Text style={[
                practiceStyles.trendText, 
                {color: difficultyTrend === 'increasing' ? '#27ae60' : '#e74c3c'}
              ]}>
                {difficultyTrend === 'increasing' ? 'Increasing' : 'Decreasing'}
              </Text>
            </>
          ) : (
            <Text style={practiceStyles.trendText}>Stable</Text>
          )}
        </View>
      </View>
      
      {/* Show numeric change when available */}
      {difficultyChange && (
        <View style={practiceStyles.changeContainer}>
          <Text style={[
            practiceStyles.changeText,
            {color: difficultyChange.startsWith('-') ? '#e74c3c' : '#27ae60'}
          ]}>
            Change: {difficultyChange}
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[practiceStyles.adjustMeButton, adjusting && practiceStyles.adjustingButton]}
        onPress={onAdjustDifficulty}
        disabled={adjusting}
      >
        <Ionicons name="options" size={18} color="white" />
        <Text style={practiceStyles.adjustButtonText}>
          {adjusting ? 'Adjusting...' : 'Adjust Difficulty'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}; 