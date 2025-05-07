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

// Common challenge areas for Dutch learners
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

// Reasons for learning Dutch
export const LEARNING_REASONS = [
  'For work or business',
  'For travel',
  'To live in the Netherlands/Belgium',
  'To connect with Dutch family/heritage',
  'For academic purposes',
  'For fun/personal interest',
  'To speak with Dutch friends/partner',
  'Other'
]; 