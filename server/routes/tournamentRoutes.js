// server/routes/tournamentRoutes.js
const express = require('express');
const router = express.Router();
const TournamentController = require('../controllers/tournamentController');
const { requireSuperAdmin } = require('../middleware/auth');

router.get('/', TournamentController.getAll);
router.get('/:id', TournamentController.getOne);
router.post('/', requireSuperAdmin, TournamentController.create);
router.put('/:id', requireSuperAdmin, TournamentController.update);
router.put('/', requireSuperAdmin, TournamentController.update);
router.delete('/:id', requireSuperAdmin, TournamentController.delete);
router.delete('/', requireSuperAdmin, TournamentController.delete);

router.post('/assign-admin', requireSuperAdmin, TournamentController.assignAdmin);
router.post('/remove-admin', requireSuperAdmin, TournamentController.removeAdmin);

module.exports = router;

