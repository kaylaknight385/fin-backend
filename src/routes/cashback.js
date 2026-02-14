import express from 'express';
import {
    getCashbackRewards,
    getTotalCashback,
    getCashbackByPlatform,
} from '../controllers/cashbackController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getCashbackRewards);
router.get('/total', authenticateToken, getTotalCashback);
router.get('/platform/:platform', authenticateToken, getCashbackByPlatform);

export default router;