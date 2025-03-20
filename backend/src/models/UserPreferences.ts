import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  preferredCategories: string[];
  challengeAreas: string[];
  learningReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  preferredCategories: {
    type: [String],
    required: true,
    default: [],
  },
  challengeAreas: {
    type: [String],
    required: true,
    default: [],
  },
  learningReason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
UserPreferencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema); 