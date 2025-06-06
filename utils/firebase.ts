import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics as firebaseGetAnalytics, Analytics, isSupported } from 'firebase/analytics';
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

// Initialize Analytics 
let analytics: Analytics | null = null;

// Initialize analytics with better compatibility
const initAnalytics = async () => {
  try {
    // FIXED: Remove restrictive platform detection that was preventing iOS from working
    // Firebase Web SDK can work on native platforms in production builds
    const supported = await isSupported();
    if (supported) {
      analytics = firebaseGetAnalytics(app);
      console.log('Firebase Analytics initialized successfully on platform:', Platform.OS);
      return analytics;
    } else {
      console.log('Firebase Analytics not supported in this environment');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics:', error);
  }
  return null;
};

// Check if Firebase is available
export const isFirebaseAvailable = (): boolean => {
  return analytics !== null;
};

// Get analytics instance
export const getAnalyticsInstance = () => {
  return analytics;
};

// Initialize analytics immediately
initAnalytics();

export { app, analytics, initAnalytics };
export default app; 