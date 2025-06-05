import { logEvent, setUserId as firebaseSetUserId, setUserProperties, Analytics } from 'firebase/analytics';
import { analytics, initAnalytics } from './firebase';
import { Platform } from 'react-native';

// Track initialization state
let isFirebaseReady = false;

// Check if we're running on a supported platform
const isSupportedPlatform = () => {
  return Platform.OS === 'web' || process.env.NODE_ENV === 'production';
};

// Check if Firebase Analytics is available
const isFirebaseAvailable = () => {
  try {
    if (!isSupportedPlatform()) {
      return false;
    }
    return analytics !== null;
  } catch (error) {
    console.warn('Firebase Analytics check failed:', error);
    return false;
  }
};

// Initialize analytics with better error handling
export const initializeAnalytics = async (): Promise<void> => {
  if (isFirebaseReady) {
    return;
  }

  try {
    if (!isSupportedPlatform()) {
      console.log('Firebase Analytics: Skipping initialization on native platform in development');
      return;
    }

    const analyticsInstance = await initAnalytics();
    
    if (analyticsInstance) {
      // Set app version as user property
      setUserProperty('app_version', '1.1.0');
      
      isFirebaseReady = true;
      console.log('Firebase Analytics initialized successfully');
    } else {
      console.log('Firebase Analytics not available - analytics disabled');
    }
  } catch (error) {
    console.error('Failed to initialize Analytics:', error);
    // Don't throw error to prevent app crashes
  }
};

// Safe wrapper for analytics operations
const safeAnalyticsCall = async (operation: () => Promise<void>) => {
  try {
    if (!isSupportedPlatform()) {
      console.log('Firebase Analytics: Skipping operation on native platform in development');
      return;
    }
    
    if (!analytics) {
      console.log('Firebase Analytics not available, skipping operation');
      return;
    }
    
    if (!isFirebaseReady) {
      await initializeAnalytics();
    }
    
    if (!isFirebaseReady) {
      console.log('Firebase Analytics not initialized, skipping operation');
      return;
    }
    
    await operation();
  } catch (error) {
    console.error('Analytics operation failed:', error);
    // Don't throw error to prevent app crashes
  }
};

// Generic event tracking
export const trackEvent = async (eventName: string, parameters?: Record<string, any>) => {
  await safeAnalyticsCall(async () => {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
      console.log(`Analytics: ${eventName}`, parameters);
    }
  });
};

// Set user properties
export const setUserProperty = async (name: string, value: string) => {
  await safeAnalyticsCall(async () => {
    if (analytics) {
      const properties: Record<string, string> = {};
      properties[name] = value;
      setUserProperties(analytics, properties);
      console.log(`Analytics: Set user property ${name} = ${value}`);
    }
  });
};

// Set user ID
export const setUserId = async (userId: string) => {
  await safeAnalyticsCall(async () => {
    if (analytics) {
      firebaseSetUserId(analytics, userId);
      console.log(`Analytics: Set user ID ${userId}`);
    }
  });
};

