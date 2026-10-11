import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  refresh,
  getMe,
  updateMe,
  updatePassword,
  getUsers,
  getUserById
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

// Protected endpoints
router.post('/logout', authenticateToken(true), logout);
router.post('/refresh', authenticateToken(true), refreshToken || refresh);
router.get('/me', authenticateToken(true), getMe);
router.patch('/me', authenticateToken(true), updateMe);
router.patch('/me/password', authenticateToken(true), updatePassword);

// Users directory endpoints
router.get('/users', getUsers);
router.get('/users/:id', getUserById);

export default router;
