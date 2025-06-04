import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail, validatePassword, isNotEmpty } from '@/app/utils/validationUtils';

interface RegisterInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  invitationCode: string;
}

interface UseRegisterReturn {
  inputs: RegisterInputs;
  setInputs: (inputs: Partial<RegisterInputs>) => void;
  isLoading: boolean;
  error: string | null;
  handleRegister: () => Promise<void>;
  validateForm: () => boolean;
}

export function useRegister(): UseRegisterReturn {
  const [inputs, setInputsState] = useState<RegisterInputs>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    invitationCode: '',
  });
  
  const { register, isLoading, error, clearError } = useAuth();

  // Function to update inputs state
  const setInputs = (newInputs: Partial<RegisterInputs>) => {
    setInputsState(prev => ({ ...prev, ...newInputs }));
  };

  // NOTE: Removed the error alert from here since AuthContext already handles registration errors
  // This prevents duplicate error popups

  // Validate form inputs
  const validateForm = (): boolean => {
    const { name, email, password, confirmPassword, invitationCode } = inputs;
    
    // Check for empty fields
    if (!isNotEmpty(name) || !isNotEmpty(email) || !isNotEmpty(password) || !isNotEmpty(confirmPassword) || !isNotEmpty(invitationCode)) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    // Email validation
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // Check password strength
    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  // Handle register submission
  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;

    try {
      const { name, email, password, invitationCode } = inputs;
      // Now sending invitation code to backend for validation
      await register(name, email, password, invitationCode);
      // If successful, the auth context will handle navigation
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return {
    inputs,
    setInputs,
    isLoading,
    error,
    handleRegister,
    validateForm
  };
} 