import express from 'express';
import { chatWithNotes, getChatHistory, clearChatHistory, getActiveChats } from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/active', protect, getActiveChats);
router.get('/:materialId', protect, getChatHistory);
router.post('/', protect, chatWithNotes);
router.delete('/:materialId', protect, clearChatHistory);

export default router;
