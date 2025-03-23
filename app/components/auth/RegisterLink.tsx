import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export function RegisterLink() {
  return (
    <View style={styles.signupContainer}>
      <Text style={styles.signupText}>Don't have an account? </Text>
      <Link href="/register" asChild>
        <TouchableOpacity>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#6c757d',
    fontSize: 14,
  },
  signupLink: {
    color: '#4f86f7',
    fontSize: 14,
    fontWeight: '600',
  },
}); 