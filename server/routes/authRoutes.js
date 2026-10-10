import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateMe,
  updatePassword,
  getUsers,
  getUserById
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoints
router.post('/register', register);
router.post('/login', login);

// Protected endpoints
router.post('/logout', authenticateToken(true), logout);
router.post('/refresh', authenticateToken(true), refreshToken);
router.get('/me', authenticateToken(true), getMe);
router.patch('/me', authenticateToken(true), updateMe);
router.patch('/me/password', authenticateToken(true), updatePassword);

// Users directory endpoints
router.get('/users', getUsers);
router.get('/users/:id', getUserById);

export default router;
