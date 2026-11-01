// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { requireLogin } = require('../middleware/auth');

// Authentication routes
// Rate limited to 10 requests per 3 minutes as requested
router.post('/login', authRateLimiter, AuthController.login);
router.get('/me', AuthController.getCurrentUser);
router.post('/logout', AuthController.logout);
router.put('/change-password', requireLogin, AuthController.changePassword);

module.exports = router;
