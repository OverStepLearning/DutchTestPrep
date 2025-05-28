import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DifficultyDisplayProps {
  currentDifficulty: number;
  currentComplexity: number;
  averageDifficulty: number;
}

export const DifficultyDisplay: React.FC<DifficultyDisplayProps> = ({
  currentDifficulty,
  currentComplexity,
  averageDifficulty
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Format numbers to 2 decimal places
  const formatNumber = (num: number): string => num.toFixed(2);
  
  // Helper to determine color based on level
  const getDifficultyColor = (level: number): string => {
    if (level < 3) return '#4CAF50'; // Easy - green
    if (level < 6) return '#2196F3'; // Medium - blue
    if (level < 8) return '#FF9800'; // Hard - orange
    return '#F44336'; // Very hard - red
  };
  
  // Helper to determine difficulty label
  const getDifficultyLabel = (level: number): string => {
    if (level < 3) return 'Beginner';
    if (level < 6) return 'Intermediate';
    if (level < 8) return 'Advanced';
    return 'Expert';
  };

  const difficultyColor = getDifficultyColor(currentDifficulty);
  const difficultyLabel = getDifficultyLabel(currentDifficulty);
  
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Learning Level</Text>
        <TouchableOpacity 
          onPress={() => setShowInfoModal(true)}
          style={styles.infoIconContainer}
        >
          <Ionicons name="information-circle-outline" size={20} color="#4f86f7" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.levelContainer}>
        <View style={styles.mainLevelDisplay}>
          <Text style={[styles.levelValue, { color: difficultyColor }]}>
            {formatNumber(currentDifficulty)}
          </Text>
          <Text style={styles.levelScale}>/10</Text>
        </View>
        <Text style={[styles.levelLabel, { color: difficultyColor }]}>
          {difficultyLabel}
        </Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="trending-up" size={18} color="#4f86f7" />
          </View>
          <Text style={styles.detailLabel}>Complexity Level:</Text>
          <Text style={styles.detailValue}>{formatNumber(currentComplexity)}/10</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="analytics" size={18} color="#4f86f7" />
          </View>
          <Text style={styles.detailLabel}>Average Difficulty:</Text>
          <Text style={styles.detailValue}>{formatNumber(averageDifficulty)}/10</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={16} color="#777" />
          <Text style={styles.infoText}>
            Practice new content to increase your difficulty level. Harder exercises will unlock as you improve.
          </Text>
        </View>
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Learning Metrics Explained</Text>
              <TouchableOpacity 
                onPress={() => setShowInfoModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.explanationContainer}>
              <View style={styles.explanationItem}>
                <View style={styles.explanationHeader}>
                  <Ionicons name="school" size={20} color="#4f86f7" />
                  <Text style={styles.explanationTitle}>Learning Level</Text>
                </View>
                <Text style={styles.explanationText}>
                  Your current skill level (1-10). This increases when you answer correctly and decreases when you struggle. It determines the difficulty of new practice questions.
                </Text>
              </View>

              <View style={styles.explanationItem}>
                <View style={styles.explanationHeader}>
                  <Ionicons name="trending-up" size={20} color="#4f86f7" />
                  <Text style={styles.explanationTitle}>Complexity Level</Text>
                </View>
                <Text style={styles.explanationText}>
                  How complex the language structures are (1-10). This tracks your mastery of advanced grammar, vocabulary, and sentence patterns. Resets when you reach mastery.
                </Text>
              </View>

              <View style={styles.explanationItem}>
                <View style={styles.explanationHeader}>
                  <Ionicons name="analytics" size={20} color="#4f86f7" />
                  <Text style={styles.explanationTitle}>Average Difficulty</Text>
                </View>
                <Text style={styles.explanationText}>
                  The average difficulty of all practice questions you've completed. This shows your historical performance and learning progress over time.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoIconContainer: {
    padding: 4,
  },
  levelContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  mainLevelDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  levelValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  levelScale: {
    fontSize: 20,
    fontWeight: '500',
    color: '#777',
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 4,
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#777',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  explanationContainer: {
    flex: 1,
  },
  explanationItem: {
    marginBottom: 12,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#555',
  },
}); 