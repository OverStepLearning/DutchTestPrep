import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define types for AI service
interface PracticeGenerationParams {
  type: string;
  difficulty: number;
  complexity: number;
  preferredCategories?: string[];
  challengeAreas?: string[];
  action?: string;
  content?: string;
  userAnswer?: string;
  questionType?: string;
}

interface PracticeContent {
  content: string;
  translation?: string;
  categories: string[];
  isCorrect?: boolean;
  feedback?: string;
  options?: string[]; // For multiple choice questions
  questionType?: string;
}

// Initialize OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log('OpenAI API Key (first few chars):', OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'undefined');
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Function to generate Dutch practice content using OpenAI
export const generateAIPractice = async (params: PracticeGenerationParams): Promise<PracticeContent> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not defined');
    }

    // Check if it's a valid API key format
    if (!OPENAI_API_KEY.startsWith('sk-')) {
      console.error('Invalid OpenAI API key format');
      throw new Error('Invalid OpenAI API key format');
    }

    let prompt = '';
    
    // Create appropriate prompt based on the action (generate or evaluate)
    if (params.action === 'evaluate') {
      prompt = `
        You are a Dutch language teacher evaluating a student's answer.
        
        Question: ${params.content}
        Student's answer: ${params.userAnswer}
        
        Evaluate if the answer is correct. Consider grammatical accuracy, vocabulary usage, and context.
        Provide constructive feedback in English that helps the student understand any mistakes.
        
        Return your response in JSON format with the following structure:
        {
          "isCorrect": boolean,
          "feedback": "detailed feedback on the answer"
        }
      `;
    } else {
      // Default action is to generate practice
      const difficultyLevel = params.difficulty || 1;
      const complexityLevel = params.complexity || 1;
      const practiceType = params.type || 'vocabulary';
      const questionType = params.questionType || 'open-ended';
      
      // Build categories string
      const categoriesStr = params.preferredCategories && params.preferredCategories.length > 0 
        ? `focusing on these categories: ${params.preferredCategories.join(', ')}` 
        : '';
        
      // Build challenge areas string
      const challengeAreasStr = params.challengeAreas && params.challengeAreas.length > 0 
        ? `with extra attention to these challenging areas: ${params.challengeAreas.join(', ')}` 
        : '';

      // Additional instructions for question type
      let questionTypeInstructions = '';
      let responseFormatInstructions = '';
      
      if (questionType === 'multiple-choice') {
        questionTypeInstructions = `
        Create a multiple-choice question with 4 options, where only one is correct.
        The options should be provided in the "options" field of your response.
        The first option should be the correct answer.
        `;
        
        responseFormatInstructions = `
        For multiple-choice questions, include:
        "options": ["correct answer", "wrong option 1", "wrong option 2", "wrong option 3"]
        `;
      } else if (questionType === 'fill-in-blank') {
        questionTypeInstructions = `
        Create a fill-in-the-blank question with one or more blanks that the user needs to complete.
        Mark the blanks with underscores or a similar notation in the content.
        `;
      }

      prompt = `
        You are a Dutch language teacher creating practice exercises.
        
        Create a ${practiceType} practice at difficulty level ${difficultyLevel}/10 and complexity level ${complexityLevel}/10 for a Dutch language learner.
        The question type should be: ${questionType}.
        ${questionTypeInstructions}
        
        ${categoriesStr}
        ${challengeAreasStr}
        
        Guidelines for difficulty level ${difficultyLevel}/10:
        - Vocabulary should be ${difficultyLevel <= 3 ? 'basic and common' : difficultyLevel <= 6 ? 'intermediate' : 'advanced'}
        - Grammar should be ${difficultyLevel <= 3 ? 'simple present tense mostly' : difficultyLevel <= 6 ? 'include past tenses and modal verbs' : 'include complex verb forms and conditionals'}
        - Sentence structure should be ${difficultyLevel <= 3 ? 'simple' : difficultyLevel <= 6 ? 'compound' : 'complex with subordinate clauses'}
        
        Guidelines for complexity level ${complexityLevel}/10:
        - Practice format should be ${complexityLevel <= 3 ? 'straightforward with direct questions' : complexityLevel <= 6 ? 'include some contextual elements' : 'situated in complex scenarios'}
        - Cognitive load should be low to match the complexity level
        
        Return your response in JSON format with the following structure:
        {
          "content": "the practice content in Dutch",
          "translation": "English translation of the content if applicable",
          "categories": ["category1", "category2"], // 2-3 relevant categories
          "questionType": "${questionType}" // Include this field with the question type
          ${responseFormatInstructions}
        }
      `;
    }

    console.log('Making OpenAI API request with key:', OPENAI_API_KEY.substring(0, 10) + '...');
    
    // Make API call to OpenAI
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo', // Using gpt-3.5-turbo as it's more widely available
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('OpenAI API response status:', response.status);
    
    // Parse the AI response
    const aiResponse = response.data.choices[0].message.content;
    try {
      const parsedResponse = JSON.parse(aiResponse);
      
      // If this is a multiple-choice question, shuffle the options
      if (params.questionType === 'multiple-choice' && parsedResponse.options && Array.isArray(parsedResponse.options) && parsedResponse.options.length > 0) {
        const correctAnswer = parsedResponse.options[0];
        const shuffledOptions = [...parsedResponse.options];
        
        // Fisher-Yates shuffle algorithm
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        parsedResponse.options = shuffledOptions;
        // Store the correct answer index
        parsedResponse.correctAnswerIndex = shuffledOptions.indexOf(correctAnswer);
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', aiResponse);
      throw new Error('Failed to parse AI response');
    }
  } catch (error: any) {
    console.error('Error in AI practice generation:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Return fallback content if API fails
    if (params.action === 'evaluate') {
      return {
        isCorrect: false,
        feedback: 'Sorry, we could not evaluate your answer at this time.',
        content: '',
        categories: [],
        questionType: params.questionType || 'open-ended'
      };
    } else {
      return {
        content: 'Hallo, hoe gaat het met je?',
        translation: 'Hello, how are you?',
        categories: ['greetings', 'basic conversation'],
        questionType: params.questionType || 'open-ended'
      };
    }
  }
}; 