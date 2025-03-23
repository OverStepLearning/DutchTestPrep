import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { NetworkItem } from '@/app/hooks/useLogin';
import { useLoginContext } from './LoginProvider';

interface NetworkSelectorProps {
  className?: string;
}

export function NetworkSelector({ className }: NetworkSelectorProps) {
  const { 
    activeNetwork, 
    networkProfiles, 
    showNetworkModal, 
    setShowNetworkModal,
    testingConnection,
    testConnection,
    setNetwork,
    getApiUrl
  } = useLoginContext();

  return (
    <View style={styles.container}>
      {/* Network selector modal */}
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

      {/* Test connection button */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    alignItems: 'center',
  },
  testButton: {
    marginTop: 20,
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
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
    width: '100%',
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