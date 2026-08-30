import express from 'express';
import { register, login, logout, refresh, getMe, updateMe, updatePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken(true), logout);
router.post('/refresh', authenticateToken(true), refresh);
router.get('/me', authenticateToken(true), getMe);
router.patch('/me', authenticateToken(true), updateMe);
router.patch('/me/password', authenticateToken(true), updatePassword);

export default router;
