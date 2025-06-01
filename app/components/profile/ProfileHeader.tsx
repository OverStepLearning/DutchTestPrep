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

  // Get random background color for user status (same logic as home tab)
  const getUserStatusColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
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
    color: 'white',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
}); 