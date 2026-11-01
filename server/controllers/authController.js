// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');

class AuthController {
  static async login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const admin = await Admin.findByUsername(username);
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password using bcrypt
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({
        id: admin.id,
        username: admin.username,
        is_super: Number(admin.is_super) === 1,
      });

      return res.json({
        success: true,
        token,
        user: {
          id: admin.id,
          username: admin.username,
          is_super: Number(admin.is_super) === 1,
        },
      });
    } catch (err) {
      console.error('[AuthController.login]', err);
      return res.status(500).json({ error: 'Server error during authentication' });
    }
  }

  static async getCurrentUser(req, res) {
    if (req.user && req.user.id) {
      return res.json({
        logged_in: true,
        id: req.user.id,
        username: req.user.username,
        is_super: req.user.is_super,
      });
    }
    return res.json({ logged_in: false });
  }

  static async logout(req, res) {
    return res.json({ success: true, message: 'Logged out successfully' });
  }

  static async changePassword(req, res) {
    const adminId = req.user.id;
    const { old_password, new_password, confirm_password } = req.body;

    if (!old_password) {
      return res.status(400).json({ error: 'Current password is required' });
    }
    if (!new_password) {
      return res.status(400).json({ error: 'New password cannot be empty' });
    }
    if (new_password !== (confirm_password || new_password)) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    try {
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Fetch password hash
      const fullAdmin = await Admin.findByUsername(admin.username);
      const isMatch = await bcrypt.compare(old_password, fullAdmin.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const newHash = await bcrypt.hash(new_password, 10);
      await Admin.updatePassword(adminId, newHash);

      return res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      console.error('[AuthController.changePassword]', err);
      return res.status(500).json({ error: 'Failed to update password' });
    }
  }
}

module.exports = AuthController;
