/**
 * Application configuration
 */
export default {
  // API URL - change this to your backend API URL
  API_URL: 'http://192.168.2.8:3000',
  
  // Default timeout for API requests (in milliseconds)
  API_TIMEOUT: 10000,
  
  // App version
  VERSION: '0.1.0',
  
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'dutch_app_auth_token',
    USER_DATA: 'dutch_app_user_data',
    THEME: 'dutch_app_theme',
  }
}; 