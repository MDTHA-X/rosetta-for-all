import express from 'express';
import { register, login, logout, refresh, getMe, updateMe, updatePassword, getUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', authenticateToken(true), logout);
router.post('/refresh', authenticateToken(true), refresh);
router.get('/me', authenticateToken(true), getMe);
router.patch('/me', authenticateToken(true), updateMe);
router.patch('/me/password', authenticateToken(true), updatePassword);
router.get('/users', getUsers);

export default router;
