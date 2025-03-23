import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface AuthLogoProps {
  tagline?: string;
}

export function AuthLogo({ tagline = "Welcome back" }: AuthLogoProps) {
  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>Dutch Test Prep</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4f86f7',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#495057',
  },
}); 