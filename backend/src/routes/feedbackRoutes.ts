import express from 'express';
import { 
  submitQuestionFeedback, 
  submitGeneralFeedback, 
  getUserFeedbackHistory 
} from '../controllers/feedbackController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All feedback routes require authentication
router.use(protect);

// Question feedback routes
router.post('/question', submitQuestionFeedback);

// General feedback routes
router.post('/general', submitGeneralFeedback);
router.get('/history', getUserFeedbackHistory);

export default router; 