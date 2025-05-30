import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={80} color="#4f86f7" />
        </View>
        
        <Text style={styles.title}>Learning Community</Text>
        
        <Text style={styles.subtitle}>
          Connect with fellow learners, share your progress, and learn together!
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles" size={24} color="#4f86f7" />
            <Text style={styles.featureText}>Discussion Forums</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="trophy" size={24} color="#4f86f7" />
            <Text style={styles.featureText}>Leaderboards</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="people-circle" size={24} color="#4f86f7" />
            <Text style={styles.featureText}>Study Groups</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="share-social" size={24} color="#4f86f7" />
            <Text style={styles.featureText}>Progress Sharing</Text>
          </View>
        </View>
        
        <View style={styles.comingSoonContainer}>
          <Ionicons name="time" size={32} color="#ff9500" />
          <Text style={styles.comingSoonText}>Coming Soon!</Text>
          <Text style={styles.comingSoonSubtext}>
            We're working hard to bring you an amazing community experience. Stay tuned!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  comingSoonContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff9500',
    marginTop: 8,
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
