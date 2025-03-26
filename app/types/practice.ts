// Types for practice content and feedback
export interface PracticeItem {
  _id: string;
  content: string | string[];
  translation?: string | string[];
  practiceType?: string; // 'Vocabulary', 'Grammar', 'Sentence structure', etc.
  difficulty: string; // 'easy', 'medium', 'hard'
  complexity: string; // 'low', 'medium', 'high'
  categories: string[];
  challengeAreas?: string[]; // Specific areas of challenge for the user
  questionType?: string; // Type of question (mcq, multiple-choice, open-ended, etc.)
  options?: string[]; // Options for multiple choice questions
  createdAt?: string;
  userId?: string;
  isCompleted?: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
  feedbackProvided?: string;
}

export interface FeedbackResponse {
  isCorrect: boolean;
  feedback: string | string[];
}

export type DifficultyTrend = 'increasing' | 'decreasing' | 'stable';
export type DifficultyDirection = 'up' | 'down'; 