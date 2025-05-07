export interface Practice {
  _id: string;
  content: string;
  type: string;
  difficulty: number;
  isCorrect: boolean;
  completedAt: string;
  userAnswer: string;
  categories: string[];
  subject?: string;
}

export interface PracticeHistory {
  practices: Practice[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface ProgressStats {
  totalCompleted: number;
  correctAnswers: number;
  totalCategories: number;
  averageScore: number;
  streakDays: number;
}