import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AIProviderProvider } from '@/contexts/AIProviderContext';
import { TabProvider } from '@/contexts/TabContext';
import * as Sentry from '@sentry/react-native';
import Config from '@/constants/Config';

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
  
  // Handle navigation based on authentication state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      // Redirect to the login page if the user is not logged in 
      // and trying to access protected routes
      router.replace('/login');
    } else if (user && !inAuthGroup) {
      // Redirect to the home page if the user is logged in 
      // and on an authentication page
      router.replace('/');
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

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
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
