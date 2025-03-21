import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Alert,
  Switch,
  Modal,
  FlatList,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Config from '@/constants/Config';
import { storage } from '@/utils/storage';

// Define network profile types
type NetworkProfile = 'OFFICE' | 'HOME' | 'LOCALHOST' | 'PROD';

// Define network item for list
interface NetworkItem {
  id: NetworkProfile;
  name: string;
  url: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();
  const [testingConnection, setTestingConnection] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState<NetworkProfile>('LOCALHOST');
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const router = useRouter();
  
  // Get available network profiles
  const networkProfiles: NetworkItem[] = Object.entries(Config.NETWORK_PROFILES).map(([key, url]) => ({
    id: key as NetworkProfile,
    name: key,
    url: url as string
  }));
  
  // Get the active API URL
  const getApiUrl = () => {
    return Config.NETWORK_PROFILES[activeNetwork] || Config.API_URL;
  };

  // Set active network and save preference
  const setNetwork = async (networkKey: NetworkProfile) => {
    setActiveNetwork(networkKey);
    
    // Save preference
    await storage.setItem(Config.STORAGE_KEYS.ACTIVE_NETWORK, networkKey);
    
    // Close modal
    setShowNetworkModal(false);
    
    // Alert the user
    Alert.alert(
      'Network Changed', 
      `Using ${networkKey} network: ${Config.NETWORK_PROFILES[networkKey]}`
    );
  };
  
  // Load network preference
  React.useEffect(() => {
    const loadNetworkPreference = async () => {
      const savedNetwork = await storage.getItem(Config.STORAGE_KEYS.ACTIVE_NETWORK);
      if (savedNetwork && Object.keys(Config.NETWORK_PROFILES).includes(savedNetwork)) {
        setActiveNetwork(savedNetwork as NetworkProfile);
      }
    };
    
    loadNetworkPreference();
  }, []);

  // Handle login button press
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      // Use the active API URL
      await login(email, password, getApiUrl());
      // If successful, the auth context will update and redirect
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // Test connection to the backend
  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Use the active API URL
      const apiUrl = getApiUrl();
      console.log(`Testing connection to: ${apiUrl}`);
      
      const response = await axios.get(`${apiUrl}/health`, {
        timeout: 5000
      });
      
      Alert.alert(
        'Connection Status', 
        `Connected to server successfully!\n\nServer status: ${response.data.status}\nMongoDB: ${response.data.mongodb}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Connection test error:', error);
      
      let errorMessage = 'Could not connect to server. ';
      
      if (error.response) {
        errorMessage += `Server responded with status ${error.response.status}.`;
      } else if (error.request) {
        errorMessage += 'No response received from server. Check your network connection and server status.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      Alert.alert('Connection Failed', errorMessage, [
        { text: 'OK' },
        { 
          text: 'Change Network', 
          onPress: () => setShowNetworkModal(true)
        }
      ]);
    } finally {
      setTestingConnection(false);
    }
  };

  // Show error alert if authentication fails
  React.useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  // Network selector modal
  const NetworkModal = () => (
    <Modal
      visible={showNetworkModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowNetworkModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Network Environment</Text>
          
          <FlatList
            data={networkProfiles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.networkItem,
                  activeNetwork === item.id && styles.activeNetworkItem
                ]}
                onPress={() => setNetwork(item.id)}
              >
                <Text 
                  style={[
                    styles.networkItemText,
                    activeNetwork === item.id && styles.activeNetworkItemText
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.networkItemUrl}>{item.url}</Text>
              </TouchableOpacity>
            )}
            style={styles.networkList}
          />
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowNetworkModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      <NetworkModal />
      
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>DesirableDifficult</Text>
        <Text style={styles.tagline}>Prepare for your Dutch exam with AI</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>
        
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.loginButton, { marginTop: 10, backgroundColor: '#28a745' }]}
          onPress={() => login('test@example.com', 'password123', getApiUrl())}
        >
          <Text style={styles.loginButtonText}>Quick Dev Login</Text>
        </TouchableOpacity>
        
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        {/* Connection test button */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={testConnection}
          disabled={testingConnection}
        >
          {testingConnection ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.testButtonText}>Test Server Connection</Text>
          )}
        </TouchableOpacity>
        
        {/* Network selector button */}
        <TouchableOpacity 
          style={styles.networkButton}
          onPress={() => setShowNetworkModal(true)}
        >
          <Text style={styles.networkButtonText}>
            Network: {activeNetwork}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.apiUrlText}>
          API URL: {getApiUrl()}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4f86f7',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#495057',
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 24,
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ced4da',
    marginBottom: 16,
  },
  loginButton: {
    height: 50,
    backgroundColor: '#4f86f7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#6c757d',
    fontSize: 14,
  },
  signupLink: {
    color: '#4f86f7',
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 6,
    marginTop: 8,
  },
  testButton: {
    marginTop: 20,
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  networkButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    alignItems: 'center',
  },
  networkButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  networkList: {
    width: '100%',
    maxHeight: 300,
  },
  networkItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    width: '100%',
  },
  activeNetworkItem: {
    backgroundColor: '#e9f7fe',
  },
  networkItemText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  activeNetworkItemText: {
    color: '#0366d6',
    fontWeight: 'bold',
  },
  networkItemUrl: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#212529',
  },
  apiUrlText: {
    marginTop: 5,
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
}); 