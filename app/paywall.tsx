import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function PaywallScreen() {
  const {
    isLoading,
    isPurchasing,
    isPro,
    priceLabel,
    error,
    purchasePro,
    restorePurchases,
    refreshSubscription,
  } = useSubscription();

  const handlePurchase = async () => {
    const active = await purchasePro();
    if (active) {
      Alert.alert('Welcome to Pro', 'Your Pro plan is active.', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)/practice') },
      ]);
    }
  };

  const handleRestore = async () => {
    const active = await restorePurchases();
    Alert.alert(
      active ? 'Restored' : 'No Active Subscription',
      active
        ? 'Your Pro plan has been restored.'
        : 'We could not find an active Pro subscription for this App Store account.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#212121" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={18} color="#212121" />
            <Text style={styles.badgeText}>Overstep Pro</Text>
          </View>
          <Text style={styles.title}>Practice without the daily free limit</Text>
          <Text style={styles.subtitle}>
            Get 100 AI practice generations per day and keep your adaptive learning moving.
          </Text>
        </View>

        <View style={styles.pricePanel}>
          <Text style={styles.price}>{priceLabel}</Text>
          <Text style={styles.priceCaption}>Auto-renewable monthly subscription</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Ionicons name="flash" size={22} color="#318F65" />
            <Text style={styles.featureText}>100 practices per day</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="analytics" size={22} color="#318F65" />
            <Text style={styles.featureText}>Adaptive difficulty and progress tracking</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#318F65" />
            <Text style={styles.featureText}>AI feedback and follow-up explanations</Text>
          </View>
        </View>

        {isPro ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/(tabs)/practice')}
          >
            <Text style={styles.primaryButtonText}>Continue Practicing</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, isPurchasing && styles.disabledButton]}
            onPress={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#212121" />
            ) : (
              <Text style={styles.primaryButtonText}>Start Pro</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleRestore}
          disabled={isPurchasing}
        >
          <Text style={styles.secondaryButtonText}>Restore Purchase</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {isLoading && (
          <TouchableOpacity style={styles.refreshRow} onPress={refreshSubscription}>
            <ActivityIndicator size="small" color="#318F65" />
            <Text style={styles.refreshText}>Checking subscription...</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>
          Subscription renews monthly unless canceled in your App Store account settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4EC',
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F6C83F',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  badgeText: {
    color: '#212121',
    fontWeight: '700',
    marginLeft: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#318F65',
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#212121',
    lineHeight: 25,
  },
  pricePanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  price: {
    fontSize: 30,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 4,
  },
  priceCaption: {
    fontSize: 14,
    color: '#5CA480',
    fontWeight: '600',
  },
  features: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    marginLeft: 12,
    lineHeight: 22,
  },
  primaryButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F6C83F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#212121',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#318F65',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: '#318F65',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#C0392B',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  refreshText: {
    marginLeft: 8,
    color: '#318F65',
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
