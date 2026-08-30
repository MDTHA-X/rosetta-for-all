import express from 'express';
import { getChannels, getUnreadChannels, getChannelById, createChannel, updateChannel, deleteChannel, markChannelRead } from '../controllers/channelController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getChannels);
router.post('/', authenticateToken(true), createChannel);
router.get('/unread', authenticateToken(true), getUnreadChannels);
router.get('/:id', getChannelById);
router.patch('/:id', authenticateToken(true), updateChannel);
router.delete('/:id', authenticateToken(true), deleteChannel);
router.post('/:id/read', authenticateToken(true), markChannelRead);

export default router;
