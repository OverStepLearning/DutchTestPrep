// Types for practice content and feedback
export interface PracticeItem {
  _id: string;
  content: string | string[];
  translation?: string | string[];
  type: 'vocabulary' | 'grammar' | 'conversation' | 'reading' | 'listening';
  difficulty: number;
  complexity: number;
  categories: string[];
  questionType?: string; // Type of question (mcq, spelling, fill-in-blank, etc.)
  options?: string[]; // Options for multiple choice questions
  motherLanguage?: string; // User's native language
}

export interface FeedbackResponse {
  isCorrect: boolean;
  feedback: string | string[];
}

export type DifficultyTrend = 'increasing' | 'decreasing' | 'stable';
export type DifficultyDirection = 'up' | 'down'; 