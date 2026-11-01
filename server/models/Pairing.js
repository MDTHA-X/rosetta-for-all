// server/models/Pairing.js
const db = require('../config/db');

class Pairing {
  static async findByRound(roundId) {
    return await db.fetchAll('SELECT * FROM pairings WHERE round_id = ? ORDER BY board ASC', [roundId]);
  }

  static async findById(id) {
    return await db.fetch('SELECT * FROM pairings WHERE id = ?', [id]);
  }

  static async findWithTournament(id) {
    return await db.fetch(
      `SELECT p.*, r.tournament_id, r.number as round_number, r.status as round_status 
       FROM pairings p 
       JOIN rounds r ON p.round_id = r.id 
       WHERE p.id = ?`,
      [id]
    );
  }

  static async create({ round_id, board, white_id = null, black_id = null, is_bye = 0, bye_for_id = null }) {
    const result = await db.query(
      `INSERT INTO pairings (round_id, board, white_id, black_id, is_bye, bye_for_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [round_id, board, white_id, black_id, is_bye ? 1 : 0, bye_for_id]
    );
    const id = result.insertId || (await db.fetch('SELECT id FROM pairings WHERE round_id = ? AND board = ?', [round_id, board]))?.id;
    return await this.findById(id);
  }

  static async updateResult(id, result) {
    return await db.query('UPDATE pairings SET result = ? WHERE id = ?', [result, id]);
  }

  static async deleteByRound(roundId) {
    return await db.query('DELETE FROM pairings WHERE round_id = ?', [roundId]);
  }

  static async getGamesForTournament(tournamentId, options = {}) {
    let sql = `SELECT p.round_id, r.number as round, p.white_id, p.black_id, p.result, p.is_bye, p.bye_for_id 
               FROM pairings p 
               JOIN rounds r ON p.round_id = r.id 
               WHERE r.tournament_id = ?`;
    const params = [tournamentId];

    if (options.completedOnly) {
      sql += " AND r.status = 'completed'";
    }

    if (options.maxRound) {
      sql += ' AND r.number <= ?';
      params.push(options.maxRound);
    }

    return await db.fetchAll(sql, params);
  }
}

module.exports = Pairing;

