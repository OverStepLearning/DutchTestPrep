import mongoose, { Document, Schema } from 'mongoose';

export interface IPractice extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  translation?: string;
  type: 'vocabulary' | 'grammar' | 'conversation' | 'reading' | 'listening';
  difficulty: number; // 1-10 scale
  complexity: number; // 1-10 scale
  userAnswer?: string;
  isCorrect?: boolean;
  categories: string[]; // e.g., "food", "travel", "work"
  createdAt: Date;
  completedAt?: Date;
}

const PracticeSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  translation: { type: String },
  type: { 
    type: String, 
    required: true,
    enum: ['vocabulary', 'grammar', 'conversation', 'reading', 'listening']
  },
  difficulty: { type: Number, required: true, min: 1, max: 10 },
  complexity: { type: Number, required: true, min: 1, max: 10 },
  userAnswer: { type: String },
  isCorrect: { type: Boolean },
  categories: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export default mongoose.model<IPractice>('Practice', PracticeSchema); 