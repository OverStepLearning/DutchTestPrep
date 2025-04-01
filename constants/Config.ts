/**
 * Application configuration
 */

// Import environment variables (Expo loads .env automatically)
// Base Heroku URL without deployment-specific ID
const BASE_HEROKU_URL = process.env.EXPO_PUBLIC_BASE_HEROKU_URL || 'https://desirabledifficult-api';
// Current deployment ID - from environment variable with fallback
const DEPLOYMENT_ID = process.env.EXPO_PUBLIC_DEPLOYMENT_ID || '283b86ef9cd3';
// Full Heroku URL
const HEROKU_URL = `${BASE_HEROKU_URL}${DEPLOYMENT_ID ? `-${DEPLOYMENT_ID}` : ''}.herokuapp.com`;
// Local development URL
const LOCAL_URL = process.env.EXPO_PUBLIC_LOCAL_URL || 'http://localhost:3000';

export default {
  // API URL - conditionally selects between development and production
  API_URL: process.env.NODE_ENV === 'production' 
    ? HEROKU_URL
    : LOCAL_URL,
  
  // AI Provider endpoints
  AI_PROVIDERS: {
    GPT4O: {
      API_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
      MODEL_NAME: 'gpt-4o'
    },
    DEEPSEEK: {
      API_ENDPOINT: 'https://api.deepseek.com/v1/chat/completions',
      MODEL_NAME: 'deepseek-chat'
    }
  },
  
  // Network profiles for different environments
  NETWORK_PROFILES: {
    LOCALHOST: LOCAL_URL,
    PROD: HEROKU_URL
  },
  
  // Default timeout for API requests (in milliseconds)
  API_TIMEOUT: 30000, // Increased timeout for slower connections
  
  // App version
  VERSION: '0.1.0',
  // Build number
  buildNumber: '1',
  
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'desirabledifficult_auth_token',
    USER_DATA: 'desirabledifficult_user_data',
    THEME: 'desirabledifficult_theme',
    ACTIVE_NETWORK: 'desirabledifficult_active_network'
  }
}; 