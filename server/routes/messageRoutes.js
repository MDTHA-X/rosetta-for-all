import express from 'express';
import { getMessages, getMessageById, createMessage, updateMessage, deleteMessage } from '../controllers/messageController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken(true), getMessages);
router.get('/:id', authenticateToken(true), getMessageById);
router.post('/', authenticateToken(true), createMessage);
router.patch('/:id', authenticateToken(true), updateMessage);
router.delete('/:id', authenticateToken(true), deleteMessage);

export default router;
