import express from 'express';
import { chatWithAI, getConversationHistory, clearConversationHistory } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// main routes
router.post('/chat', authenticateToken, chatWithAI);
router.get('/history', authenticateToken, getConversationHistory);
router.delete('/history', authenticateToken, clearConversationHistory);

export default router;
