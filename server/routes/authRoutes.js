import express from 'express';
import { register, login, getMe, getUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public endpoints
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

// Protected endpoints
router.get('/me', authenticateToken(true), getMe);
router.get('/users', getUsers);

export default router;
