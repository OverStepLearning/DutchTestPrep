/**
 * Validation utility functions for forms and user input
 */

/**
 * Validates an email address format
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
    if (!email || !email.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Checks if a password meets minimum requirements
   * @param password The password to validate
   * @param minLength Minimum required length (default: 6)
   * @returns True if the password meets requirements, false otherwise
   */
  export const validatePassword = (password: string, minLength = 6): boolean => {
    if (!password) return false;
    return password.length >= minLength;
  };
  
  /**
   * Checks if a field has a value
   * @param value The value to check
   * @returns True if the value is not empty, false otherwise
   */
  export const isNotEmpty = (value: string): boolean => {
    return Boolean(value && value.trim());
  };
  
  /**
   * Validates that all required fields have values
   * @param fields Object containing field values
   * @returns True if all fields have values, false otherwise
   */
  export const validateRequiredFields = (fields: Record<string, string>): boolean => {
    return Object.values(fields).every(value => isNotEmpty(value));
  };

/**
 * Utility functions for displaying notifications and alerts to users
 */

import { Alert, AlertButton } from 'react-native';

/**
 * Display an error message to the user
 * @param title The error title
 * @param message The error message
 * @param buttons Optional custom buttons (defaults to OK)
 */
export const showError = (
  title: string, 
  message: string, 
  buttons?: AlertButton[]
): void => {
  Alert.alert(
    title,
    message,
    buttons || [{ text: 'OK' }]
  );
};

/**
 * Display a success message to the user
 * @param title The success title
 * @param message The success message
 */
export const showSuccess = (
  title: string, 
  message: string
): void => {
  Alert.alert(
    title,
    message,
    [{ text: 'OK' }]
  );
};

/**
 * Display a confirmation dialog to the user
 * @param title The confirmation title
 * @param message The confirmation message
 * @param onConfirm Function to call when user confirms
 * @param onCancel Optional function to call when user cancels
 */
export const showConfirmation = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel
      },
      {
        text: 'Confirm',
        onPress: onConfirm
      }
    ]
  );
};