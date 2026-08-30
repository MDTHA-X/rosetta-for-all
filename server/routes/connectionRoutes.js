import express from 'express';
import { getConnections, requestConnection, updateConnection, deleteConnection } from '../controllers/connectionController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken(true), getConnections);
router.post('/request', authenticateToken(true), requestConnection);
router.patch('/:id', authenticateToken(true), updateConnection);
router.delete('/:id', authenticateToken(true), deleteConnection);

export default router;
