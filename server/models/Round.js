// server/models/Round.js
const db = require('../config/db');

class Round {
  static async findByTournament(tournamentId) {
    return await db.fetchAll('SELECT * FROM rounds WHERE tournament_id = ? ORDER BY number ASC', [tournamentId]);
  }

  static async findById(id) {
    return await db.fetch('SELECT * FROM rounds WHERE id = ?', [id]);
  }

  static async getMaxRoundNumber(tournamentId) {
    const row = await db.fetch('SELECT MAX(number) as max_num FROM rounds WHERE tournament_id = ?', [tournamentId]);
    return row?.max_num || 0;
  }

  static async create({ tournament_id, number, status = 'draft' }) {
    const result = await db.query(
      'INSERT INTO rounds (tournament_id, number, status) VALUES (?, ?, ?)',
      [tournament_id, number, status]
    );
    const id = result.insertId || (await db.fetch('SELECT id FROM rounds WHERE tournament_id = ? AND number = ?', [tournament_id, number]))?.id;
    return await this.findById(id);
  }

  static async updateStatus(id, status) {
    return await db.query('UPDATE rounds SET status = ? WHERE id = ?', [status, id]);
  }

  static async delete(id) {
    return await db.query('DELETE FROM rounds WHERE id = ?', [id]);
  }
}

module.exports = Round;
