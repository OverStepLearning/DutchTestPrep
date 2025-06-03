import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface AuthLogoProps {
  tagline?: string;
}

export function AuthLogo({ tagline = "Welcome back" }: AuthLogoProps) {
  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>Overstep</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - primary brand color
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#5CA480', // Overstep Green - secondary text
    textAlign: 'center',
  },
}); 