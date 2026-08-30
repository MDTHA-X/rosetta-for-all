import express from 'express';
import { getBoardConfig, updateBoardConfig } from '../controllers/boardController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/config', authenticateToken(true), getBoardConfig);
router.patch('/config', authenticateToken(true), updateBoardConfig);

export default router;
