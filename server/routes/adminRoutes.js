// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { requireLogin, requireSuperAdmin } = require('../middleware/auth');

router.get('/', requireLogin, AdminController.getAllAdmins);
router.post('/', requireSuperAdmin, AdminController.createAdmin);
router.delete('/:id', requireSuperAdmin, AdminController.deleteAdmin);
router.delete('/', requireSuperAdmin, AdminController.deleteAdmin);

module.exports = router;

