// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'rosetta-jwt-secret-key-2026-super-secure';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Refresh user's is_super status from DB
    const admin = await db.fetch('SELECT id, username, is_super FROM admins WHERE id = ?', [decoded.id]);
    if (admin) {
      req.user = {
        id: admin.id,
        username: admin.username,
        is_super: Number(admin.is_super) === 1,
      };
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

function requireLogin(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  if (!req.user.is_super) {
    return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
  }
  next();
}

async function canManageTournament(adminId, tournamentId) {
  if (!adminId) return false;
  const admin = await db.fetch('SELECT is_super FROM admins WHERE id = ?', [adminId]);
  if (admin && Number(admin.is_super) === 1) return true;

  const t = await db.fetch('SELECT admin_id FROM tournaments WHERE id = ?', [tournamentId]);
  if (t && Number(t.admin_id) === Number(adminId)) return true;

  const assigned = await db.fetch(
    'SELECT id FROM tournament_admins WHERE tournament_id = ? AND admin_id = ?',
    [tournamentId, adminId]
  );
  return !!assigned;
}

async function requireTournamentAdmin(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  // Super Admins have permission to manage all tournaments
  if (req.user.is_super) {
    return next();
  }

  let tournamentId = req.params.tournament_id || req.body.tournament_id || req.query.tournament_id;

  // Resolve tournament_id from pairing_id if present
  if (!tournamentId && (req.body.pairing_id || req.params.pairing_id)) {
    const pId = req.body.pairing_id || req.params.pairing_id;
    const pairing = await db.fetch(
      'SELECT r.tournament_id FROM pairings p JOIN rounds r ON p.round_id = r.id WHERE p.id = ?',
      [pId]
    );
    if (pairing) tournamentId = pairing.tournament_id;
  }

  // Resolve tournament_id from round_id if present
  if (!tournamentId && (req.body.round_id || req.params.round_id)) {
    const rId = req.body.round_id || req.params.round_id;
    const round = await db.fetch('SELECT tournament_id FROM rounds WHERE id = ?', [rId]);
    if (round) tournamentId = round.tournament_id;
  }

  if (!tournamentId) {
    return res.status(400).json({ error: 'tournament_id is required' });
  }

  const canManage = await canManageTournament(req.user.id, tournamentId);
  if (!canManage) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to manage this tournament' });
  }

  next();
}

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken,
  requireLogin,
  requireSuperAdmin,
  canManageTournament,
  requireTournamentAdmin,
};
