import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import { useRegister } from '@/app/hooks/useRegister';

interface RegisterFormProps {
  className?: string; // For potential style overrides
}

export function RegisterForm({ className }: RegisterFormProps) {
  const { 
    inputs, 
    setInputs, 
    isLoading, 
    handleRegister 
  } = useRegister();

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Sign Up</Text>
      
      <Text style={styles.inputLabel}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={inputs.name}
        onChangeText={(text) => setInputs({ name: text })}
        autoCorrect={false}
      />
      
      <Text style={styles.inputLabel}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        value={inputs.email}
        onChangeText={(text) => setInputs({ email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a password (min. 6 characters)"
        value={inputs.password}
        onChangeText={(text) => setInputs({ password: text })}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <Text style={styles.inputLabel}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Re-enter your password"
        value={inputs.confirmPassword}
        onChangeText={(text) => setInputs({ confirmPassword: text })}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.registerButtonText}>Create Account</Text>
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
    color: '#212529',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ced4da',
    marginBottom: 16,
  },
  registerButton: {
    height: 50,
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 