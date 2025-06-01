import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileHeaderProps {
  name: string;
  email: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, email }) => {
  // Get user initials for status (same logic as home tab)
  const getUserInitials = () => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get random background color for user status (updated to green palette)
  const getUserStatusColor = () => {
    const colors = ['#318F65', '#5CA480', '#2E8B57', '#3CB371', '#20B2AA', '#008B8B', '#4682B4', '#5F9EA0'];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <View style={styles.header}>
      <View style={[styles.avatarContainer, { backgroundColor: getUserStatusColor() }]}>
        <Text style={styles.avatarText}>
          {getUserInitials()}
        </Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF', // Snow - card surface
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF', // Snow - text on colored background
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#318F65', // Forest Verdant - heading
  },
  email: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - secondary text
    fontWeight: '500',
  },
}); 