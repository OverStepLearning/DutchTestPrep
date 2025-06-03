import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import UserProgress from '../models/UserProgress';
import InvitationCode from '../models/InvitationCode';
import mongoose from 'mongoose';
import config from '../config/environment';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, motherLanguage, invitationCode } = req.body;

    // Validate required fields
    if (!name || !email || !password || !invitationCode) {
      return res.status(400).json({ 
        message: 'Name, email, password, and invitation code are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate invitation code
    const validInvitationCode = await InvitationCode.findOne({ 
      code: invitationCode.toUpperCase(),
      isUsed: false 
    });

    if (!validInvitationCode) {
      return res.status(400).json({ 
        message: 'Invalid or already used invitation code' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      motherLanguage: motherLanguage || 'English' // Use provided value or default to English
    });

    await newUser.save();

    // Mark invitation code as used
    validInvitationCode.isUsed = true;
    validInvitationCode.usedAt = new Date();
    validInvitationCode.usedBy = newUser._id;
    await validInvitationCode.save();

    // Create initial user progress
    const newUserProgress = new UserProgress({
      userId: newUser._id,
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
      preferredCategories: [], // These will be set during onboarding
      challengeAreas: [] // These will be set during onboarding
    });

    await newUserProgress.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id },
      config.jwtSecret as string,
      { expiresIn: '7d' }
    );

    // Return user data and token
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 