import express from 'express';
import { getCards, createCard, updateCard, deleteCard } from '../controllers/cardController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected CRUD operations (accessible by authenticated 'User' and 'Admin')
router.get('/', authenticateToken(true), getCards);
router.post('/', authenticateToken(true), createCard);
router.patch('/:id', authenticateToken(true), updateCard);

// Restricted operation: Only users with 'Admin' role can delete cards (RBAC)
router.delete('/:id', authenticateToken(true), authorizeRoles('Admin'), deleteCard);

export default router;

