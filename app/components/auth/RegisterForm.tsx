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
      
      <Text style={styles.inputLabel}>Invitation Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your invitation code"
        value={inputs.invitationCode}
        onChangeText={(text) => setInputs({ invitationCode: text })}
        autoCapitalize="characters"
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
  registerButton: {
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
  registerButtonText: {
    color: '#FFFFFF', // Snow - button text
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 