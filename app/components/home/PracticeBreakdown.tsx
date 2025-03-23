import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PracticeBreakdownProps {
  vocabulary: number;
  grammar: number;
  conversation: number;
  total: number;
}

export const PracticeBreakdown: React.FC<PracticeBreakdownProps> = ({
  vocabulary,
  grammar,
  conversation,
  total
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Practice Breakdown</Text>
      <View style={styles.breakdownContainer}>
        {/* Visual representation of practice types */}
        <View style={styles.breakdownChart}>
          <View 
            style={[
              styles.breakdownBar, 
              styles.vocabularyBar,
              { flex: vocabulary / total }
            ]} 
          />
          <View 
            style={[
              styles.breakdownBar, 
              styles.grammarBar,
              { flex: grammar / total }
            ]} 
          />
          <View 
            style={[
              styles.breakdownBar, 
              styles.conversationBar,
              { flex: conversation / total }
            ]} 
          />
        </View>
        
        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, styles.vocabularyBar]} />
            <Text style={styles.legendText}>Vocabulary ({vocabulary})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, styles.grammarBar]} />
            <Text style={styles.legendText}>Grammar ({grammar})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, styles.conversationBar]} />
            <Text style={styles.legendText}>Conversation ({conversation})</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  breakdownContainer: {
    marginTop: 10,
  },
  breakdownChart: {
    height: 30,
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  breakdownBar: {
    height: '100%',
  },
  vocabularyBar: {
    backgroundColor: '#4f86f7',
  },
  grammarBar: {
    backgroundColor: '#f7924f',
  },
  conversationBar: {
    backgroundColor: '#4fc1f7',
  },
  legendContainer: {
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#555',
  },
}); 