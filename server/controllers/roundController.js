// server/controllers/roundController.js
const Round = require('../models/Round');
const Pairing = require('../models/Pairing');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const { pairRound } = require('../services/pairingEngine');
const { computeStandings } = require('../services/scoringEngine');

class RoundController {
  static async getByTournament(req, res) {
    const tournamentId = req.params.tournament_id || req.query.tournament_id;

    if (!tournamentId) {
      return res.status(400).json({ error: 'tournament_id is required' });
    }

    try {
      const rounds = await Round.findByTournament(tournamentId);
      for (const r of rounds) {
        r.pairings = await Pairing.findByRound(r.id);
      }

      if (req.query.standings !== undefined) {
        const players = await Player.findByTournament(tournamentId);
        const options = { completedOnly: true };

        if (req.query.after_round) {
          options.maxRound = parseInt(req.query.after_round, 10);
        }

        const games = await Pairing.getGamesForTournament(tournamentId, options);
        const standings = computeStandings(players, games);
        return res.json({ rounds, standings });
      }

      return res.json(rounds);
    } catch (err) {
      console.error('[RoundController.getByTournament]', err);
      return res.status(500).json({ error: 'Failed to retrieve rounds' });
    }
  }

  static async generate(req, res) {
    const { tournament_id } = req.body;

    if (!tournament_id) {
      return res.status(400).json({ error: 'tournament_id is required' });
    }

    try {
      const tournament = await Tournament.findById(tournament_id);
      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      const players = await Player.findActiveByTournament(tournament_id);
      if (players.length < 2) {
        return res.status(400).json({ error: 'At least 2 active players are required to pair a round' });
      }

      const games = await Pairing.getGamesForTournament(tournament_id);
      const maxNum = await Round.getMaxRoundNumber(tournament_id);
      const nextNumber = maxNum + 1;

      if (nextNumber > tournament.rounds_count) {
        return res.status(400).json({ error: 'Tournament has reached maximum rounds' });
      }

      const plans = pairRound(players, games);
      const createdRound = await Round.create({
        tournament_id,
        number: nextNumber,
        status: 'draft',
      });

      for (const plan of plans) {
        await Pairing.create({
          round_id: createdRound.id,
          board: plan.board,
          white_id: plan.whiteId,
          black_id: plan.blackId,
          is_bye: plan.isBye ? 1 : 0,
          bye_for_id: plan.byeForId,
        });
      }

      return res.status(201).json({ success: true, round_id: createdRound.id, round: createdRound });
    } catch (err) {
      console.error('[RoundController.generate]', err);
      return res.status(400).json({ error: err.message || 'Failed to generate pairings' });
    }
  }

  static async complete(req, res) {
    const { round_id } = req.body;

    if (!round_id) {
      return res.status(400).json({ error: 'round_id is required' });
    }

    try {
      const round = await Round.findById(round_id);
      if (!round) {
        return res.status(404).json({ error: 'Round not found' });
      }

      await Round.updateStatus(round_id, 'completed');
      return res.json({ success: true });
    } catch (err) {
      console.error('[RoundController.complete]', err);
      return res.status(500).json({ error: 'Failed to complete round' });
    }
  }

  static async delete(req, res) {
    const round_id = req.params.round_id || req.body.round_id || req.query.round_id;

    if (!round_id) {
      return res.status(400).json({ error: 'round_id is required' });
    }

    try {
      const round = await Round.findById(round_id);
      if (!round) {
        return res.status(404).json({ error: 'Round not found' });
      }

      await Pairing.deleteByRound(round_id);
      await Round.delete(round_id);
      return res.json({ success: true });
    } catch (err) {
      console.error('[RoundController.delete]', err);
      return res.status(500).json({ error: 'Failed to delete round' });
    }
  }

  static async reopen(req, res) {
    const { round_id } = req.body;

    if (!round_id) {
      return res.status(400).json({ error: 'round_id is required' });
    }

    try {
      const round = await Round.findById(round_id);
      if (!round) {
        return res.status(404).json({ error: 'Round not found' });
      }

      await Round.updateStatus(round_id, 'draft');
      return res.json({ success: true });
    } catch (err) {
      console.error('[RoundController.reopen]', err);
      return res.status(500).json({ error: 'Failed to reopen round' });
    }
  }

  static async setPairingResult(req, res) {
    const { pairing_id, result } = req.body;

    if (!pairing_id || !result) {
      return res.status(400).json({ error: 'pairing_id and result are required' });
    }

    try {
      const pairing = await Pairing.findWithTournament(pairing_id);
      if (!pairing) {
        return res.status(404).json({ error: 'Pairing not found' });
      }

      await Pairing.updateResult(pairing_id, result);
      return res.json({ success: true });
    } catch (err) {
      console.error('[RoundController.setPairingResult]', err);
      return res.status(500).json({ error: 'Failed to update pairing result' });
    }
  }
}

module.exports = RoundController;
