import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  View,
  Text,
  Image,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthLogo } from '@/app/components/auth/AuthLogo';
import { LoginForm } from '@/app/components/auth/LoginForm';
import { RegisterLink } from '@/app/components/auth/RegisterLink';
import { LoginProvider } from '@/app/components/auth/LoginProvider';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const { reason } = useLocalSearchParams();
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  
  // Show session expired message if redirected with reason=session_expired
  useEffect(() => {
    if (reason === 'session_expired') {
      setShowSessionExpired(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowSessionExpired(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [reason]);

  return (
    <LoginProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        {showSessionExpired && (
          <View style={styles.sessionExpiredBanner}>
            <Text style={styles.sessionExpiredText}>
              Your session has expired. Please log in again.
            </Text>
          </View>
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.topSection}>
            <AuthLogo tagline="Master your learning with AI" />
            <View style={styles.mascotContainer}>
              <Image 
                source={require('../assets/images/mascot.png')} 
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>
          </View>
          
          <View style={styles.formSection}>
            <LoginForm />
            <RegisterLink />
          </View>
        </KeyboardAvoidingView>
      </View>
    </LoginProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4EC', // Mint Foam - light background
  },
  sessionExpiredBanner: {
    backgroundColor: '#d9534f',
    padding: 12,
    width: '100%',
  },
  sessionExpiredText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  topSection: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  mascotContainer: {
    width: 140,
    height: 140,
    marginTop: 15,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  formSection: {
    backgroundColor: '#FFFFFF', // Snow - card surface
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 30,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default LoginScreen; 