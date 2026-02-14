import express from 'express';
import {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticateToken, getTransactionStats);
router.get('/', authenticateToken, getTransactions);
router.get('/:id, authenticateToken, getTransaction');
router.post('/', authenticateToken, createTransaction);
router.put('/:id', authenticateToken, updateTransaction);
router.delete('/:id', authenticateToken, deleteTransaction);

export default router;