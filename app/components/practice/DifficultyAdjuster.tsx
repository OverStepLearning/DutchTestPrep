import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const safeAdjustmentMode = adjustmentMode || { isInAdjustmentMode: false, adjustmentPracticesRemaining: 0 };

  return (
    <View style={styles.container}>
      {/* Adjustment Mode Indicator */}
      {safeAdjustmentMode.isInAdjustmentMode && (
        <View style={styles.adjustmentModeIndicator}>
          <Ionicons name="trending-up" size={14} color="#4f86f7" />
          <Text style={styles.adjustmentModeText}>
            Calibrating ({safeAdjustmentMode.adjustmentPracticesRemaining} left)
          </Text>
        </View>
      )}
      
      {/* Simple Adjust Button */}
      <TouchableOpacity
        style={[
          styles.adjustButton,
          adjusting && styles.adjustingButton,
          safeAdjustmentMode.isInAdjustmentMode && styles.inAdjustmentModeButton
        ]}
        onPress={onAdjustDifficulty}
        disabled={adjusting || safeAdjustmentMode.isInAdjustmentMode}
      >
        {adjusting ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={styles.buttonLoader} />
            <Text style={styles.buttonText}>Adjusting...</Text>
          </>
        ) : (
          <>
            <Ionicons name="options" size={16} color="#5CA480" />
            <Text style={styles.buttonText}>
              {safeAdjustmentMode.isInAdjustmentMode 
                ? 'Calibrating...' 
                : 'Adjust Level'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  adjustmentModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0EDFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adjustmentModeText: {
    color: '#4f86f7',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#5CA480',
  },
  adjustingButton: {
    backgroundColor: '#E5AF00',
    borderColor: '#E5AF00',
  },
  inAdjustmentModeButton: {
    backgroundColor: '#4f86f7',
    borderColor: '#4f86f7',
    opacity: 0.8,
  },
  buttonText: {
    color: '#5CA480',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  buttonLoader: {
    marginRight: 4,
  },
}); 