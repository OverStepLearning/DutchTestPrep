/**
 * Application configuration
 */
export default {
  // API URL - conditionally selects between development and production
  API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://desirabledifficult-api.herokuapp.com' 
    : 'http://localhost:3000',
  
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
    LOCALHOST: 'http://localhost:3000',
    PROD: 'https://desirabledifficult-api.herokuapp.com'
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