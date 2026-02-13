import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    updateUserBalance,
    deleteUser
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authenticateToken, getUserProfile);
router.put('/:id', authenticateToken, updateUserProfile);
router.patch('/:id/balance', authenticateToken, updateUserProfile);
router.delete('/:id', authtenticateToken, deleteUser);

export default router;