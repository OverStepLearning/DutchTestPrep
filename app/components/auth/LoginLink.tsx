import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export function LoginLink() {
  return (
    <View style={styles.loginContainer}>
      <Text style={styles.loginText}>Already have an account? </Text>
      <Link href="/login" asChild>
        <TouchableOpacity>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#6c757d',
    fontSize: 14,
  },
  loginLink: {
    color: '#4f86f7',
    fontSize: 14,
    fontWeight: '600',
  },
}); 