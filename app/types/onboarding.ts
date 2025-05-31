export interface OnboardingPreferences {
  preferredCategories: string[];
  challengeAreas: string[];
  learningReason: string | null;
  learningSubject: string | null;
  motherLanguage: string | null;
}

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

// Constants for practice areas
export const CATEGORIES = [
  'Greetings',
  'Food',
  'Travel',
  'Work',
  'Shopping',
  'Family',
  'Health',
  'Education',
  'Weather',
  'Hobbies',
  'Transportation',
  'Housing'
];

// Common challenge areas for language learners
export const CHALLENGE_AREAS = [
  'Pronunciation',
  'Verb conjugation',
  'Word order',
  'Gender of nouns',
  'Prepositions',
  'Articles',
  'Plurals',
  'Past tense',
  'Conditional forms',
  'Modal verbs',
  'Separable verbs'
];

// Reasons for learning languages
export const LEARNING_REASONS = [
  'For work or business',
  'For travel',
  'To live in a country where it\'s spoken',
  'To connect with family/heritage',
  'For academic purposes',
  'For fun/personal interest',
  'To speak with friends/partner',
  'Other'
]; 