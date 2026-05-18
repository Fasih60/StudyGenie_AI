import express from 'express';
import { generatePlanner, getLatestPlanner, markPlannerAsDone } from '../controllers/plannerController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/generate', protect, generatePlanner);
router.get('/', protect, getLatestPlanner);
router.put('/:id/done', protect, markPlannerAsDone);

export default router;
