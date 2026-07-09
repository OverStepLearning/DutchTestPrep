import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function SubscriptionCard() {
  const { isLoading, isPro, priceLabel, refreshSubscription } = useSubscription();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name={isPro ? 'sparkles' : 'lock-open'} size={22} color="#318F65" />
          <Text style={styles.title}>{isPro ? 'Overstep Pro' : 'Free Plan'}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#318F65" />
        ) : (
          <TouchableOpacity onPress={refreshSubscription} style={styles.iconButton}>
            <Ionicons name="refresh" size={18} color="#318F65" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.description}>
        {isPro
          ? 'Your Pro access is active. You have 100 practices per day.'
          : `Free accounts include 10 practices per day. Pro is ${priceLabel}.`}
      </Text>

      {!isPro && (
        <TouchableOpacity style={styles.upgradeButton} onPress={() => router.push('/paywall')}>
          <Ionicons name="arrow-up-circle" size={20} color="#212121" />
          <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#318F65',
    marginLeft: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F4EC',
  },
  description: {
    fontSize: 15,
    color: '#212121',
    lineHeight: 22,
    marginBottom: 14,
  },
  upgradeButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F6C83F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  upgradeButtonText: {
    color: '#212121',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
});
