import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme, AppState } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AIProviderProvider } from '@/contexts/AIProviderContext';
import { TabProvider } from '@/contexts/TabContext';
import * as Sentry from '@sentry/react-native';
import Config from '@/constants/Config';
import analytics, { initializeAnalytics, trackUserActions, setUserId, userSegmentation, retention } from '@/utils/analytics';

// Initialize Sentry with the newly generated DSN
Sentry.init({
  dsn: 'https://eebeb7eec994fbb802a43ca5f4427838@o4509077215051776.ingest.de.sentry.io/4509077262368848',
  
  // Set environment
  environment: __DEV__ ? 'development' : 'production',
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,

  // Add version information
  release: Config.VERSION || 'unknown',
  dist: Config.buildNumber || '1',
  
  // Debug features (only in development)
  debug: __DEV__,
  
  // Enhanced error data
  attachStacktrace: true,
  
  // Additional context for auth-related issues
  beforeSend(event) {
    // Add API URL to context for network issues
    event.contexts = {
      ...event.contexts,
      app: {
        ...event.contexts?.app,
        api_url: Config.API_URL,
      }
    };
    return event;
  },
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Navigation guard to handle authentication state
function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // Handle Firebase Analytics for authenticated users
  useEffect(() => {
    const setupUserAnalytics = async () => {
      if (user && user._id) {
        try {
          // Ensure Firebase is initialized before setting user properties
          await initializeAnalytics();
          
          // Set user ID for analytics
          await setUserId(user._id);
          
          // Set user properties based on user data
          await userSegmentation.setPrimarySubject(user.learningSubject || 'Dutch');
          await userSegmentation.setLearningGoal('general'); // Default since learning goal isn't in User type yet
          
          // Determine user type - check if this is from TestFlight or invitation
          const isTestFlight = __DEV__ || process.env.NODE_ENV === 'development';
          const userType = isTestFlight ? 'beta_tester' : 'invited_user';
          const acquisitionChannel = isTestFlight ? 'testflight' : 'invitation_code';
          
          await userSegmentation.setUserType(userType);
          await userSegmentation.setAcquisitionChannel(acquisitionChannel);
          
          // Track user return and set cohort information
          const installDate = new Date().toISOString().split('T')[0];
          await retention.setCohort(installDate, acquisitionChannel);
          await retention.trackDailyOpen();
          
          // Track user returned (using 0 for days since install for now since createdAt isn't available)
          trackUserActions.userReturned(0, 0);
        } catch (error) {
          console.error('Failed to setup user analytics:', error);
        }
      }
    };

    setupUserAnalytics();
  }, [user]);
  
  // Handle navigation based on authentication state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      // Redirect to the login page if the user is not logged in 
      // and trying to access protected routes
      router.replace('/login');
    } else if (user && !inAuthGroup && segments[0] !== 'login' && segments[0] !== 'register') {
      // Only redirect to home if user is logged in and not on auth pages
      // and not currently on login/register (to prevent redirect loops)
      setTimeout(() => {
        router.replace('/');
      }, 100);
    }
  }, [user, segments, isLoading]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const colorScheme = useColorScheme();

  // Initialize Firebase Analytics
  useEffect(() => {
    const setupFirebase = async () => {
      try {
        await initializeAnalytics();
        
        // Track app opened after Firebase is initialized
        trackUserActions.appOpened();
      } catch (error) {
        console.error('Failed to setup Firebase:', error);
      }
    };

    setupFirebase();
  }, []);

  // Handle app state changes for background/foreground tracking
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        trackUserActions.appForegrounded();
        retention.trackDailyOpen(); // Track daily opens for retention
      } else if (nextAppState === 'background') {
        trackUserActions.appBackgrounded();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      // Track error in Firebase Analytics
      trackUserActions.errorOccurred('font_loading_error', error.message, 'root_layout');
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AIProviderProvider>
        <TabProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootLayoutNav />
          </ThemeProvider>
        </TabProvider>
      </AIProviderProvider>
    </AuthProvider>
  );
}
