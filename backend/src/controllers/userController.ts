import { Request, Response } from 'express';
import UserPreferences from '../models/UserPreferences';
import UserProgress from '../models/UserProgress';
import User from '../models/User';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types';

// Create or update user preferences
export const setUserPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { preferredCategories, challengeAreas, learningReason } = req.body;
    const userId = req.userId; // Get authenticated user ID from the request

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!preferredCategories || !challengeAreas || !learningReason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find existing preferences or create new ones
    let preferences = await UserPreferences.findOne({ userId });

    if (preferences) {
      // Update existing preferences
      preferences.preferredCategories = preferredCategories;
      preferences.challengeAreas = challengeAreas;
      preferences.learningReason = learningReason;
      await preferences.save();
    } else {
      // Create new preferences
      preferences = await UserPreferences.create({
        userId,
        preferredCategories,
        challengeAreas,
        learningReason,
      });
    }

    // Update user to mark onboarding as complete
    await User.findByIdAndUpdate(userId, { hasCompletedOnboarding: true });

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error setting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Get user preferences
export const getUserPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const preferences = await UserPreferences.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'Preferences not found',
      });
    }

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Get user profile with progress data
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Get user data without password
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user progress
    const progress = await UserProgress.findOne({ userId });
    
    // Get user preferences
    const preferences = await UserPreferences.findOne({ userId });

    res.status(200).json({
      success: true,
      data: {
        user,
        progress,
        preferences,
      },
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Initialize user progress
export const initializeProgress = async (req: Request, res: Response) => {
  try {
    const { userId, preferredCategories, challengeAreas, learningGoals } = req.body;

    if (!userId || !preferredCategories || !challengeAreas || !learningGoals) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create initial progress
    const progress = await UserProgress.create({
      userId,
      skillLevels: {
        vocabulary: 1,
        grammar: 1,
        conversation: 1,
        reading: 1,
        listening: 1
      },
      completedPractices: 0,
      averageDifficulty: 1,
      averageComplexity: 1,
      lastActivity: new Date(),
      practiceStreak: 0,
      preferredCategories,
      challengeAreas
    });

    res.status(201).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error initializing user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}; 