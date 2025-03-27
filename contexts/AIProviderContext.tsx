import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { storage } from '../utils/storage';

// Define AI provider types
export type AIProviderType = 'gpt4o' | 'deepseek';

interface AIProviderContextType {
  currentProvider: AIProviderType;
  setAIProvider: (provider: AIProviderType) => Promise<void>;
  isDeepSeekAvailable: boolean;
  deepseekApiKey: string | null;
  setDeepseekApiKey: (key: string) => Promise<void>;
}

// Create context with default values
const AIProviderContext = createContext<AIProviderContextType>({
  currentProvider: 'gpt4o',
  setAIProvider: async () => {},
  isDeepSeekAvailable: false,
  deepseekApiKey: null,
  setDeepseekApiKey: async () => {},
});

// Storage keys
const AI_PROVIDER_KEY = 'desirabledifficult_ai_provider';
const DEEPSEEK_API_KEY = 'desirabledifficult_deepseek_key';

// Provider component
interface AIProviderProps {
  children: ReactNode;
}

export const AIProviderProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [currentProvider, setCurrentProvider] = useState<AIProviderType>('gpt4o');
  const [deepseekApiKey, setDeepseekKey] = useState<string | null>(null);
  const [isDeepSeekAvailable, setIsDeepSeekAvailable] = useState<boolean>(false);

  // Load saved provider on mount
  useEffect(() => {
    const loadSavedProvider = async () => {
      try {
        const savedProvider = await storage.getItem(AI_PROVIDER_KEY);
        if (savedProvider && (savedProvider === 'gpt4o' || savedProvider === 'deepseek')) {
          setCurrentProvider(savedProvider as AIProviderType);
        }

        const savedKey = await storage.getItem(DEEPSEEK_API_KEY);
        if (savedKey) {
          setDeepseekKey(savedKey);
          setIsDeepSeekAvailable(true);
        }
      } catch (error) {
        console.error('Error loading AI provider settings:', error);
      }
    };

    loadSavedProvider();
  }, []);

  // Function to set and save provider
  const setAIProvider = async (provider: AIProviderType): Promise<void> => {
    try {
      // If trying to set to DeepSeek but no key available
      if (provider === 'deepseek' && !deepseekApiKey) {
        Alert.alert(
          'API Key Required',
          'Please set your DeepSeek API key in settings before switching to DeepSeek.',
          [{ text: 'OK' }]
        );
        return;
      }

      setCurrentProvider(provider);
      await storage.setItem(AI_PROVIDER_KEY, provider);
      
      Alert.alert(
        'AI Provider Changed',
        `AI provider switched to ${provider === 'gpt4o' ? 'GPT-4o' : 'DeepSeek'}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving AI provider:', error);
      Alert.alert('Error', 'Failed to change AI provider.');
    }
  };

  // Function to save DeepSeek API key
  const setDeepseekApiKey = async (key: string): Promise<void> => {
    try {
      if (!key || key.trim() === '') {
        Alert.alert('Invalid Key', 'Please enter a valid API key.');
        return;
      }

      await storage.setItem(DEEPSEEK_API_KEY, key);
      setDeepseekKey(key);
      setIsDeepSeekAvailable(true);
      
      Alert.alert(
        'API Key Saved',
        'DeepSeek API key has been saved successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving DeepSeek API key:', error);
      Alert.alert('Error', 'Failed to save API key.');
    }
  };

  return (
    <AIProviderContext.Provider
      value={{
        currentProvider,
        setAIProvider,
        isDeepSeekAvailable,
        deepseekApiKey,
        setDeepseekApiKey,
      }}
    >
      {children}
    </AIProviderContext.Provider>
  );
};

// Custom hook to use the AI provider context
export const useAIProvider = () => useContext(AIProviderContext); 