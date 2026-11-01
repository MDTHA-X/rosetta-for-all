// server/controllers/adminController.js
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Tournament = require('../models/Tournament');

class AdminController {
  static async getAllAdmins(req, res) {
    try {
      const admins = await Admin.findAll();
      for (const adm of admins) {
        adm.tournaments = await Admin.getAssignedTournaments(adm.id);
        adm.is_super = Number(adm.is_super) === 1;
      }
      return res.json(admins);
    } catch (err) {
      console.error('[AdminController.getAllAdmins]', err);
      return res.status(500).json({ error: 'Failed to fetch admins' });
    }
  }

  static async createAdmin(req, res) {
    const { username, password, is_super, tournament_ids } = req.body;

    const trimmedUsername = (username || '').trim();
    if (!trimmedUsername || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const existing = await Admin.findByUsername(trimmedUsername);
      if (existing) {
        return res.status(400).json({ error: 'An admin with this username already exists' });
      }

      const hash = await bcrypt.hash(password, 10);
      const newAdmin = await Admin.create({
        username: trimmedUsername,
        password_hash: hash,
        is_super: is_super ? 1 : 0,
      });

      if (Array.isArray(tournament_ids)) {
        for (const tId of tournament_ids) {
          await Tournament.assignAdmin(tId, newAdmin.id);
        }
      }

      return res.status(201).json({ success: true, id: newAdmin.id, username: newAdmin.username });
    } catch (err) {
      console.error('[AdminController.createAdmin]', err);
      return res.status(500).json({ error: 'Failed to create admin: ' + err.message });
    }
  }

  static async deleteAdmin(req, res) {
    const id = parseInt(req.params.id || req.query.id, 10);

    if (!id) {
      return res.status(400).json({ error: 'Admin ID is required' });
    }

    if (id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own logged-in account' });
    }

    try {
      const target = await Admin.findById(id);
      if (!target) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      await Admin.delete(id);
      return res.json({ success: true });
    } catch (err) {
      console.error('[AdminController.deleteAdmin]', err);
      return res.status(500).json({ error: 'Failed to delete admin' });
    }
  }
}

module.exports = AdminController;
