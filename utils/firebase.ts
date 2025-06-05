import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';

// Firebase configuration from your GoogleService-Info.plist
const firebaseConfig = {
  apiKey: "AIzaSyDcq-PAKI0jIIZnB52k0Uk9GevMln9rAZE",
  authDomain: "gen-lang-client-0351766814.firebaseapp.com",
  projectId: "gen-lang-client-0351766814",
  storageBucket: "gen-lang-client-0351766814.firebasestorage.app",
  messagingSenderId: "75550814449",
  appId: "1:75550814449:ios:f65d8a87651f0b9044f950"
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Analytics (only for web platform in development, will work on all platforms when built)
let analytics: Analytics | null = null;

// Check if we're running in a supported environment for analytics
const initAnalytics = async () => {
  try {
    // Firebase Analytics works on web and in production builds
    // For development, we'll only initialize on web to avoid conflicts
    if (Platform.OS === 'web' || process.env.NODE_ENV === 'production') {
      const supported = await isSupported();
      if (supported) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized successfully');
        return analytics;
      } else {
        console.log('Firebase Analytics not supported in this environment');
      }
    } else {
      console.log('Firebase Analytics: Skipping initialization in development on native platforms');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics:', error);
  }
  return null;
};

// Initialize analytics
initAnalytics();

export { app, analytics, initAnalytics };
export default app; 