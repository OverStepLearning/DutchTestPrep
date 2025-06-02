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
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - primary brand color
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#5CA480', // Overstep Green - secondary text
    textAlign: 'center',
  },
}); 