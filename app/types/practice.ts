// Types for practice content and feedback
export interface PracticeItem {
  _id: string;
  content: string | string[];
  translation?: string | string[];
  scaffolding?: string; // Hint or scaffolding information from AI
  practiceType?: string; // 'Vocabulary', 'Grammar', 'Sentence structure', etc.
  difficulty: number; // 1-10 scale as a number
  complexity: number; // 1-10 scale as a number
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

export interface DifficultyChangeInfo {
  oldDifficulty: number;
  oldComplexity: number;
  newDifficulty: number;
  newComplexity: number;
  change: number;
  exitedAdjustmentMode?: boolean;
}

export interface AdjustmentModeInfo {
  isInAdjustmentMode: boolean;
  adjustmentPracticesRemaining: number;
}

export type DifficultyTrend = 'increasing' | 'decreasing' | 'stable';
export type DifficultyDirection = 'up' | 'down'; 