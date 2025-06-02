import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import { useLoginContext } from './LoginProvider';

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const { 
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleLogin
  } = useLoginContext();

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Login</Text>
      
      <Text style={styles.inputLabel}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#318F65', // Forest Verdant - heading
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5CA480', // Overstep Green - label text
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF', // Snow - input background
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E6F4EC', // Mint Foam - border
    marginBottom: 16,
  },
  loginButton: {
    height: 50,
    backgroundColor: '#318F65', // Forest Verdant - primary button
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF', // Snow - button text
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 