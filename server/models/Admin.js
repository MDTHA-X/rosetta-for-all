// server/models/Admin.js
const db = require('../config/db');

class Admin {
  static async findByUsername(username) {
    return await db.fetch('SELECT * FROM admins WHERE username = ?', [username]);
  }

  static async findById(id) {
    return await db.fetch('SELECT id, username, is_super, created_at FROM admins WHERE id = ?', [id]);
  }

  static async findAll() {
    return await db.fetchAll('SELECT id, username, is_super, created_at FROM admins ORDER BY id ASC');
  }

  static async create({ username, password_hash, is_super = 0 }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const result = await db.query(
      'INSERT INTO admins (username, password_hash, is_super, created_at) VALUES (?, ?, ?, ?)',
      [username, password_hash, is_super ? 1 : 0, timestamp]
    );
    const id = result.insertId || (await db.fetch('SELECT id FROM admins WHERE username = ?', [username]))?.id;
    return { id, username, is_super: !!is_super, created_at: timestamp };
  }

  static async updatePassword(id, password_hash) {
    return await db.query('UPDATE admins SET password_hash = ? WHERE id = ?', [password_hash, id]);
  }

  static async delete(id) {
    return await db.query('DELETE FROM admins WHERE id = ?', [id]);
  }

  static async getAssignedTournaments(adminId) {
    return await db.fetchAll(
      `SELECT t.id, t.name, t.slug 
       FROM tournament_admins ta 
       JOIN tournaments t ON ta.tournament_id = t.id 
       WHERE ta.admin_id = ?`,
      [adminId]
    );
  }
}

module.exports = Admin;
