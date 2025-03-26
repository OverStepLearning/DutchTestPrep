import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';

interface AdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
  visible,
  onClose,
  onConfirm
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Adjustment Mode</Text>
          <Text style={styles.modalMessage}>
            Would you like to enter difficulty adjustment mode? This will calibrate the difficulty level to better match your skills.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={onConfirm}
            >
              <Text style={styles.buttonText}>Yes, Enter Adjustment Mode</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: '#333' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  button: {
    backgroundColor: '#4f86f7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  }
});

export default AdjustmentModal; 