// server/models/Player.js
const db = require('../config/db');

class Player {
  static async findByTournament(tournamentId) {
    return await db.fetchAll('SELECT * FROM players WHERE tournament_id = ? ORDER BY name ASC', [tournamentId]);
  }

  static async findActiveByTournament(tournamentId) {
    return await db.fetchAll('SELECT * FROM players WHERE tournament_id = ? AND active = 1', [tournamentId]);
  }

  static async findById(id) {
    return await db.fetch('SELECT * FROM players WHERE id = ?', [id]);
  }

  static async create({ tournament_id, name, title = '', sex = '', batch = '', rating = 1200 }) {
    const result = await db.query(
      `INSERT INTO players (tournament_id, name, title, sex, batch, rating, rating_type, active) 
       VALUES (?, ?, ?, ?, ?, ?, 'manual', 1)`,
      [tournament_id, name, title, sex, batch, rating]
    );
    const id = result.insertId || (await db.fetch('SELECT id FROM players WHERE tournament_id = ? AND name = ?', [tournament_id, name]))?.id;
    return await this.findById(id);
  }

  static async update(id, { name, title = '', sex = '', batch = '', rating, active }) {
    await db.query(
      'UPDATE players SET name = ?, title = ?, sex = ?, batch = ?, rating = ?, active = ? WHERE id = ?',
      [name, title, sex, batch, rating, active, id]
    );
    return await this.findById(id);
  }

  static async delete(id) {
    return await db.query('DELETE FROM players WHERE id = ?', [id]);
  }
}

module.exports = Player;

