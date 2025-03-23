export interface PracticeStats {
  total: number;
  correct: number;
  vocabulary: number;
  grammar: number;
  conversation: number;
  streak: number;
  lastPractice: string;
}

export interface CategoryPerformance {
  category: string;
  correct: number;
  total: number;
}

export interface ActivityItem {
  date: string;
  type: string;
  score: number;
  topic: string;
} 