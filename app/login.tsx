import React from 'react';
import { 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthLogo } from '@/app/components/auth/AuthLogo';
import { LoginForm } from '@/app/components/auth/LoginForm';
import { RegisterLink } from '@/app/components/auth/RegisterLink';
import { NetworkSelector } from '@/app/components/auth/NetworkSelector';
import { LoginProvider } from '@/app/components/auth/LoginProvider';

export default function LoginScreen() {
  return (
    <LoginProvider>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style="dark" />
        
        <AuthLogo tagline="Prepare for your Dutch exam with AI" />
        
        <LoginForm />
        
        <RegisterLink />
        
        <View style={styles.networkSelectorContainer}>
          <NetworkSelector />
        </View>
      </KeyboardAvoidingView>
    </LoginProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  networkSelectorContainer: {
    paddingHorizontal: 30,
  }
}); 