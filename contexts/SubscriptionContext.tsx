import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import Config from '@/constants/Config';
import { useAuth } from '@/contexts/AuthContext';
import * as apiService from '@/utils/apiService';

interface BackendSubscriptionState {
  plan: 'free' | 'pro';
  isPro: boolean;
  entitlementId: string;
  productId: string | null;
  expiresAt: string | null;
}

interface SubscriptionContextType {
  isConfigured: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isPro: boolean;
  subscription: BackendSubscriptionState | null;
  currentOffering: PurchasesOffering | null;
  proPackage: PurchasesPackage | null;
  priceLabel: string;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  purchasePro: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const isNativePurchasePlatform = Platform.OS === 'ios';

const getPriceLabel = (pkg: PurchasesPackage | null): string =>
  pkg?.product?.priceString || Config.SUBSCRIPTIONS.FALLBACK_PRICE_LABEL;

const hasActiveProEntitlement = (customerInfo: CustomerInfo): boolean =>
  typeof customerInfo.entitlements.active[Config.SUBSCRIPTIONS.ENTITLEMENT_ID] !== 'undefined';

const findMonthlyPackage = (offering: PurchasesOffering | null): PurchasesPackage | null => {
  if (!offering) return null;

  const configuredProduct = Config.SUBSCRIPTIONS.MONTHLY_PRODUCT_ID;
  const byProduct = offering.availablePackages.find(
    (pkg) => pkg.product.identifier === configuredProduct
  );

  if (byProduct) return byProduct;

  return (
    offering.availablePackages.find(
      (pkg) => String(pkg.packageType).toLowerCase() === 'monthly'
    ) ||
    offering.monthly ||
    offering.availablePackages[0] ||
    null
  );
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const configuredUserIdRef = useRef<string | null>(null);
  const hasConfiguredRef = useRef(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [subscription, setSubscription] = useState<BackendSubscriptionState | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [proPackage, setProPackage] = useState<PurchasesPackage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncBackendSubscription = useCallback(async () => {
    if (!user) return null;

    const response = await apiService.post('/api/user/subscription/sync');
    if (response?.success && response.subscription) {
      setSubscription(response.subscription);
      setIsPro(response.subscription.isPro === true);
      return response.subscription as BackendSubscriptionState;
    }

    return null;
  }, [user]);

  const loadStoredSubscription = useCallback(async () => {
    if (!user) return;

    const response = await apiService.get('/api/user/subscription/status');
    if (response?.success && response.subscription) {
      setSubscription(response.subscription);
      setIsPro(response.subscription.isPro === true);
    }
  }, [user]);

  const configurePurchases = useCallback(async () => {
    if (!user || !isNativePurchasePlatform) return false;

    const apiKey = Config.SUBSCRIPTIONS.IOS_API_KEY;
    if (!apiKey) {
      setError('RevenueCat iOS API key is not configured.');
      return false;
    }

    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    }

    if (!hasConfiguredRef.current) {
      Purchases.configure({ apiKey, appUserID: user._id });
      hasConfiguredRef.current = true;
      configuredUserIdRef.current = user._id;
      setIsConfigured(true);
      return true;
    }

    if (configuredUserIdRef.current !== user._id) {
      await Purchases.logIn(user._id);
      configuredUserIdRef.current = user._id;
    }

    setIsConfigured(true);
    return true;
  }, [user]);

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setIsPro(false);
      setSubscription(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loadStoredSubscription();

      const configured = await configurePurchases();
      if (!configured) return;

      const [customerInfo, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);

      const activeOnDevice = hasActiveProEntitlement(customerInfo);
      if (activeOnDevice) {
        setIsPro(true);
      }

      const offering = offerings.current || null;
      const monthlyPackage = findMonthlyPackage(offering);
      setCurrentOffering(offering);
      setProPackage(monthlyPackage);

      await syncBackendSubscription();
    } catch (refreshError: any) {
      console.error('Subscription refresh error:', refreshError);
      setError(refreshError?.message || 'Failed to refresh subscription status.');
    } finally {
      setIsLoading(false);
    }
  }, [configurePurchases, loadStoredSubscription, syncBackendSubscription, user]);

  const purchasePro = useCallback(async (): Promise<boolean> => {
    setIsPurchasing(true);
    setError(null);

    try {
      const configured = await configurePurchases();
      if (!configured) {
        throw new Error('Purchases are not configured for this build.');
      }

      let packageToBuy = proPackage;
      if (!packageToBuy) {
        const offerings = await Purchases.getOfferings();
        packageToBuy = findMonthlyPackage(offerings.current || null);
        setCurrentOffering(offerings.current || null);
        setProPackage(packageToBuy);
      }

      if (!packageToBuy) {
        throw new Error('The Pro monthly subscription is not available yet.');
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
      const active = hasActiveProEntitlement(customerInfo);

      if (active) {
        setIsPro(true);
        try {
          await syncBackendSubscription();
        } catch (syncError) {
          console.error('Subscription sync after purchase failed:', syncError);
          setError('Purchase completed, but your Pro status is still syncing.');
        }
      }

      return active;
    } catch (purchaseError: any) {
      if (!purchaseError?.userCancelled) {
        console.error('Purchase error:', purchaseError);
        setError(purchaseError?.message || 'Unable to complete purchase.');
      }
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [configurePurchases, proPackage, syncBackendSubscription]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsPurchasing(true);
    setError(null);

    try {
      const configured = await configurePurchases();
      if (!configured) {
        throw new Error('Purchases are not configured for this build.');
      }

      const customerInfo = await Purchases.restorePurchases();
      const active = hasActiveProEntitlement(customerInfo);
      setIsPro(active);

      if (active) {
        try {
          await syncBackendSubscription();
        } catch (syncError) {
          console.error('Subscription sync after restore failed:', syncError);
          setError('Restore completed, but your Pro status is still syncing.');
        }
      }

      return active;
    } catch (restoreError: any) {
      console.error('Restore purchases error:', restoreError);
      setError(restoreError?.message || 'Unable to restore purchases.');
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [configurePurchases, syncBackendSubscription]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        isConfigured,
        isLoading,
        isPurchasing,
        isPro,
        subscription,
        currentOffering,
        proPackage,
        priceLabel: getPriceLabel(proPackage),
        error,
        refreshSubscription,
        purchasePro,
        restorePurchases,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
