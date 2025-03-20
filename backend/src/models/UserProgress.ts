import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  skillLevels: {
    vocabulary: number;
    grammar: number;
    conversation: number;
    reading: number;
    listening: number;
  };
  completedPractices: number;
  averageDifficulty: number;
  averageComplexity: number;
  lastActivity: Date;
  practiceStreak: number;
  preferredCategories: string[];
  challengeAreas: string[];
}

const UserProgressSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skillLevels: {
    vocabulary: { type: Number, default: 1, min: 1, max: 10 },
    grammar: { type: Number, default: 1, min: 1, max: 10 },
    conversation: { type: Number, default: 1, min: 1, max: 10 },
    reading: { type: Number, default: 1, min: 1, max: 10 },
    listening: { type: Number, default: 1, min: 1, max: 10 }
  },
  completedPractices: { type: Number, default: 0 },
  averageDifficulty: { type: Number, default: 1 },
  averageComplexity: { type: Number, default: 1 },
  lastActivity: { type: Date, default: Date.now },
  practiceStreak: { type: Number, default: 0 },
  preferredCategories: [{ type: String }],
  challengeAreas: [{ type: String }]
});

export default mongoose.model<IUserProgress>('UserProgress', UserProgressSchema); 