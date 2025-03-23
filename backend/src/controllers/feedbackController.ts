import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import { rateLimit } from 'express-rate-limit';

// Define authenticated request interface with userId
interface AuthenticatedRequest extends Request {
  userId?: string;
  ip?: string;
}

// Submit feedback about a specific practice question (thumbs up/down)
export const submitQuestionFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { practiceId, rating, content, difficulty } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }
    
    if (!practiceId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: practiceId and rating',
      });
    }
    
    // Check for existing feedback to prevent duplicates
    const existingFeedback = await Feedback.findOne({
      userId,
      feedbackType: 'question_rating',
      'questionFeedback.practiceId': practiceId
    });
    
    if (existingFeedback) {
      // Update existing feedback instead of creating new
      existingFeedback.questionFeedback.rating = rating;
      await existingFeedback.save();
      
      return res.status(200).json({
        success: true,
        message: 'Feedback updated successfully',
        data: existingFeedback
      });
    }
    
    // Create new feedback
    const feedback = new Feedback({
      userId,
      feedbackType: 'question_rating',
      questionFeedback: {
        practiceId,
        rating,
        content,
        difficulty
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceInfo: {
        platform: req.headers['user-agent'] || 'unknown'
      }
    });
    
    await feedback.save();
    
    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting question feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Submit general feedback (from Explore tab)
export const submitGeneralFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, message, category } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }
    
    // Prevent spam by checking recent submissions from this user
    const recentSubmissions = await Feedback.countDocuments({
      userId,
      feedbackType: 'general_feedback',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    
    if (recentSubmissions >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many feedback submissions in 24 hours. Please try again later.',
      });
    }
    
    // Create feedback
    const feedback = new Feedback({
      userId,
      feedbackType: 'general_feedback',
      generalFeedback: {
        title: title || 'Feedback',
        message,
        category: category || 'other'
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceInfo: {
        platform: req.headers['user-agent'] || 'unknown',
        version: req.headers['app-version'] || 'unknown'
      }
    });
    
    await feedback.save();
    
    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: { id: feedback._id }
    });
  } catch (error) {
    console.error('Error submitting general feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user's own feedback history (for reference)
export const getUserFeedbackHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }
    
    const feedbackHistory = await Feedback.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    return res.status(200).json({
      success: true,
      data: feedbackHistory
    });
  } catch (error) {
    console.error('Error fetching feedback history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching feedback history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 