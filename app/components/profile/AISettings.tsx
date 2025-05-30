import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAIProvider, AIProviderType } from '@/contexts/AIProviderContext';

export default function AISettings() {
  const { currentProvider, setAIProvider } = useAIProvider();
  const [isLoading, setIsLoading] = useState(false);

  const handleProviderSwitch = async (provider: AIProviderType) => {
    if (provider === currentProvider) return;
    
    setIsLoading(true);
    try {
      await setAIProvider(provider);
    } catch (error) {
      const providerName = provider === 'gpt4o' ? 'GPT-4o' : 
                          provider === 'deepseek' ? 'DeepSeek' : 'Gemini';
      Alert.alert(
        'Error',
        `Failed to switch to ${providerName} AI`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Settings</Text>
      
      <View style={styles.providerSection}>
        <Text style={styles.sectionTitle}>AI Provider</Text>
        <View style={styles.providerButtons}>
          <TouchableOpacity
            style={[
              styles.providerButton,
              currentProvider === 'gpt4o' && styles.activeProviderButton
            ]}
            onPress={() => handleProviderSwitch('gpt4o')}
            disabled={isLoading}
          >
            <Ionicons
              name="hardware-chip"
              size={24}
              color={currentProvider === 'gpt4o' ? '#fff' : '#666'}
            />
            <Text style={[
              styles.providerButtonText,
              currentProvider === 'gpt4o' && styles.activeProviderButtonText
            ]}>
              GPT-4o
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.providerButton,
              currentProvider === 'deepseek' && styles.activeProviderButton
            ]}
            onPress={() => handleProviderSwitch('deepseek')}
            disabled={isLoading}
          >
            <Ionicons
              name="analytics"
              size={24}
              color={currentProvider === 'deepseek' ? '#fff' : '#666'}
            />
            <Text style={[
              styles.providerButtonText,
              currentProvider === 'deepseek' && styles.activeProviderButtonText
            ]}>
              DeepSeek
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.providerButton,
              currentProvider === 'gemini' && styles.activeProviderButton
            ]}
            onPress={() => handleProviderSwitch('gemini')}
            disabled={isLoading}
          >
            <Ionicons
              name="logo-google"
              size={24}
              color={currentProvider === 'gemini' ? '#fff' : '#666'}
            />
            <Text style={[
              styles.providerButtonText,
              currentProvider === 'gemini' && styles.activeProviderButtonText
            ]}>
              Gemini
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  providerSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666',
  },
  providerButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  providerButton: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  activeProviderButton: {
    backgroundColor: '#007AFF',
  },
  providerButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeProviderButtonText: {
    color: '#fff',
  },
}); 