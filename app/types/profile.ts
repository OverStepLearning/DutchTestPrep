export interface UserProfile {
  user: {
    _id: string;
    name: string;
    email: string;
    motherLanguage?: string;
  };
  progress: {
    skillLevels: {
      vocabulary: number;
      grammar: number;
      conversation: number;
      reading: number;
      listening: number;
    };
    currentDifficulty: number;
    currentComplexity: number;
    isInAdjustmentMode?: boolean;
    adjustmentPracticesRemaining?: number;
    completedPractices: number;
    averageDifficulty: number;
    averageComplexity?: number;
    lastActivity: Date;
  };
  preferences: {
    preferredCategories: string[];
    challengeAreas: string[];
    learningReason: string;
  };
}

export interface LanguageOption {
  code: string;
  nativeName: string;
} 