// User Journey Tracking
export const trackUserActions = {
  // App lifecycle
  appOpened: () => trackEvent('app_opened', {
    timestamp: Date.now(),
    source: 'app_launch'
  }),

  appBackgrounded: () => trackEvent('app_backgrounded', {
    timestamp: Date.now()
  }),

  appForegrounded: () => trackEvent('app_foregrounded', {
    timestamp: Date.now()
  }),

  // Authentication & Registration
  userRegistered: (hasInvitationCode: boolean, registrationMethod: string) => 
    trackEvent('user_registered', { 
      has_invitation_code: hasInvitationCode,
      registration_method: registrationMethod,
      timestamp: Date.now()
    }),

  userLoggedIn: (loginMethod: string) => 
    trackEvent('user_logged_in', { 
      login_method: loginMethod,
      timestamp: Date.now()
    }),

  userLoggedOut: () => 
    trackEvent('user_logged_out', {
      timestamp: Date.now()
    }),

  // Onboarding
  onboardingStarted: () => 
    trackEvent('onboarding_started', {
      timestamp: Date.now()
    }),

  onboardingStepCompleted: (step: number, stepName: string) => 
    trackEvent('onboarding_step_completed', {
      step_number: step,
      step_name: stepName,
      timestamp: Date.now()
    }),

  onboardingCompleted: (totalSteps: number, timeSpent: number) => 
    trackEvent('onboarding_completed', {
      total_steps: totalSteps,
      time_spent_seconds: timeSpent,
      timestamp: Date.now()
    }),

  onboardingAbandoned: (lastStep: number, stepName: string) => 
    trackEvent('onboarding_abandoned', {
      last_step: lastStep,
      step_name: stepName,
      timestamp: Date.now()
    }),

  // Practice & Learning
  practiceStarted: (subject: string, difficulty: number, complexity: number) => 
    trackEvent('practice_started', {
      subject,
      difficulty_level: difficulty,
      complexity_level: complexity,
      timestamp: Date.now()
    }),

  practiceQuestionAnswered: (subject: string, isCorrect: boolean, timeSpent: number) => 
    trackEvent('practice_question_answered', {
      subject,
      is_correct: isCorrect,
      time_spent_seconds: timeSpent,
      timestamp: Date.now()
    }),

  practiceSessionCompleted: (subject: string, questionsAnswered: number, correctAnswers: number, sessionDuration: number) => 
    trackEvent('practice_session_completed', {
      subject,
      questions_answered: questionsAnswered,
      correct_answers: correctAnswers,
      success_rate: correctAnswers / questionsAnswered,
      session_duration_seconds: sessionDuration,
      timestamp: Date.now()
    }),

  feedbackRequested: (subject: string, questionType: string) => 
    trackEvent('feedback_requested', {
      subject,
      question_type: questionType,
      timestamp: Date.now()
    }),

  // Retention Tracking
  userReturned: (daysSinceInstall: number, daysSinceLastOpen: number) => 
    trackEvent('user_returned', {
      days_since_install: daysSinceInstall,
      days_since_last_open: daysSinceLastOpen,
      timestamp: Date.now()
    }),

  // Feature Usage
  difficultyAdjusted: (oldDifficulty: number, newDifficulty: number, adjustmentType: string) => 
    trackEvent('difficulty_adjusted', {
      old_difficulty: oldDifficulty,
      new_difficulty: newDifficulty,
      adjustment_type: adjustmentType,
      timestamp: Date.now()
    }),

  subjectChanged: (fromSubject: string, toSubject: string) => 
    trackEvent('subject_changed', {
      from_subject: fromSubject,
      to_subject: toSubject,
      timestamp: Date.now()
    }),

  // Errors & Issues
  errorOccurred: (errorType: string, errorMessage: string, screen: string) => {
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage.substring(0, 100), // Limit message length
      screen,
      timestamp: Date.now()
    });
  },

  networkError: (endpoint: string, statusCode: number) => 
    trackEvent('network_error', {
      endpoint,
      status_code: statusCode,
      timestamp: Date.now()
    }),

  // Engagement
  screenViewed: (screenName: string, timeSpent?: number) => 
    trackEvent('screen_view', {
      screen_name: screenName,
      time_spent_seconds: timeSpent,
      timestamp: Date.now()
    }),

  buttonPressed: (buttonName: string, screen: string) => 
    trackEvent('button_pressed', {
      button_name: buttonName,
      screen,
      timestamp: Date.now()
    })
};

// Retention Analysis Helpers
export const retention = {
  // Track when user opens app (for day 1, 3, 7 retention)
  trackDailyOpen: async () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Track if this is a return visit
    trackEvent('daily_open', {
      date: today,
      timestamp: Date.now()
    });
  },

  // Set cohort information
  setCohort: async (installDate: string, acquisitionChannel: string) => {
    await setUserProperty('install_date', installDate);
    await setUserProperty('acquisition_channel', acquisitionChannel);
    await setUserProperty('user_cohort', `${installDate}_${acquisitionChannel}`);
  }
};

// User Segmentation
export const userSegmentation = {
  setUserType: (userType: 'beta_tester' | 'invited_user' | 'organic_user') => 
    setUserProperty('user_type', userType),

  setAcquisitionChannel: (channel: 'testflight' | 'invitation_code' | 'app_store' | 'referral') => 
    setUserProperty('acquisition_channel', channel),

  setEngagementLevel: (level: 'low' | 'medium' | 'high') => 
    setUserProperty('engagement_level', level),

  setLearningGoal: (goal: string) => 
    setUserProperty('learning_goal', goal),

  setPrimarySubject: (subject: string) => 
    setUserProperty('primary_subject', subject)
};

export default {
  initializeAnalytics,
  trackEvent,
  setUserProperty,
  setUserId,
  trackUserActions,
  retention,
  userSegmentation
}; 