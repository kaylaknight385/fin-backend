import express from 'express';
import {
    getBudget,
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    recalculateBudgets
} from '../controllers/budgetController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/recalculate', authenticateToken, recalculateBudgets);
router.get('/', authenticateToken, getBudgets);
router.post('/:id', authenticateToken, createBudget);
router.get('/', authenticateToken, getBudget);
router.put('/:id', authenticateToken, updateBudget);
router.delete('/:id', authenticateToken, deleteBudget);

export default router;