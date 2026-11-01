// server/controllers/playerController.js
const Player = require('../models/Player');

class PlayerController {
  static async getByTournament(req, res) {
    const tournamentId = req.params.tournament_id || req.query.tournament_id;

    if (!tournamentId) {
      return res.status(400).json({ error: 'tournament_id is required' });
    }

    try {
      const players = await Player.findByTournament(tournamentId);
      return res.json(players);
    } catch (err) {
      console.error('[PlayerController.getByTournament]', err);
      return res.status(500).json({ error: 'Failed to retrieve players' });
    }
  }

  static async create(req, res) {
    const { tournament_id, name, title, sex, batch, rating } = req.body;

    if (!tournament_id || !name) {
      return res.status(400).json({ error: 'tournament_id and name are required' });
    }

    try {
      const created = await Player.create({
        tournament_id,
        name: name.trim(),
        title: (title || '').trim(),
        sex: (sex || '').trim(),
        batch: (batch || '').trim(),
        rating: parseInt(rating, 10) || 1200,
      });

      return res.status(201).json(created);
    } catch (err) {
      console.error('[PlayerController.create]', err);
      return res.status(400).json({ error: 'Player name already exists in this tournament' });
    }
  }

  static async update(req, res) {
    const id = parseInt(req.params.id || req.body.id, 10);
    const { name, title, sex, batch, rating, active } = req.body;

    if (!id || !name || rating === undefined || active === undefined) {
      return res.status(400).json({ error: 'id, name, rating, and active are required' });
    }

    try {
      const existing = await Player.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Player not found' });
      }

      const updated = await Player.update(id, {
        name: name.trim(),
        title: (title || '').trim(),
        sex: (sex || '').trim(),
        batch: (batch || '').trim(),
        rating: parseInt(rating, 10),
        active: Number(active),
      });

      return res.json({ success: true, player: updated });
    } catch (err) {
      console.error('[PlayerController.update]', err);
      return res.status(400).json({ error: 'Failed to update player (name might already exist)' });
    }
  }

  static async delete(req, res) {
    const id = parseInt(req.params.id || req.query.id, 10);

    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    try {
      const existing = await Player.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Player not found' });
      }

      await Player.delete(id);
      return res.json({ success: true });
    } catch (err) {
      console.error('[PlayerController.delete]', err);
      return res.status(400).json({ error: 'Failed to delete player' });
    }
  }
}

module.exports = PlayerController;

