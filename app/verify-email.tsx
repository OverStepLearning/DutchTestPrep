import React, { useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { AuthLogo } from '@/app/components/auth/AuthLogo';
import { useAuth } from '@/contexts/AuthContext';

const VerifyEmailScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyEmail, resendVerification, isLoading, error, clearError } = useAuth();
  const [code, setCode] = useState('');
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (code.trim().length !== 6) return;
    clearError();
    await verifyEmail(String(email || ''), code.trim());
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification(String(email || ''));
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.topSection}>
          <AuthLogo tagline="Master your learning with AI" />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
            placeholder="000000"
            placeholderTextColor="#bbb"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            testID="verification-code-input"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.verifyButton, (code.length !== 6 || isLoading) && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={code.length !== 6 || isLoading}
            testID="verify-button"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendHint}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={[styles.resendLink, resending && styles.resendLinkDisabled]}>
                {resending ? 'Sending...' : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/login')}>
            <Text style={styles.backLinkText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4EC', // Mint Foam - light background
  },
  topSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  formSection: {
    flex: 0.6,
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#318F65',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#333',
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    fontSize: 28,
    letterSpacing: 12,
    textAlign: 'center',
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  errorText: {
    color: '#d9534f',
    marginBottom: 12,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#318F65',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resendHint: {
    color: '#666',
    fontSize: 14,
  },
  resendLink: {
    color: '#318F65',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    color: '#666',
    fontSize: 14,
  },
});

export default VerifyEmailScreen;
