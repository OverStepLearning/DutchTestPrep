import express from 'express';
import { generatePractice, submitAnswer, getPracticeHistory } from '../controllers/practiceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All practice routes should be protected
router.use(protect);

// Practice routes
router.post('/generate', generatePractice);
router.post('/submit', submitAnswer);
router.get('/history/:userId', getPracticeHistory);

export default router; 