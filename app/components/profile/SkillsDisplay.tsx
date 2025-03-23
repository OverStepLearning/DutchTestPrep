import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserProfile } from '../../types/profile';

interface SkillsDisplayProps {
  skillLevels: UserProfile['progress']['skillLevels'];
}

export const SkillsDisplay: React.FC<SkillsDisplayProps> = ({ skillLevels }) => {
  // Render skill level bar
  const renderSkillLevel = (label: string, level: number) => {
    return (
      <View style={styles.skillContainer} key={label}>
        <Text style={styles.skillLabel}>{label}</Text>
        <View style={styles.skillBarContainer}>
          <View style={[styles.skillBar, { width: `${level * 10}%` }]} />
        </View>
        <Text style={styles.skillLevel}>{level}/10</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skill Levels</Text>
      {renderSkillLevel('Vocabulary', skillLevels?.vocabulary || 1)}
      {renderSkillLevel('Grammar', skillLevels?.grammar || 1)}
      {renderSkillLevel('Conversation', skillLevels?.conversation || 1)}
      {renderSkillLevel('Reading', skillLevels?.reading || 1)}
      {renderSkillLevel('Listening', skillLevels?.listening || 1)}
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  skillContainer: {
    marginBottom: 12,
  },
  skillLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  skillBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 2,
  },
  skillBar: {
    height: '100%',
    backgroundColor: '#4f86f7',
    borderRadius: 4,
  },
  skillLevel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  }
}); 