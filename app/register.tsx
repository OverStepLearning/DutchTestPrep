import React from 'react';
import { 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthLogo } from '@/app/components/auth/AuthLogo';
import { RegisterForm } from '@/app/components/auth/RegisterForm';
import { LoginLink } from '@/app/components/auth/LoginLink';

export default function RegisterScreen() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AuthLogo tagline="Create your account" />
        
        <RegisterForm />
        
        <LoginLink />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
}); 