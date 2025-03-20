import express from 'express';
import { getExample, postExample } from '../controllers/exampleController';

const router = express.Router();

// Use the controller functions
router.get('/', getExample);
router.post('/test', postExample);

export default router;