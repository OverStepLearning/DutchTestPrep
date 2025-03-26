import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { practiceStyles } from './styles';
import { DifficultyTrend, AdjustmentModeInfo } from '../../types/practice';

interface DifficultyAdjusterProps {
  difficultyTrend: DifficultyTrend;
  difficultyValue: number;
  complexityValue: number;
  difficultyChange: string | null;
  adjusting: boolean;
  adjustmentMode?: AdjustmentModeInfo;
  onAdjustDifficulty: () => void;
}

export const DifficultyAdjuster: React.FC<DifficultyAdjusterProps> = ({
  difficultyTrend,
  difficultyValue,
  complexityValue,
  difficultyChange,
  adjusting,
  adjustmentMode = { isInAdjustmentMode: false, adjustmentPracticesRemaining: 0 },
  onAdjustDifficulty
}) => {
  const formattedDifficulty = difficultyValue ? difficultyValue.toFixed(2) : '1.00';
  const formattedComplexity = complexityValue ? complexityValue.toFixed(2) : '1.00';
  
  const safeAdjustmentMode = adjustmentMode || { isInAdjustmentMode: false, adjustmentPracticesRemaining: 0 };
  
  return (
    <View style={[
      practiceStyles.difficultyAdjustContainer, 
      difficultyTrend !== 'stable' && {
        backgroundColor: difficultyTrend === 'increasing' ? '#e6f7ef' : '#fde8e8',
        borderWidth: 1,
        borderColor: difficultyTrend === 'increasing' ? '#b7ebd8' : '#f8c9c9'
      },
      safeAdjustmentMode.isInAdjustmentMode && styles.adjustmentModeContainer
    ]}>
      {safeAdjustmentMode.isInAdjustmentMode && (
        <View style={styles.adjustmentModeHeader}>
          <Ionicons name="trending-up" size={18} color="#4f86f7" />
          <Text style={styles.adjustmentModeText}>
            Adjustment Mode - {safeAdjustmentMode.adjustmentPracticesRemaining} practices remaining
          </Text>
        </View>
      )}
    
      <View style={practiceStyles.difficultyHeader}>
        <Text style={practiceStyles.difficultyText}>
          Current Difficulty: {formattedDifficulty}/10
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
      
      <View style={styles.complexityRow}>
        <Text style={styles.complexityText}>
          Complexity: {formattedComplexity}/10
        </Text>
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
        style={[
          practiceStyles.adjustMeButton, 
          adjusting && practiceStyles.adjustingButton,
          safeAdjustmentMode.isInAdjustmentMode && styles.inAdjustmentModeButton
        ]}
        onPress={onAdjustDifficulty}
        disabled={adjusting}
      >
        {adjusting ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={styles.buttonLoader} />
            <Text style={practiceStyles.adjustButtonText}>Adjusting...</Text>
          </>
        ) : (
          <>
            <Ionicons name="options" size={18} color="white" />
            <Text style={practiceStyles.adjustButtonText}>
              {safeAdjustmentMode.isInAdjustmentMode 
                ? 'Fine-tuning in progress...' 
                : 'Adjust Difficulty'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  complexityRow: {
    marginVertical: 8,
    padding: 4
  },
  complexityText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555'
  },
  adjustmentModeContainer: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#c1d8ff'
  },
  adjustmentModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0edff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10
  },
  adjustmentModeText: {
    color: '#4f86f7',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14
  },
  inAdjustmentModeButton: {
    backgroundColor: '#4f86f7',
    opacity: 0.8
  },
  buttonLoader: {
    marginRight: 8
  }
}); 