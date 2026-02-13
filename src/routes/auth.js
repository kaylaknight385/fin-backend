import express from 'express';
import {signup, login, getMe, logout } from '../middleware/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

export default router;
