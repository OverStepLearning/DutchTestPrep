import { Request, Response } from 'express';
import Practice from '../models/Practice';
import UserProgress from '../models/UserProgress';
import { generateAIPractice } from '../services/aiService';

// Generate a new practice item for user based on their level
export const generatePractice = async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      type, 
      difficulty: requestedDifficulty, 
      complexity: requestedComplexity,
      preferredCategories: requestedCategories,
      challengeAreas: requestedChallengeAreas,
      questionType: requestedQuestionType,
      motherLanguage
    } = req.body;
    
    // Get user progress to determine appropriate difficulty if not provided
    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      return res.status(404).json({ message: 'User progress not found' });
    }
    
    // Use provided parameters or fall back to user's progress
    const practiceType = type || 'vocabulary';
    const difficulty = requestedDifficulty || userProgress.skillLevels[practiceType as keyof typeof userProgress.skillLevels] || 1;
    const complexity = requestedComplexity || Math.max(1, Math.min(difficulty - 1, 10)); // Complexity is slightly lower than difficulty
    const preferredCategories = requestedCategories || userProgress.preferredCategories;
    const challengeAreas = requestedChallengeAreas || userProgress.challengeAreas;
    
    // Extract question type if provided as an array
    let questionType = undefined;
    if (requestedQuestionType && Array.isArray(requestedQuestionType) && requestedQuestionType.length > 0) {
      questionType = requestedQuestionType[0]; // Use the first item in the array
    }
    
    // Generate practice content using AI
    const practiceContent = await generateAIPractice({
      type: practiceType,
      difficulty,
      complexity,
      preferredCategories,
      challengeAreas
    });
    
    // Create new practice item
    const practice = new Practice({
      userId,
      content: practiceContent.content,
      translation: practiceContent.translation,
      type: practiceType,
      difficulty,
      complexity,
      categories: practiceContent.categories,
      questionType: questionType || 'open-ended', // Default to open-ended if not specified
      options: practiceContent.options || [] // Store any options for multiple-choice
    });
    
    await practice.save();
    
    return res.status(201).json({
      success: true,
      data: practice
    });
  } catch (error) {
    console.error('Error generating practice:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to generate practice' 
    });
  }
};

// Submit user's answer and update progress
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { practiceId, answer } = req.body;
    
    const practice = await Practice.findById(practiceId);
    
    if (!practice) {
      return res.status(404).json({ message: 'Practice not found' });
    }
    
    // Use AI to evaluate the answer
    const evaluationResult = await generateAIPractice({
      action: 'evaluate',
      content: practice.content,
      userAnswer: answer,
      type: practice.type,
      difficulty: practice.difficulty,
      complexity: practice.difficulty // Using difficulty as a reasonable default for complexity
    });
    
    // Update practice with user's answer and result
    practice.userAnswer = answer;
    practice.isCorrect = evaluationResult.isCorrect;
    practice.completedAt = new Date();
    await practice.save();
    
    // Update user progress
    const userProgress = await UserProgress.findOne({ userId: practice.userId });
    
    if (userProgress) {
      // Increase skill level if correct, decrease slightly if wrong
      const skillAdjustment = evaluationResult.isCorrect ? 0.1 : -0.05;
      const currentSkillLevel = userProgress.skillLevels[practice.type as keyof typeof userProgress.skillLevels];
      const newSkillLevel = Math.max(1, Math.min(10, currentSkillLevel + skillAdjustment));
      
      userProgress.skillLevels[practice.type as keyof typeof userProgress.skillLevels] = newSkillLevel;
      userProgress.completedPractices += 1;
      userProgress.lastActivity = new Date();
      
      // Calculate new averages
      userProgress.averageDifficulty = 
        (userProgress.averageDifficulty * (userProgress.completedPractices - 1) + practice.difficulty) / 
        userProgress.completedPractices;
      
      userProgress.averageComplexity = 
        (userProgress.averageComplexity * (userProgress.completedPractices - 1) + practice.complexity) / 
        userProgress.completedPractices;
      
      await userProgress.save();
    }
    
    return res.status(200).json({
      practice,
      feedback: evaluationResult.feedback,
      isCorrect: evaluationResult.isCorrect
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ message: 'Failed to submit answer' });
  }
};

// Get user's practice history
export const getPracticeHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    const practices = await Practice.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Practice.countDocuments({ userId });
    
    return res.status(200).json({
      practices,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching practice history:', error);
    return res.status(500).json({ message: 'Failed to fetch practice history' });
  }
}; 