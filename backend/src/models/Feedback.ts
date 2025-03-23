import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  // Who submitted the feedback
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Type of feedback
  feedbackType: {
    type: String,
    enum: ['question_rating', 'general_feedback'],
    required: true
  },
  
  // For question ratings
  questionFeedback: {
    practiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Practice'
    },
    rating: {
      type: String,
      enum: ['thumbs_up', 'thumbs_down']
    },
    content: String, // Store the question content for reference
    difficulty: Number
  },
  
  // For general feedback
  generalFeedback: {
    title: String,
    message: {
      type: String,
      maxlength: 2000
    },
    category: {
      type: String,
      enum: ['bug', 'feature_request', 'content_quality', 'difficulty', 'other']
    }
  },
  
  // Additional metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Device info to help with debugging
  deviceInfo: {
    platform: String,
    version: String,
    appVersion: String
  },
  
  // Status for moderation
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'spam'],
    default: 'pending'
  },
  
  // Rate limiting protection
  ipAddress: String
});

// Add indexes for performance and rate limiting
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ ipAddress: 1, createdAt: -1 });
feedbackSchema.index({ feedbackType: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback; 