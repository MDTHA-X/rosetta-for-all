// server/controllers/tournamentController.js
const Tournament = require('../models/Tournament');
const Admin = require('../models/Admin');
const { canManageTournament } = require('../middleware/auth');

class TournamentController {
  static async getAll(req, res) {
    try {
      const tournaments = await Tournament.findAll();
      const currentUserId = req.user?.id || null;

      for (const t of tournaments) {
        t.can_manage = currentUserId ? await canManageTournament(currentUserId, t.id) : false;
      }
      return res.json(tournaments);
    } catch (err) {
      console.error('[TournamentController.getAll]', err);
      return res.status(500).json({ error: 'Failed to retrieve tournaments' });
    }
  }

  static async getOne(req, res) {
    const id = req.params.id || req.query.id;
    const slug = req.params.slug || req.query.slug;

    try {
      let tournament = null;
      if (slug) {
        tournament = await Tournament.findBySlug(slug);
      } else if (id) {
        tournament = await Tournament.findById(id);
      }

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      const currentUserId = req.user?.id || null;
      tournament.can_manage = currentUserId ? await canManageTournament(currentUserId, tournament.id) : false;
      tournament.admins = await Tournament.getAdmins(tournament.id);

      return res.json(tournament);
    } catch (err) {
      console.error('[TournamentController.getOne]', err);
      return res.status(500).json({ error: 'Failed to retrieve tournament' });
    }
  }

  static async create(req, res) {
    const { name, slug, type, time_control, rounds_count } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    try {
      const existing = await Tournament.findBySlug(slug);
      if (existing) {
        return res.status(400).json({ error: 'Slug already exists' });
      }

      const created = await Tournament.create({
        name,
        slug,
        type: type || 'intradept',
        time_control: time_control || '10+5',
        rounds_count: rounds_count || 7,
        admin_id: req.user.id,
      });

      created.can_manage = true;
      return res.status(201).json(created);
    } catch (err) {
      console.error('[TournamentController.create]', err);
      return res.status(400).json({ error: 'Failed to create tournament: ' + err.message });
    }
  }

  static async update(req, res) {
    const id = parseInt(req.params.id || req.body.id, 10);
    const { name, time_control, rounds_count, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Tournament ID is required' });
    }
    if (!name) {
      return res.status(400).json({ error: 'Tournament name is required' });
    }

    try {
      const updated = await Tournament.update(id, {
        name: name.trim(),
        time_control: (time_control || '10+5').trim(),
        rounds_count: parseInt(rounds_count, 10) || 7,
        status: (status || 'active').trim(),
      });

      if (!updated) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      updated.can_manage = true;
      return res.json(updated);
    } catch (err) {
      console.error('[TournamentController.update]', err);
      return res.status(500).json({ error: 'Failed to update tournament' });
    }
  }

  static async delete(req, res) {
    const id = parseInt(req.params.id || req.query.id, 10);

    if (!id) {
      return res.status(400).json({ error: 'Tournament ID is required' });
    }

    try {
      await Tournament.delete(id);
      return res.json({ success: true });
    } catch (err) {
      console.error('[TournamentController.delete]', err);
      return res.status(500).json({ error: 'Failed to delete tournament' });
    }
  }

  static async assignAdmin(req, res) {
    const { tournament_id, admin_id } = req.body;

    if (!tournament_id || !admin_id) {
      return res.status(400).json({ error: 'Tournament ID and Admin ID are required' });
    }

    try {
      const targetAdm = await Admin.findById(admin_id);
      if (targetAdm && Number(targetAdm.is_super) === 1) {
        return res.status(400).json({ error: 'Super Admins already have access to all tournaments by default' });
      }

      await Tournament.assignAdmin(tournament_id, admin_id);
      return res.json({ success: true });
    } catch (err) {
      console.error('[TournamentController.assignAdmin]', err);
      return res.status(500).json({ error: 'Failed to assign admin' });
    }
  }

  static async removeAdmin(req, res) {
    const { tournament_id, admin_id } = req.body;

    if (!tournament_id || !admin_id) {
      return res.status(400).json({ error: 'Tournament ID and Admin ID are required' });
    }

    try {
      await Tournament.removeAdmin(tournament_id, admin_id);
      return res.json({ success: true });
    } catch (err) {
      console.error('[TournamentController.removeAdmin]', err);
      return res.status(500).json({ error: 'Failed to remove admin' });
    }
  }
}

module.exports = TournamentController;
