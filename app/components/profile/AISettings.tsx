import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAIProvider, AIProviderType } from '@/contexts/AIProviderContext';

export const AISettings = () => {
  const { 
    currentProvider, 
    setAIProvider, 
    isDeepSeekAvailable, 
    deepseekApiKey,
    setDeepseekApiKey 
  } = useAIProvider();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(currentProvider);

  // Initialize the state when the component mounts
  useEffect(() => {
    if (deepseekApiKey) {
      // Mask the API key for display, only showing the first 5 characters
      setApiKey(deepseekApiKey.substring(0, 5) + '•••••••••••••••••••••');
    }
  }, [deepseekApiKey]);

  // Handle API key change
  const handleSaveApiKey = async () => {
    // If API key is masked (unchanged), don't update
    if (apiKey.includes('•')) return;
    
    await setDeepseekApiKey(apiKey);
    setModalVisible(false);
  };

  // Handle provider change
  const handleProviderChange = async (provider: AIProviderType) => {
    setSelectedProvider(provider);
    await setAIProvider(provider);
  };

  // Reset the form when modal is closed
  const handleCloseModal = () => {
    // Reset to the masked key if one exists
    if (deepseekApiKey) {
      setApiKey(deepseekApiKey.substring(0, 5) + '•••••••••••••••••••••');
    } else {
      setApiKey('');
    }
    setModalVisible(false);
  };

  // Initialize with DeepSeek API key from user's input
  const handleAddKey = () => {
    setApiKey('');
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={22} color="#4f86f7" />
        <Text style={styles.title}>AI Model Settings</Text>
      </View>

      <View style={styles.optionsContainer}>
        <View style={styles.option}>
          <Text style={styles.optionLabel}>GPT-4o</Text>
          <Switch
            trackColor={{ false: '#ccc', true: '#bcd9ff' }}
            thumbColor={currentProvider === 'gpt4o' ? '#4f86f7' : '#f4f3f4'}
            ios_backgroundColor="#ccc"
            onValueChange={() => handleProviderChange('gpt4o')}
            value={currentProvider === 'gpt4o'}
          />
        </View>

        <View style={styles.option}>
          <Text style={styles.optionLabel}>
            DeepSeek
            {!isDeepSeekAvailable && (
              <Text style={styles.warningText}> (API Key Required)</Text>
            )}
          </Text>
          <Switch
            trackColor={{ false: '#ccc', true: '#bcd9ff' }}
            thumbColor={currentProvider === 'deepseek' ? '#4f86f7' : '#f4f3f4'}
            ios_backgroundColor="#ccc"
            onValueChange={() => handleProviderChange('deepseek')}
            value={currentProvider === 'deepseek'}
            disabled={!isDeepSeekAvailable}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.apiKeyButton}
        onPress={handleAddKey}
      >
        <Text style={styles.apiKeyButtonText}>
          {isDeepSeekAvailable ? 'Update DeepSeek API Key' : 'Add DeepSeek API Key'}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>DeepSeek API Key</Text>
            
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your DeepSeek API key"
              secureTextEntry={false}
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveApiKey}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
  },
  apiKeyButton: {
    backgroundColor: '#4f86f7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  apiKeyButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  warningText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4f86f7',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
}); 