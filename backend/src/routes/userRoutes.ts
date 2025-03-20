import express from 'express';
import { setUserPreferences, getUserPreferences, getUserProfile, initializeProgress } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All user routes should be protected
router.use(protect);

// Initialize user progress
router.post('/progress/initialize', initializeProgress);

// User preferences routes
router.post('/preferences', setUserPreferences);
router.get('/preferences', getUserPreferences);

// User profile route
router.get('/profile', getUserProfile);

export default router; 