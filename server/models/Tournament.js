// server/models/Tournament.js
const db = require('../config/db');

class Tournament {
  static async findAll() {
    return await db.fetchAll('SELECT * FROM tournaments ORDER BY created_at DESC');
  }

  static async findById(id) {
    return await db.fetch('SELECT * FROM tournaments WHERE id = ?', [id]);
  }

  static async findBySlug(slug) {
    return await db.fetch('SELECT * FROM tournaments WHERE slug = ?', [slug]);
  }

  static async create({ name, slug, type = 'intradept', time_control = '10+5', rounds_count = 7, admin_id = null }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const result = await db.query(
      `INSERT INTO tournaments (name, slug, type, time_control, rounds_count, default_rating, status, admin_id, created_at) 
       VALUES (?, ?, ?, ?, ?, 1200, 'active', ?, ?)`,
      [name, slug, type, time_control, rounds_count, admin_id, timestamp]
    );
    const id = result.insertId || (await db.fetch('SELECT id FROM tournaments WHERE slug = ?', [slug]))?.id;
    return await this.findById(id);
  }

  static async update(id, { name, time_control, rounds_count, status }) {
    await db.query(
      'UPDATE tournaments SET name = ?, time_control = ?, rounds_count = ?, status = ? WHERE id = ?',
      [name, time_control, rounds_count, status, id]
    );
    return await this.findById(id);
  }

  static async delete(id) {
    return await db.query('DELETE FROM tournaments WHERE id = ?', [id]);
  }

  static async getAdmins(tournamentId) {
    return await db.fetchAll(
      `SELECT a.id, a.username, a.is_super 
       FROM tournament_admins ta 
       JOIN admins a ON ta.admin_id = a.id 
       WHERE ta.tournament_id = ? AND (a.is_super = 0 OR a.is_super IS NULL)`,
      [tournamentId]
    );
  }

  static async assignAdmin(tournamentId, adminId) {
    const timestamp = Math.floor(Date.now() / 1000);
    return await db.query(
      'INSERT OR IGNORE INTO tournament_admins (tournament_id, admin_id, created_at) VALUES (?, ?, ?)',
      [tournamentId, adminId, timestamp]
    );
  }

  static async removeAdmin(tournamentId, adminId) {
    return await db.query(
      'DELETE FROM tournament_admins WHERE tournament_id = ? AND admin_id = ?',
      [tournamentId, adminId]
    );
  }
}

module.exports = Tournament;

