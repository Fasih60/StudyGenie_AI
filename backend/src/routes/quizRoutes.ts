import express from 'express';
import { generateQuiz, submitQuizScore, getQuizzes } from '../controllers/quizController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/generate', protect, generateQuiz);
router.post('/submit', protect, submitQuizScore);
router.get('/', protect, getQuizzes);

export default router;
