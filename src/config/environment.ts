import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Determine which environment we're running in
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Log environment variables for debugging
console.log('Environment:', NODE_ENV);
console.log('Available database URLs:',
  process.env.PROD_DATABASE_URL ? 'PROD_DATABASE_URL✓' : 'PROD_DATABASE_URL✗',
  process.env.MONGODB_URI ? 'MONGODB_URI✓' : 'MONGODB_URI✗',
  process.env.DATABASE_URL ? 'DATABASE_URL✓' : 'DATABASE_URL✗',
  process.env.DEV_DATABASE_URL ? 'DEV_DATABASE_URL✓' : 'DEV_DATABASE_URL✗'
);

// Configuration object with environment-specific values
const config = {
  env: NODE_ENV,
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Database - try multiple possible env var names
  databaseUrl: isProd 
    ? process.env.PROD_DATABASE_URL || process.env.MONGODB_URI || process.env.DATABASE_URL
    : process.env.DEV_DATABASE_URL || process.env.DATABASE_URL || 'mongodb://localhost:27017/mydatabase',
  
  // JWT - try multiple possible env var names
  jwtSecret: isProd 
    ? process.env.PROD_JWT_SECRET || process.env.JWT_SECRET 
    : process.env.DEV_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret-key',
  
  // OpenAI - try multiple possible env var names
  openaiApiKey: isProd 
    ? process.env.PROD_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    : process.env.DEV_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    
  // AI Provider selection
  aiProvider: process.env.AI_PROVIDER || 'openai',
    
  // Additional configuration can be added here following the same pattern
};

// Validation to ensure critical values are provided
const validateConfig = () => {
  const requiredValues = [
    'databaseUrl', 
    'jwtSecret', 
    'openaiApiKey'
  ];
  
  const missingValues = requiredValues.filter(key => !config[key as keyof typeof config]);
  
  if (missingValues.length > 0) {
    console.error('Missing required environment variables:', missingValues);
    console.error('Current config values:');
    for (const key of requiredValues) {
      console.error(`${key}:`, config[key as keyof typeof config] ? '[SET]' : '[MISSING]');
    }
    
    // In production, throw an error; in development, use defaults
    if (isProd) {
      throw new Error(`Missing required environment variables: ${missingValues.join(', ')}`);
    } else {
      console.warn('Using default values for missing environment variables');
    }
  }
};

// Run validation
validateConfig();

export default config; 