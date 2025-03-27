import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { practiceStyles } from './styles';
import { DifficultyTrend, AdjustmentModeInfo } from '../../types/practice';

interface DifficultyAdjusterProps {
  difficultyTrend: DifficultyTrend;
  difficultyValue: number;
  complexityValue: number;
  difficultyChange: string | null;
  complexityChange: string | null;
  adjusting: boolean;
  adjustmentMode?: AdjustmentModeInfo;
  onAdjustDifficulty: () => void;
}

export const DifficultyAdjuster: React.FC<DifficultyAdjusterProps> = ({
  difficultyTrend,
  difficultyValue,
  complexityValue,
  difficultyChange,
  complexityChange,
  adjusting,
  adjustmentMode = { isInAdjustmentMode: false, adjustmentPracticesRemaining: 0 },
  onAdjustDifficulty
}) => {
  // Debug logging for props
  useEffect(() => {
    
    // Add warning for hardcoded value detection - helps catch bugs
    if (adjustmentMode && 
        adjustmentMode.isInAdjustmentMode === true && 
        adjustmentMode.adjustmentPracticesRemaining === 10) {
      console.warn('[DifficultyAdjuster] WARNING: Detected likely hardcoded adjustmentMode value!');
    }
  }, [adjustmentMode]);

  const formattedDifficulty = difficultyValue ? difficultyValue.toFixed(2) : '1.00';
  const formattedComplexity = complexityValue ? complexityValue.toFixed(2) : '1.00';
  const adjStr = adjustmentMode ? 'Adjustment Mode' : 'Normal Mode';
  const safeAdjustmentMode = adjustmentMode || { isInAdjustmentMode: false, adjustmentPracticesRemaining: 0 };
  const adjustmentModeStr = adjustmentMode.isInAdjustmentMode ? 'Adjustment Mode' : 'Normal Mode';
  const hasChanges = difficultyChange !== null || complexityChange !== null;
  const showTrend = hasChanges && difficultyTrend !== 'stable';
  return (
    <View style={[
      practiceStyles.difficultyAdjustContainer, 
      showTrend && {
        backgroundColor: difficultyTrend === 'increasing' ? '#e6f7ef' : '#fde8e8',
        borderWidth: 1,
        borderColor: difficultyTrend === 'increasing' ? '#b7ebd8' : '#f8c9c9'
      },
      safeAdjustmentMode.isInAdjustmentMode && practiceStyles.adjustmentModeGlow
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
          Current {adjustmentModeStr} Difficulty: {formattedDifficulty}/10
        </Text>
        
        {hasChanges && (
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
        )}
      </View>
      
      <View style={styles.complexityRow}>
        <Text style={styles.complexityText}>
          Complexity: {formattedComplexity}/10
        </Text>
      </View>
      
      {(difficultyChange || complexityChange) && (
        <View style={practiceStyles.changesContainer}>
          {difficultyChange && (
            <View style={practiceStyles.changeItem}>
              <Text style={practiceStyles.changeLabel}>Difficulty Change</Text>
              <Text style={[
                practiceStyles.changeValueText,
                {color: difficultyChange.startsWith('-') ? '#e74c3c' : '#27ae60'}
              ]}>
                {difficultyChange}
              </Text>
            </View>
          )}
          
          {complexityChange && (
            <View style={practiceStyles.changeItem}>
              <Text style={practiceStyles.changeLabel}>Complexity Change</Text>
              <Text style={[
                practiceStyles.changeValueText,
                {color: complexityChange.startsWith('-') ? '#e74c3c' : '#27ae60'}
              ]}>
                {complexityChange}
              </Text>
            </View>
          )}
        </View>
      )}
      
      <TouchableOpacity
        style={[
          practiceStyles.adjustMeButton, 
          adjusting && practiceStyles.adjustingButton,
          safeAdjustmentMode.isInAdjustmentMode && styles.inAdjustmentModeButton
        ]}
        onPress={onAdjustDifficulty}
        disabled={adjusting || safeAdjustmentMode.isInAdjustmentMode}
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
                ? 'Adjustment in progress...' 
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