import express from 'express';
import { getHealth, getStats, resetData } from '../controllers/systemController.js';

const router = express.Router();

router.get('/health', getHealth);
router.get('/stats', getStats);
router.post('/dev/reset', resetData);

export default router;
